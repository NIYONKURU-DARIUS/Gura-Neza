package com.dariusfirstproject.gura_neza.chat;

import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
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

        // Push in real time to the admin's inbox channel
        messagingTemplate.convertAndSend("/topic/admin/inbox", dto);

        // Also push to the specific user thread so admin sees it live if they have it open
        messagingTemplate.convertAndSend("/topic/admin/thread/" + user.getId(), dto);

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
                .readByAdmin(true)   // admin's own messages are already "read"
                .build();
        chatMessageRepository.save(message);

        ChatMessageDto dto = toDto(message);

        // Push in real time to the user's personal channel
        messagingTemplate.convertAndSend("/topic/user/" + userId, dto);

        // Also push to the admin thread view so they see their own reply immediately
        messagingTemplate.convertAndSend("/topic/admin/thread/" + userId, dto);

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