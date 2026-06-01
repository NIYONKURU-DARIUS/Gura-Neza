package com.dariusfirstproject.gura_neza.chat;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long id;
    private Long userId;
    private String userName;
    private String senderRole;   // "USER" | "ADMIN"
    private String content;
    private LocalDateTime sentAt;
    private boolean readByAdmin;
    private boolean edited;
    private String messageType; // "TEXT" | "VOICE"
    private String voiceUrl;
}