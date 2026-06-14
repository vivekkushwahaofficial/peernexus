package com.peernexus.peernexus.connection.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.peernexus.peernexus.connection.entity.Connection;
import com.peernexus.peernexus.connection.entity.ConnectionStatus;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    Optional<Connection> findByRequesterIdAndRecipientId(Long requesterId, Long recipientId);

    @Query("select c from Connection c where (c.requester.id = :userA and c.recipient.id = :userB) or (c.requester.id = :userB and c.recipient.id = :userA)")
    Optional<Connection> findBetweenUsers(@Param("userA") Long userA, @Param("userB") Long userB);

    Page<Connection> findByRecipientIdAndStatus(Long recipientId, ConnectionStatus status, Pageable pageable);

    Page<Connection> findByRequesterIdAndStatus(Long requesterId, ConnectionStatus status, Pageable pageable);

    @Query("select c from Connection c where c.status = :status and (c.requester.id = :userId or c.recipient.id = :userId)")
    Page<Connection> findConnections(@Param("userId") Long userId, @Param("status") ConnectionStatus status, Pageable pageable);

    @Query("select case when c.requester.id = :userId then c.recipient.id else c.requester.id end from Connection c where c.status = 'ACCEPTED' and (c.requester.id = :userId or c.recipient.id = :userId)")
    List<Long> findConnectedUserIds(@Param("userId") Long userId);

    /**
     * Counts all connections with the given status (used for dashboard stats).
     *
     * @param status the connection status to count
     * @return number of matching connections
     */
    long countByStatus(ConnectionStatus status);
}
