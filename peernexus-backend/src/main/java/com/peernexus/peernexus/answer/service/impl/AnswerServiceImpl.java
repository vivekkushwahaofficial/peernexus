package com.peernexus.peernexus.answer.service.impl;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.answer.dto.AnswerCreateRequest;
import com.peernexus.peernexus.answer.dto.AnswerResponse;
import com.peernexus.peernexus.answer.dto.AnswerUpdateRequest;
import com.peernexus.peernexus.answer.dto.VoteRequest;
import com.peernexus.peernexus.answer.entity.Answer;
import com.peernexus.peernexus.answer.entity.Vote;
import com.peernexus.peernexus.answer.entity.VoteType;
import com.peernexus.peernexus.answer.mapper.AnswerMapper;
import com.peernexus.peernexus.answer.repository.AnswerRepository;
import com.peernexus.peernexus.answer.repository.VoteRepository;
import com.peernexus.peernexus.doubt.entity.Doubt;
import com.peernexus.peernexus.doubt.entity.DoubtStatus;
import com.peernexus.peernexus.doubt.repository.DoubtRepository;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.reputation.service.ReputationService;
import com.peernexus.peernexus.notification.entity.NotificationType;
import com.peernexus.peernexus.notification.service.NotificationService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements com.peernexus.peernexus.answer.service.AnswerService {

    private final AnswerRepository answerRepository;
    private final VoteRepository voteRepository;
    private final DoubtRepository doubtRepository;
    private final UserRepository userRepository;
    private final AnswerMapper answerMapper;
    private final ReputationService reputationService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public AnswerResponse create(AnswerCreateRequest request) {
        User author = resolveCurrentUser();
        Doubt doubt = doubtRepository.findById(request.doubtId())
                .orElseThrow(() -> new ResourceNotFoundException("Doubt not found"));

        Answer answer = Answer.builder()
                .content(request.content())
                .doubt(doubt)
                .author(author)
                .accepted(false)
                .build();
        Answer saved = answerRepository.save(answer);
        reputationService.recordAnswerPosted(author, saved.getId());

        // Notify the doubt owner about the new answer
        try {
            if (!doubt.getAuthor().getId().equals(author.getId())) {
                notificationService.createNotification(
                        doubt.getAuthor(), author,
                        NotificationType.NEW_ANSWER,
                        author.getName() + " answered your doubt: " + doubt.getTitle(),
                        "ANSWER", saved.getId()
                );
            }
        } catch (Exception ex) {
            // Non-fatal
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AnswerResponse update(Long id, AnswerUpdateRequest request) {
        Answer answer = getOwnedAnswer(id);
        answer.setContent(request.content());
        return toResponse(answerRepository.save(answer));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Answer answer = getOwnedAnswer(id);
        answerRepository.delete(answer);
    }

    @Override
    @Transactional(readOnly = true)
    public AnswerResponse getById(Long id) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
        return toResponse(answer);
    }

    /**
     * Returns a page of answers for the given doubt.
     *
     * <p><strong>Optimization:</strong> vote counts for the entire page are
     * fetched in a single aggregate query via
     * {@link AnswerRepository#countVotesByAnswerIds(List)} instead of issuing
     * 2 × N individual {@code countByAnswerIdAndType} calls.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AnswerResponse> getByDoubt(Long doubtId, Pageable pageable) {
        Page<Answer> page = answerRepository.findByDoubtId(doubtId, pageable);

        // Collect all answer IDs on this page for bulk vote aggregation
        List<Long> ids = page.stream().map(Answer::getId).toList();

        // One query: SELECT answer_id, type, COUNT(*) GROUP BY answer_id, type
        Map<Long, Long> upvoteMap;
        Map<Long, Long> downvoteMap;
        if (ids.isEmpty()) {
            upvoteMap = Collections.emptyMap();
            downvoteMap = Collections.emptyMap();
        } else {
            List<Object[]> rows = answerRepository.countVotesByAnswerIds(ids);
            upvoteMap = rows.stream()
                    .filter(r -> VoteType.UPVOTE.name().equals(String.valueOf(r[1])))
                    .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[2]));
            downvoteMap = rows.stream()
                    .filter(r -> VoteType.DOWNVOTE.name().equals(String.valueOf(r[1])))
                    .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[2]));
        }

        return page.map(answer -> toResponseWithCounts(answer,
                upvoteMap.getOrDefault(answer.getId(), 0L).intValue(),
                downvoteMap.getOrDefault(answer.getId(), 0L).intValue()));
    }

    @Override
    @Transactional
    public AnswerResponse acceptAnswer(Long id) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
        User currentUser = resolveCurrentUser();
        if (!answer.getDoubt().getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the doubt author can accept answers");
        }
        boolean wasAccepted = answer.isAccepted();
        for (Answer existing : answerRepository.findByDoubtIdAndAcceptedTrue(answer.getDoubt().getId())) {
            existing.setAccepted(false);
            existing.setAcceptedAt(null);
            answerRepository.save(existing);
        }
        answer.setAccepted(true);
        answer.setAcceptedAt(Instant.now());
        Doubt doubt = answer.getDoubt();
        doubt.setStatus(DoubtStatus.ANSWERED);
        doubtRepository.save(doubt);
        Answer saved = answerRepository.save(answer);
        if (!wasAccepted) {
            reputationService.recordAnswerAccepted(currentUser, saved.getAuthor(), saved.getId());
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AnswerResponse vote(Long id, VoteRequest request) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
        User voter = resolveCurrentUser();

        Vote vote = voteRepository.findByAnswerIdAndUserId(id, voter.getId()).orElse(null);
        VoteType previousType = vote != null ? vote.getType() : null;
        VoteType nextType;
        if (vote == null) {
            vote = Vote.builder()
                    .answer(answer)
                    .user(voter)
                    .type(request.type())
                    .build();
            voteRepository.save(vote);
            nextType = request.type();
        } else if (vote.getType() == request.type()) {
            voteRepository.delete(vote);
            nextType = null;
        } else {
            vote.setType(request.type());
            voteRepository.save(vote);
            nextType = request.type();
        }

        reputationService.recordDailyActivity(voter, "VOTE");
        reputationService.applyVoteChange(answer.getAuthor(), previousType, nextType, answer.getId());

        // Notify answer owner on upvote (only when newly upvoting, not toggling off)
        if (nextType == VoteType.UPVOTE && previousType != VoteType.UPVOTE) {
            try {
                notificationService.createNotification(
                        answer.getAuthor(), voter,
                        NotificationType.NEW_UPVOTE,
                        voter.getName() + " upvoted your answer",
                        "ANSWER", answer.getId()
                );
            } catch (Exception ex) {
                // Non-fatal
            }
        }

        return toResponse(answer);
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    /**
     * Maps a single answer to a response, fetching vote counts individually.
     * Used for create/update/vote operations where a single answer is returned.
     * For list operations, prefer {@link #toResponseWithCounts(Answer, int, int)}.
     */
    private AnswerResponse toResponse(Answer answer) {
        int upvotes = voteRepository.countByAnswerIdAndType(answer.getId(), VoteType.UPVOTE);
        int downvotes = voteRepository.countByAnswerIdAndType(answer.getId(), VoteType.DOWNVOTE);
        return toResponseWithCounts(answer, upvotes, downvotes);
    }

    /**
     * Maps an answer to a response with pre-computed vote counts.
     * Used in {@link #getByDoubt} to avoid 2 × N vote queries per page.
     */
    private AnswerResponse toResponseWithCounts(Answer answer, int upvotes, int downvotes) {
        AnswerResponse response = answerMapper.toResponse(answer);
        return AnswerResponse.builder()
                .id(response.id())
                .doubtId(response.doubtId())
                .content(response.content())
                .accepted(response.accepted())
                .author(response.author())
                .createdAt(response.createdAt())
                .updatedAt(response.updatedAt())
                .upvotes(upvotes)
                .downvotes(downvotes)
                .build();
    }

    // ── Auth helpers ──────────────────────────────────────────────────────────

    private User resolveCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl details) {
            return userRepository.findById(details.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new UnauthorizedException("Unauthorized");
    }

    private Answer getOwnedAnswer(Long id) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));
        User currentUser = resolveCurrentUser();
        if (!answer.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        return answer;
    }
}
