package com.dariusfirstproject.gura_neza.chat;

import com.dariusfirstproject.gura_neza.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who opened the support session (always a USER role)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Who sent this particular message: "USER" or "ADMIN"
    @Column(nullable = false)
    private String senderRole;  // "USER" | "ADMIN"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    // Whether the admin has read this message (used for unread badge)
    @Column(nullable = false)
    @Builder.Default
    private boolean readByAdmin = false;
}