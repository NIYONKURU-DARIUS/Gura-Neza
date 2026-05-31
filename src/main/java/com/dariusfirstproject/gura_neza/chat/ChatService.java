package com.dariusfirstproject.gura_neza.chat;

import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── USER sends a message ─────────────────────────────────────────────────
    public ChatMessageDto userSendMessage(String content) {
        User user = getCurrentUser();

        ChatMessage message = ChatMessage.builder()
                .user(user)
                .senderRole("USER")
                .content(content)
                .sentAt(LocalDateTime.now())
                .readByAdmin(false)
                .build();
        chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(message);

        // Best-effort WebSocket push — message is already saved to DB regardless
        try {
            messagingTemplate.convertAndSend("/topic/admin/inbox", dto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for user message (saved to DB): {}", e.getMessage());
        }

        return dto;
    }

    // ── ADMIN sends a reply to a specific user ───────────────────────────────
    public ChatMessageDto adminSendMessage(Long userId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage message = ChatMessage.builder()
                .user(user)
                .senderRole("ADMIN")
                .content(content)
                .sentAt(LocalDateTime.now())
                .readByAdmin(true)
                .build();
        chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(message);

        // Best-effort WebSocket push
        try {
            messagingTemplate.convertAndSend("/topic/user/" + userId, dto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + userId, dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for admin reply (saved to DB): {}", e.getMessage());
        }

        return dto;
    }

    // ── USER loads their own message history ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getUserHistory() {
        User user = getCurrentUser();
        return chatMessageRepository.findByUserIdOrderBySentAtAsc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── ADMIN loads one user's thread ────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getThreadForUser(Long userId) {
        // Mark all USER messages in this thread as read
        chatMessageRepository.markAllAsReadForUser(userId);
        return chatMessageRepository.findByUserIdOrderBySentAtAsc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── ADMIN loads the inbox (all users + unread counts) ────────────────────
    @Transactional(readOnly = true)
    public List<ChatInboxItem> getAdminInbox() {
        return chatMessageRepository.findDistinctUsers().stream()
                .map(user -> {
                    long unread = chatMessageRepository
                            .countByUserIdAndReadByAdminFalseAndSenderRole(user.getId(), "USER");

                    List<ChatMessage> thread = chatMessageRepository
                            .findByUserIdOrderBySentAtAsc(user.getId());
                    String lastMessage = thread.isEmpty() ? ""
                            : thread.get(thread.size() - 1).getContent();

                    return ChatInboxItem.builder()
                            .userId(user.getId())
                            .userName(user.getName())
                            .userEmail(user.getEmail())
                            .unreadCount(unread)
                            .lastMessage(lastMessage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ChatMessageDto toDto(ChatMessage m) {
        return ChatMessageDto.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .userName(m.getUser().getName())
                .senderRole(m.getSenderRole())
                .content(m.getContent())
                .sentAt(m.getSentAt())
                .readByAdmin(m.isReadByAdmin())
                .build();
    }
}