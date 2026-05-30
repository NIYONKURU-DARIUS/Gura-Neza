package com.dariusfirstproject.gura_neza.chat;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;

    // ── USER endpoints ────────────────────────────────────────────────────────

    /**
     * USER: send a message to support.
     * Called both via REST (POST) and via WebSocket (@MessageMapping).
     */
    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.userSendMessage(body.get("content")));
    }

    /**
     * USER: load own message history (to restore chat on page reload).
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getHistory() {
        return ResponseEntity.ok(chatService.getUserHistory());
    }

    // ── ADMIN endpoints ───────────────────────────────────────────────────────

    /**
     * ADMIN: get the inbox — all users who have sent messages + unread counts.
     */
    @GetMapping("/admin/inbox")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ChatInboxItem>> getInbox() {
        return ResponseEntity.ok(chatService.getAdminInbox());
    }

    /**
     * ADMIN: load the full thread with a specific user (also marks messages as read).
     */
    @GetMapping("/admin/thread/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ChatMessageDto>> getThread(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getThreadForUser(userId));
    }

    /**
     * ADMIN: reply to a specific user.
     */
    @PostMapping("/admin/reply/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ChatMessageDto> adminReply(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.adminSendMessage(userId, body.get("content")));
    }

    // ── WebSocket message mappings (STOMP) ────────────────────────────────────

    /**
     * USER sends a message over WebSocket.
     * Client sends to /app/chat.send
     * Server broadcasts to /topic/admin/inbox and /topic/admin/thread/{userId}
     */
    @MessageMapping("/chat.send")
    public void wsSendMessage(@Payload Map<String, String> payload, Authentication auth) {
        chatService.userSendMessage(payload.get("content"));
    }

    /**
     * ADMIN replies over WebSocket.
     * Client sends to /app/chat.reply
     * Server broadcasts to /topic/user/{userId} and /topic/admin/thread/{userId}
     */
    @MessageMapping("/chat.reply")
    public void wsAdminReply(@Payload Map<String, Object> payload, Authentication auth) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String content = payload.get("content").toString();
        chatService.adminSendMessage(userId, content);
    }
}