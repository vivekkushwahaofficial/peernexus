package com.peernexus.peernexus.chat.service;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.peernexus.peernexus.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

/**
 * Persists and tracks connected WebSocket users.
 */
@Service
@RequiredArgsConstructor
public class OnlineStatusService {

    private final UserRepository userRepository;

    /**
     * Registers a user as online.
     *
     * @param userId the connected user's ID
     */
    @Transactional
    public void markOnline(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(true);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    /**
     * Removes a user from the online set.
     *
     * @param userId the disconnected user's ID
     */
    @Transactional
    public void markOffline(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    /**
     * Returns {@code true} if the user is online.
     *
     * @param userId the user to query
     * @return {@code true} if online
     */
    @Transactional(readOnly = true)
    public boolean isOnline(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.isOnline())
                .orElse(false);
    }
}
