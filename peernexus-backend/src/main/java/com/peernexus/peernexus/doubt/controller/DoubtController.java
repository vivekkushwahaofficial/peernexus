package com.peernexus.peernexus.doubt.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.doubt.dto.DoubtCreateRequest;
import com.peernexus.peernexus.doubt.dto.DoubtImageUploadRequest;
import com.peernexus.peernexus.doubt.dto.DoubtResponse;
import com.peernexus.peernexus.doubt.dto.DoubtUpdateRequest;
import com.peernexus.peernexus.doubt.service.DoubtService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doubts")
@RequiredArgsConstructor
@Validated
public class DoubtController {

    private final DoubtService doubtService;

    @PostMapping
    public ResponseEntity<ApiResponse<DoubtResponse>> create(@Valid @RequestBody DoubtCreateRequest request) {
        DoubtResponse response = doubtService.create(request);
        return ResponseEntity.ok(ApiResponse.<DoubtResponse>builder()
                .success(true)
                .message("Doubt created")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoubtResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody DoubtUpdateRequest request
    ) {
        DoubtResponse response = doubtService.update(id, request);
        return ResponseEntity.ok(ApiResponse.<DoubtResponse>builder()
                .success(true)
                .message("Doubt updated")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        doubtService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Doubt deleted")
                .data(null)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoubtResponse>> getById(@PathVariable Long id) {
        DoubtResponse response = doubtService.getById(id);
        return ResponseEntity.ok(ApiResponse.<DoubtResponse>builder()
                .success(true)
                .message("Doubt")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DoubtResponse>>> getAll(Pageable pageable) {
        Page<DoubtResponse> response = doubtService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<DoubtResponse>>builder()
                .success(true)
                .message("Doubts")
                .data(response)
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<DoubtResponse>>> search(
            @RequestParam String query,
            Pageable pageable
    ) {
        Page<DoubtResponse> response = doubtService.search(query, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<DoubtResponse>>builder()
                .success(true)
                .message("Search results")
                .data(response)
                .build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<DoubtResponse>>> byCategory(
            @PathVariable Long categoryId,
            Pageable pageable
    ) {
        Page<DoubtResponse> response = doubtService.getByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<DoubtResponse>>builder()
                .success(true)
                .message("Category doubts")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<DoubtResponse>> uploadImages(
            @PathVariable Long id,
            @Valid @RequestBody DoubtImageUploadRequest request
    ) {
        DoubtResponse response = doubtService.addImages(id, request);
        return ResponseEntity.ok(ApiResponse.<DoubtResponse>builder()
                .success(true)
                .message("Images added")
                .data(response)
                .build());
    }
}
