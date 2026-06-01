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
import java.util.ArrayList;
import java.util.List;

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

        // Use builder — @Builder.Default on readByAdmin requires it
        ChatMessage message = ChatMessage.builder()
                .user(user)
                .senderRole("USER")
                .content(content)
                .sentAt(LocalDateTime.now())
                .readByAdmin(false)
                .build();
        chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(message);

        try {
            messagingTemplate.convertAndSend("/topic/admin/inbox", dto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for user message: {}", e.getMessage());
        }

        sendAutoReply(user);
        return dto;
    }

    // ── Auto-reply ───────────────────────────────────────────────────────────
    private void sendAutoReply(User user) {
        List<ChatMessage> thread = chatMessageRepository.findByUserIdOrderBySentAtAsc(user.getId());
        if (!thread.isEmpty() && "ADMIN".equals(thread.get(thread.size() - 1).getSenderRole())) {
            return;
        }

        ChatMessage autoMsg = ChatMessage.builder()
                .user(user)
                .senderRole("ADMIN")
                .content("Thanks for reaching out! Our support team has received your message and will respond shortly. \uD83D\uDE4F")
                .sentAt(LocalDateTime.now().plusSeconds(1))
                .readByAdmin(true)
                .build();
        chatMessageRepository.save(autoMsg);

        ChatMessageDto autoDto = toDto(autoMsg);
        try {
            messagingTemplate.convertAndSend("/topic/user/" + user.getId(), autoDto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), autoDto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for auto-reply: {}", e.getMessage());
        }
    }

    // ── ADMIN sends a reply ──────────────────────────────────────────────────
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

        try {
            messagingTemplate.convertAndSend("/topic/user/" + userId, dto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + userId, dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for admin reply: {}", e.getMessage());
        }

        return dto;
    }

    // ── USER history ─────────────────────────────────────────────────────────
    public List<ChatMessageDto> getUserHistory() {
        User user = getCurrentUser();
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderBySentAtAsc(user.getId());
        List<ChatMessageDto> result = new ArrayList<>();
        for (ChatMessage m : messages) result.add(toDto(m));
        return result;
    }

    // ── ADMIN thread ─────────────────────────────────────────────────────────
    public List<ChatMessageDto> getThreadForUser(Long userId) {
        chatMessageRepository.markAllAsReadForUser(userId);
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderBySentAtAsc(userId);
        List<ChatMessageDto> result = new ArrayList<>();
        for (ChatMessage m : messages) result.add(toDto(m));
        return result;
    }

    // ── ADMIN inbox ──────────────────────────────────────────────────────────
    public List<ChatInboxItem> getAdminInbox() {
        List<User> users = chatMessageRepository.findDistinctUsers();
        List<ChatInboxItem> result = new ArrayList<>();
        for (User u : users) {
            long unread = chatMessageRepository
                    .countByUserIdAndReadByAdminFalseAndSenderRole(u.getId(), "USER");
            List<ChatMessage> thread = chatMessageRepository.findByUserIdOrderBySentAtAsc(u.getId());
            String lastMessage = thread.isEmpty() ? "" : thread.get(thread.size() - 1).getContent();

            // Use @AllArgsConstructor: (userId, userName, userEmail, unreadCount, lastMessage)
            ChatInboxItem item = new ChatInboxItem(u.getId(), u.getName(), u.getEmail(), unread, lastMessage);
            result.add(item);
        }
        return result;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ChatMessageDto toDto(ChatMessage m) {
        // Use @AllArgsConstructor: (id, userId, userName, senderRole, content, sentAt, readByAdmin)
        return new ChatMessageDto(
                m.getId(),
                m.getUser().getId(),
                m.getUser().getName(),
                m.getSenderRole(),
                m.getContent(),
                m.getSentAt(),
                m.isReadByAdmin()
        );
    }
}
