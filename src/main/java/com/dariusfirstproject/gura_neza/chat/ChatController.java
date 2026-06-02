package com.dariusfirstproject.gura_neza.chat;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // ── USER endpoints ────────────────────────────────────────────────────────

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.userSendMessage(body.get("content"), body.get("replyToContent")));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getHistory() {
        return ResponseEntity.ok(chatService.getUserHistory());
    }

    // ── Voice message ─────────────────────────────────────────────────────────

    @PostMapping(value = "/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageDto> sendVoice(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(chatService.userSendVoice(file));
    }

    /** Serve the stored voice file */
    @GetMapping("/voice/{filename}")
    public ResponseEntity<Resource> serveVoice(@PathVariable String filename) {
        Path filePath = Paths.get("uploads/voice").resolve(filename).normalize();
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("audio/webm"))
                .body(resource);
    }

    // ── ADMIN endpoints ───────────────────────────────────────────────────────

    @GetMapping("/admin/inbox")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ChatInboxItem>> getInbox() {
        return ResponseEntity.ok(chatService.getAdminInbox());
    }

    @GetMapping("/admin/thread/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ChatMessageDto>> getThread(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getThreadForUser(userId));
    }

    @PostMapping("/admin/reply/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ChatMessageDto> adminReply(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.adminSendMessage(userId, body.get("content"), body.get("replyToContent")));
    }

    @DeleteMapping("/admin/message/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> adminDeleteMessage(@PathVariable Long id) {
        chatService.adminDeleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    // ── USER edit / delete ────────────────────────────────────────────────────

    @PutMapping("/message/{id}")
    public ResponseEntity<ChatMessageDto> editMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.editMessage(id, body.get("content")));
    }

    @DeleteMapping("/message/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        chatService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    // ── WebRTC signaling via WebSocket ────────────────────────────────────────

    /** User initiates a call — notify admin */
    @MessageMapping("/call.initiate")
    public void initiateCall(@Payload Map<String, Object> payload, Authentication auth) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String userName = payload.get("userName").toString();
        Object signal = Map.of("type", "CALL_INCOMING", "userId", userId, "userName", userName);
        messagingTemplate.convertAndSend("/topic/admin/call", signal);
    }

    /** Relay WebRTC offer from user to admin */
    @MessageMapping("/call.offer")
    public void relayOffer(@Payload Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Object signal = Map.of("type", "OFFER", "userId", userId, "sdp", payload.get("sdp"));
        messagingTemplate.convertAndSend("/topic/admin/call", signal);
    }

    /** Relay WebRTC answer from admin to user */
    @MessageMapping("/call.answer")
    public void relayAnswer(@Payload Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Object signal = Map.of("type", "ANSWER", "sdp", payload.get("sdp"));
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/call", signal);
    }

    /** Relay ICE candidate */
    @MessageMapping("/call.ice")
    public void relayIce(@Payload Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String direction = payload.getOrDefault("direction", "to_admin").toString();
        if ("to_admin".equals(direction)) {
            Object signal = Map.of("type", "ICE", "userId", userId, "candidate", payload.get("candidate"));
            messagingTemplate.convertAndSend("/topic/admin/call", signal);
        } else {
            Object signal = Map.of("type", "ICE", "candidate", payload.get("candidate"));
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/call", signal);
        }
    }

    /** Hang up / reject */
    @MessageMapping("/call.end")
    public void endCall(@Payload Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String direction = payload.getOrDefault("direction", "to_admin").toString();
        if ("to_admin".equals(direction)) {
            Object signal = Map.of("type", "CALL_ENDED", "userId", userId);
            messagingTemplate.convertAndSend("/topic/admin/call", signal);
        } else {
            Object signal = Map.of("type", "CALL_ENDED", "userId", userId);
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/call", signal);
        }
    }

    // ── WebSocket STOMP ───────────────────────────────────────────────────────

    @MessageMapping("/chat.send")
    public void wsSendMessage(@Payload Map<String, String> payload, Authentication auth) {
        chatService.userSendMessage(payload.get("content"));
    }

    @MessageMapping("/chat.reply")
    public void wsAdminReply(@Payload Map<String, Object> payload, Authentication auth) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String content = payload.get("content").toString();
        chatService.adminSendMessage(userId, content);
    }
}