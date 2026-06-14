package com.peernexus.peernexus.reputation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.reputation.dto.LeaderboardEntryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationSummaryResponse;
import com.peernexus.peernexus.reputation.dto.ReputationTransactionResponse;
import com.peernexus.peernexus.reputation.service.ReputationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reputation")
@RequiredArgsConstructor
public class ReputationController {

    private final ReputationService reputationService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ReputationSummaryResponse>> summary() {
        ReputationSummaryResponse response = reputationService.getSummaryForCurrentUser();
        return ResponseEntity.ok(ApiResponse.<ReputationSummaryResponse>builder()
                .success(true)
                .message("Reputation summary")
                .data(response)
                .build());
    }

    @GetMapping("/me/history")
    public ResponseEntity<ApiResponse<Page<ReputationTransactionResponse>>> history(Pageable pageable) {
        Page<ReputationTransactionResponse> response = reputationService.getHistoryForCurrentUser(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ReputationTransactionResponse>>builder()
                .success(true)
                .message("Reputation history")
                .data(response)
                .build());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<Page<LeaderboardEntryResponse>>> leaderboard(Pageable pageable) {
        Page<LeaderboardEntryResponse> response = reputationService.getLeaderboard(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<LeaderboardEntryResponse>>builder()
                .success(true)
                .message("Leaderboard")
                .data(response)
                .build());
    }
}
