package com.peernexus.peernexus.chat.repository;

import com.peernexus.peernexus.chat.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByMessageIdAndUserIdAndReaction(Long messageId, Long userId, String reaction);
    List<MessageReaction> findByMessageId(Long messageId);
}
