package com.dariusfirstproject.gura_neza.chat;

import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── USER sends a voice message ────────────────────────────────────────────
    public ChatMessageDto userSendVoice(MultipartFile file) {
        User user = getCurrentUser();

        // Save file to uploads/voice/
        String filename = UUID.randomUUID() + ".webm";
        Path uploadDir = Paths.get("uploads/voice");
        try {
            Files.createDirectories(uploadDir);
            Files.write(uploadDir.resolve(filename), file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save voice message", e);
        }

        String voiceUrl = "/api/chat/voice/" + filename;

        ChatMessage message = ChatMessage.builder()
                .user(user)
                .senderRole("USER")
                .content("[Voice message]")
                .messageType("VOICE")
                .voiceUrl(voiceUrl)
                .sentAt(LocalDateTime.now())
                .readByAdmin(false)
                .build();
        chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(message);
        try {
            messagingTemplate.convertAndSend("/topic/admin/inbox", dto);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for voice message: {}", e.getMessage());
        }
        return dto;
    }

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

        return dto;
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

    // ── USER edits own message ────────────────────────────────────────────────
    public ChatMessageDto editMessage(Long messageId, String newContent) {
        User user = getCurrentUser();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getUser().getId().equals(user.getId()) || !"USER".equals(message.getSenderRole())) {
            throw new RuntimeException("Not authorized to edit this message");
        }
        message.setContent(newContent);
        message.setEdited(true);
        chatMessageRepository.save(message);
        ChatMessageDto dto = toDto(message);
        try {
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for edit: {}", e.getMessage());
        }
        return dto;
    }

    // ── USER deletes own message ──────────────────────────────────────────────
    public void deleteMessage(Long messageId) {
        User user = getCurrentUser();
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getUser().getId().equals(user.getId()) || !"USER".equals(message.getSenderRole())) {
            throw new RuntimeException("Not authorized to delete this message");
        }
        chatMessageRepository.delete(message);
        try {
            Object signal = java.util.Map.of("deleted", true, "id", messageId);
            messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), signal);
        } catch (Exception e) {
            log.warn("WebSocket push failed for delete: {}", e.getMessage());
        }
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
        return new ChatMessageDto(
                m.getId(),
                m.getUser().getId(),
                m.getUser().getName(),
                m.getSenderRole(),
                m.getContent(),
                m.getSentAt(),
                m.isReadByAdmin(),
                m.isEdited(),
                m.getMessageType() != null ? m.getMessageType() : "TEXT",
                m.getVoiceUrl()
        );
    }
}
