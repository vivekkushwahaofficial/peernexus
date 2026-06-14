package com.peernexus.peernexus.connection.service.impl;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.peernexus.peernexus.connection.dto.ConnectionRequest;
import com.peernexus.peernexus.connection.dto.ConnectionResponse;
import com.peernexus.peernexus.connection.dto.ConnectionUserSummary;
import com.peernexus.peernexus.connection.entity.Connection;
import com.peernexus.peernexus.connection.entity.ConnectionStatus;
import com.peernexus.peernexus.connection.mapper.ConnectionMapper;
import com.peernexus.peernexus.connection.repository.ConnectionRepository;
import com.peernexus.peernexus.connection.service.ConnectionService;
import com.peernexus.peernexus.exception.BadRequestException;
import com.peernexus.peernexus.exception.ResourceNotFoundException;
import com.peernexus.peernexus.exception.UnauthorizedException;
import com.peernexus.peernexus.notification.entity.NotificationType;
import com.peernexus.peernexus.notification.service.NotificationService;
import com.peernexus.peernexus.user.entity.User;
import com.peernexus.peernexus.user.repository.UserRepository;
import com.peernexus.peernexus.user.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final ConnectionMapper connectionMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ConnectionResponse sendRequest(ConnectionRequest request) {
        User requester = resolveCurrentUser();
        if (Objects.equals(requester.getId(), request.recipientId())) {
            throw new BadRequestException("Cannot connect with yourself");
        }
        User recipient = userRepository.findById(request.recipientId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        connectionRepository.findBetweenUsers(requester.getId(), recipient.getId())
                .ifPresent(existing -> {
                    throw new BadRequestException("Connection already exists");
                });

        Connection connection = Connection.builder()
                .requester(requester)
                .recipient(recipient)
                .status(ConnectionStatus.PENDING)
                .build();
        Connection saved = connectionRepository.save(connection);

        notificationService.createNotification(
                recipient,
                requester,
                NotificationType.CONNECTION_REQUEST,
                requester.getName() + " sent you a connection request",
                "CONNECTION",
                saved.getId()
        );

        return connectionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ConnectionResponse acceptRequest(Long connectionId) {
        Connection connection = getConnectionForRecipient(connectionId);
        connection.setStatus(ConnectionStatus.ACCEPTED);
        Connection saved = connectionRepository.save(connection);

        notificationService.createNotification(
                saved.getRequester(),
                saved.getRecipient(),
                NotificationType.CONNECTION_ACCEPTED,
                saved.getRecipient().getName() + " accepted your request",
                "CONNECTION",
                saved.getId()
        );

        return connectionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ConnectionResponse rejectRequest(Long connectionId) {
        Connection connection = getConnectionForRecipient(connectionId);
        connection.setStatus(ConnectionStatus.REJECTED);
        Connection saved = connectionRepository.save(connection);
        return connectionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ConnectionResponse cancelRequest(Long connectionId) {
        Connection connection = getConnectionForRequester(connectionId);
        connection.setStatus(ConnectionStatus.CANCELED);
        Connection saved = connectionRepository.save(connection);
        return connectionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void removeConnection(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found"));
        User currentUser = resolveCurrentUser();
        boolean isParticipant = connection.getRequester().getId().equals(currentUser.getId())
                || connection.getRecipient().getId().equals(currentUser.getId());
        if (!isParticipant) {
            throw new UnauthorizedException("Access denied");
        }
        if (connection.getStatus() != ConnectionStatus.ACCEPTED) {
            throw new BadRequestException("Only accepted connections can be removed");
        }
        connectionRepository.delete(connection);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConnectionResponse> getConnections(Pageable pageable) {
        User currentUser = resolveCurrentUser();
        return connectionRepository.findConnections(currentUser.getId(), ConnectionStatus.ACCEPTED, pageable)
                .map(connectionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConnectionResponse> getIncomingRequests(Pageable pageable) {
        User currentUser = resolveCurrentUser();
        return connectionRepository.findByRecipientIdAndStatus(currentUser.getId(), ConnectionStatus.PENDING, pageable)
                .map(connectionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConnectionResponse> getOutgoingRequests(Pageable pageable) {
        User currentUser = resolveCurrentUser();
        return connectionRepository.findByRequesterIdAndStatus(currentUser.getId(), ConnectionStatus.PENDING, pageable)
                .map(connectionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConnectionUserSummary> getMutualConnections(Long userId) {
        User currentUser = resolveCurrentUser();
        Set<Long> currentConnections = Set.copyOf(connectionRepository.findConnectedUserIds(currentUser.getId()));
        Set<Long> otherConnections = Set.copyOf(connectionRepository.findConnectedUserIds(userId));

        List<Long> mutualIds = currentConnections.stream()
                .filter(otherConnections::contains)
                .toList();

        return userRepository.findAllById(mutualIds).stream()
                .map(connectionMapper::toUserSummary)
                .collect(Collectors.toList());
    }

    private Connection getConnectionForRecipient(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found"));
        User currentUser = resolveCurrentUser();
        if (!connection.getRecipient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new BadRequestException("Request is not pending");
        }
        return connection;
    }

    private Connection getConnectionForRequester(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found"));
        User currentUser = resolveCurrentUser();
        if (!connection.getRequester().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new BadRequestException("Request is not pending");
        }
        return connection;
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
