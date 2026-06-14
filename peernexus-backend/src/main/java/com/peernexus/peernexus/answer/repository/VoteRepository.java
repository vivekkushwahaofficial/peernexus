package com.peernexus.peernexus.answer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.peernexus.peernexus.answer.entity.Vote;
import com.peernexus.peernexus.answer.entity.VoteType;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByAnswerIdAndUserId(Long answerId, Long userId);

    int countByAnswerIdAndType(Long answerId, VoteType type);
}
