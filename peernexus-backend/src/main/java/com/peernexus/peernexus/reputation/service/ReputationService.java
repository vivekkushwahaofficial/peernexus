package com.peernexus.peernexus.reputation.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.answer.entity.VoteType;
import com.peernexus.peernexus.reputation.dto.LeaderboardEntryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationSummaryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationTransactionResponse;
import com.peernexus.peernexus.user.entity.User;

public interface ReputationService {

    ReputationSummaryResponse getSummaryForCurrentUser();

    Page<ReputationTransactionResponse> getHistoryForCurrentUser(Pageable pageable);

    Page<LeaderboardEntryResponse> getLeaderboard(Pageable pageable);

    void recordAnswerPosted(User author, Long answerId);

    void recordAnswerAccepted(User actor, User answerAuthor, Long answerId);

    void applyVoteChange(User answerAuthor, VoteType previous, VoteType next, Long answerId);

    void recordDailyActivity(User actor, String source);
}
