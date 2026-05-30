package com.dariusfirstproject.gura_neza.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // All messages for a specific user's thread, oldest first
    List<ChatMessage> findByUserIdOrderBySentAtAsc(Long userId);

    // All users who have sent at least one message (for the admin inbox)
    @Query("SELECT DISTINCT m.user FROM ChatMessage m ORDER BY m.user.name ASC")
    List<com.dariusfirstproject.gura_neza.user.User> findDistinctUsers();

    // Count unread messages per user (for the admin's unread badge)
    long countByUserIdAndReadByAdminFalseAndSenderRole(Long userId, String senderRole);

    // Mark all messages from a user as read by admin
    @Modifying
    @Query("UPDATE ChatMessage m SET m.readByAdmin = true WHERE m.user.id = :userId AND m.senderRole = 'USER'")
    void markAllAsReadForUser(Long userId);
}