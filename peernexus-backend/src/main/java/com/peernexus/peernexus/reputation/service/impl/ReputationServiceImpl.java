package com.peernexus.peernexus.reputation.service.impl;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.answer.entity.VoteType;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.reputation.dto.LeaderboardEntryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationSummaryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationTransactionResponse;
import com.peernexus.peernexus.reputation.entity.ReputationEventType;
import com.peernexus.peernexus.reputation.entity.ReputationLevel;
import com.peernexus.peernexus.reputation.entity.ReputationTransaction;
import com.peernexus.peernexus.reputation.repository.ReputationTransactionRepository;
import com.peernexus.peernexus.reputation.service.ReputationService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReputationServiceImpl implements ReputationService {

    private static final int ANSWER_POSTED_POINTS = 10;
    private static final int ANSWER_ACCEPTED_POINTS = 20;
    private static final int UPVOTE_POINTS = 2;
    private static final int DOWNVOTE_POINTS = -2;
    private static final int DAILY_ACTIVITY_POINTS = 5;

    private final ReputationTransactionRepository reputationTransactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public ReputationSummaryResponse getSummaryForCurrentUser() {
        User user = resolveCurrentUser();
        return ReputationSummaryResponse.builder()
                .points(user.getReputationPoints())
                .level(user.getReputationLevel())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReputationTransactionResponse> getHistoryForCurrentUser(Pageable pageable) {
        User user = resolveCurrentUser();
        return reputationTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaderboardEntryResponse> getLeaderboard(Pageable pageable) {
        return userRepository.findAllByOrderByReputationPointsDesc(pageable)
                .map(user -> LeaderboardEntryResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .points(user.getReputationPoints())
                .level(user.getReputationLevel())
                .build());
    }

    @Override
    @Transactional
    public void recordAnswerPosted(User author, Long answerId) {
        recordDailyActivity(author, "ANSWER_POSTED");
        applyPoints(author, ReputationEventType.ANSWER_POSTED, ANSWER_POSTED_POINTS, "ANSWER", answerId);
    }

    @Override
    @Transactional
    public void recordAnswerAccepted(User actor, User answerAuthor, Long answerId) {
        recordDailyActivity(actor, "ANSWER_ACCEPTED");
        applyPoints(answerAuthor, ReputationEventType.ANSWER_ACCEPTED, ANSWER_ACCEPTED_POINTS, "ANSWER", answerId);
    }

    @Override
    @Transactional
    public void applyVoteChange(User answerAuthor, VoteType previous, VoteType next, Long answerId) {
        int delta = 0;
        if (previous != null) {
            delta -= pointsFor(previous);
        }
        if (next != null) {
            delta += pointsFor(next);
        }
        if (delta == 0) {
            return;
        }
        ReputationEventType type = delta > 0 ? ReputationEventType.UPVOTE_RECEIVED : ReputationEventType.DOWNVOTE_RECEIVED;
        applyPoints(answerAuthor, type, delta, "ANSWER", answerId);
    }

    private int pointsFor(VoteType type) {
        return type == VoteType.UPVOTE ? UPVOTE_POINTS : DOWNVOTE_POINTS;
    }

    @Override
    @Transactional
    public void recordDailyActivity(User actor, String source) {
        Instant start = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = start.plusSeconds(24 * 60 * 60);
        boolean alreadyAwarded = reputationTransactionRepository.existsByUserIdAndTypeAndCreatedAtBetween(
                actor.getId(),
                ReputationEventType.DAILY_ACTIVITY,
                start,
                end
        );
        if (!alreadyAwarded) {
            applyPoints(actor, ReputationEventType.DAILY_ACTIVITY, DAILY_ACTIVITY_POINTS, "ACTIVITY", null);
        }
    }

    private void applyPoints(User user, ReputationEventType type, int points, String referenceType, Long referenceId) {
        ReputationTransaction transaction = ReputationTransaction.builder()
                .user(user)
                .type(type)
                .points(points)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        reputationTransactionRepository.save(transaction);

        int updatedPoints = user.getReputationPoints() + points;
        user.setReputationPoints(updatedPoints);
        user.setReputationLevel(ReputationLevel.fromPoints(updatedPoints));
        userRepository.save(user);
    }

    private ReputationTransactionResponse toResponse(ReputationTransaction transaction) {
        return ReputationTransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .points(transaction.getPoints())
                .referenceType(transaction.getReferenceType())
                .referenceId(transaction.getReferenceId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }
}
