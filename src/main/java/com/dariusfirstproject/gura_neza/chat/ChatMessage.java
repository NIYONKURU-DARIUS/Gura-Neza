package com.dariusfirstproject.gura_neza.chat;

import com.dariusfirstproject.gura_neza.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = "user")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String senderRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private boolean readByAdmin = false;

    @Column(nullable = false)
    private boolean edited = false;

    /** "TEXT" or "VOICE" */
    @Column(nullable = false)
    private String messageType = "TEXT";

    /** URL path to the uploaded voice file (null for text messages) */
    @Column
    private String voiceUrl;
}
