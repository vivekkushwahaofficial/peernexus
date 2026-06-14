package com.peernexus.peernexus.answer.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.answer.dto.AnswerCreateRequest;
import com.peernexus.peernexus.answer.dto.AnswerResponse;
import com.peernexus.peernexus.answer.dto.AnswerUpdateRequest;
import com.peernexus.peernexus.answer.dto.VoteRequest;
import com.peernexus.peernexus.answer.service.AnswerService;
import com.peernexus.peernexus.common.ApiResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
@Validated
public class AnswerController {

    private final AnswerService answerService;

    @PostMapping
    public ResponseEntity<ApiResponse<AnswerResponse>> create(@Valid @RequestBody AnswerCreateRequest request) {
        AnswerResponse response = answerService.create(request);
        return ResponseEntity.ok(ApiResponse.<AnswerResponse>builder()
                .success(true)
                .message("Answer created")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AnswerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AnswerUpdateRequest request
    ) {
        AnswerResponse response = answerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.<AnswerResponse>builder()
                .success(true)
                .message("Answer updated")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        answerService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Answer deleted")
                .data(null)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnswerResponse>> getById(@PathVariable Long id) {
        AnswerResponse response = answerService.getById(id);
        return ResponseEntity.ok(ApiResponse.<AnswerResponse>builder()
                .success(true)
                .message("Answer")
                .data(response)
                .build());
    }

    @GetMapping("/doubt/{doubtId}")
    public ResponseEntity<ApiResponse<Page<AnswerResponse>>> getByDoubt(
            @PathVariable Long doubtId,
            Pageable pageable
    ) {
        Page<AnswerResponse> response = answerService.getByDoubt(doubtId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<AnswerResponse>>builder()
                .success(true)
                .message("Answers")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<AnswerResponse>> accept(@PathVariable Long id) {
        AnswerResponse response = answerService.acceptAnswer(id);
        return ResponseEntity.ok(ApiResponse.<AnswerResponse>builder()
                .success(true)
                .message("Answer accepted")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ApiResponse<AnswerResponse>> vote(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest request
    ) {
        AnswerResponse response = answerService.vote(id, request);
        return ResponseEntity.ok(ApiResponse.<AnswerResponse>builder()
                .success(true)
                .message("Vote recorded")
                .data(response)
                .build());
    }
}
