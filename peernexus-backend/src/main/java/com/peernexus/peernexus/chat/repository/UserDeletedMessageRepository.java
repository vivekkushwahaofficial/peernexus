package com.peernexus.peernexus.chat.repository;

import com.peernexus.peernexus.chat.entity.UserDeletedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDeletedMessageRepository extends JpaRepository<UserDeletedMessage, Long> {
    boolean existsByUserIdAndMessageId(Long userId, Long messageId);
}
