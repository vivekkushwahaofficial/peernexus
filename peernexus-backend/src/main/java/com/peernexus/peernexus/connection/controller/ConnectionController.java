package com.peernexus.peernexus.connection.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.peernexus.peernexus.common.ApiResponse;
import com.peernexus.peernexus.connection.dto.ConnectionRequest;
import com.peernexus.peernexus.connection.dto.ConnectionResponse;
import com.peernexus.peernexus.connection.dto.ConnectionUserSummary;
import com.peernexus.peernexus.connection.service.ConnectionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
@Validated
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ConnectionResponse>> sendRequest(@Valid @RequestBody ConnectionRequest request) {
        ConnectionResponse response = connectionService.sendRequest(request);
        return ResponseEntity.ok(ApiResponse.<ConnectionResponse>builder()
                .success(true)
                .message("Request sent")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ConnectionResponse>> accept(@PathVariable Long id) {
        ConnectionResponse response = connectionService.acceptRequest(id);
        return ResponseEntity.ok(ApiResponse.<ConnectionResponse>builder()
                .success(true)
                .message("Request accepted")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ConnectionResponse>> reject(@PathVariable Long id) {
        ConnectionResponse response = connectionService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.<ConnectionResponse>builder()
                .success(true)
                .message("Request rejected")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ConnectionResponse>> cancel(@PathVariable Long id) {
        ConnectionResponse response = connectionService.cancelRequest(id);
        return ResponseEntity.ok(ApiResponse.<ConnectionResponse>builder()
                .success(true)
                .message("Request canceled")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {
        connectionService.removeConnection(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Connection removed")
                .data(null)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ConnectionResponse>>> list(Pageable pageable) {
        Page<ConnectionResponse> response = connectionService.getConnections(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ConnectionResponse>>builder()
                .success(true)
                .message("Connections")
                .data(response)
                .build());
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<ApiResponse<Page<ConnectionResponse>>> incoming(Pageable pageable) {
        Page<ConnectionResponse> response = connectionService.getIncomingRequests(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ConnectionResponse>>builder()
                .success(true)
                .message("Incoming requests")
                .data(response)
                .build());
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<ApiResponse<Page<ConnectionResponse>>> outgoing(Pageable pageable) {
        Page<ConnectionResponse> response = connectionService.getOutgoingRequests(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ConnectionResponse>>builder()
                .success(true)
                .message("Outgoing requests")
                .data(response)
                .build());
    }

    @GetMapping("/mutual/{userId}")
    public ResponseEntity<ApiResponse<List<ConnectionUserSummary>>> mutual(@PathVariable Long userId) {
        List<ConnectionUserSummary> response = connectionService.getMutualConnections(userId);
        return ResponseEntity.ok(ApiResponse.<List<ConnectionUserSummary>>builder()
                .success(true)
                .message("Mutual connections")
                .data(response)
                .build());
    }
}
