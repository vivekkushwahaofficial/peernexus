package com.peernexus.peernexus.reputation.repository;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.reputation.entity.ReputationEventType;
import com.peernexus.peernexus.reputation.entity.ReputationTransaction;

public interface ReputationTransactionRepository extends JpaRepository<ReputationTransaction, Long> {

    Page<ReputationTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    boolean existsByUserIdAndTypeAndCreatedAtBetween(Long userId, ReputationEventType type, Instant start, Instant end);
}
