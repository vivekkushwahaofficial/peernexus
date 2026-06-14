package com.peernexus.peernexus.connection.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.peernexus.peernexus.connection.dto.ConnectionRequest;
import com.peernexus.peernexus.connection.dto.ConnectionResponse;
import com.peernexus.peernexus.connection.dto.ConnectionUserSummary;

public interface ConnectionService {

    ConnectionResponse sendRequest(ConnectionRequest request);

    ConnectionResponse acceptRequest(Long connectionId);

    ConnectionResponse rejectRequest(Long connectionId);

    ConnectionResponse cancelRequest(Long connectionId);

    void removeConnection(Long connectionId);

    Page<ConnectionResponse> getConnections(Pageable pageable);

    Page<ConnectionResponse> getIncomingRequests(Pageable pageable);

    Page<ConnectionResponse> getOutgoingRequests(Pageable pageable);

    List<ConnectionUserSummary> getMutualConnections(Long userId);
}
