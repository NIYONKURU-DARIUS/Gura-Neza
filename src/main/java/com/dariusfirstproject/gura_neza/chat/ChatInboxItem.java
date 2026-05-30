package com.dariusfirstproject.gura_neza.chat;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatInboxItem {
    private Long userId;
    private String userName;
    private String userEmail;
    private long unreadCount;      // messages USER sent that admin hasn't read
    private String lastMessage;
}