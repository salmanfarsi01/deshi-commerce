package com.example.SocialMedia.chat.controller;

import com.example.SocialMedia.chat.dto.*;
import com.example.SocialMedia.chat.service.ChatService;
import com.example.SocialMedia.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ChatConversationDto>>> getConversations() {
        List<ChatConversationDto> conversations = chatService.getAllConversations();
        return ResponseEntity.ok(ApiResponse.success("Chat conversations retrieved", conversations));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<ChatConversationDto>> getConversation(@PathVariable String id) {
        ChatConversationDto conversation = chatService.getConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Chat conversation retrieved", conversation));
    }

    @PostMapping("/send-user")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendUserMessage(@RequestBody SendUserChatMessageDto payload) {
        ChatMessageDto message = chatService.sendUserMessage(payload);
        return ResponseEntity.ok(ApiResponse.success("Message sent to support team", message));
    }

    @PostMapping("/reply-admin")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendAdminReply(@RequestBody SendAdminReplyDto payload) {
        ChatMessageDto message = chatService.sendAdminReply(payload);
        return ResponseEntity.ok(ApiResponse.success("Reply sent to customer", message));
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markConversationRead(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "USER") String role,
            @RequestBody(required = false) MarkChatReadDto body) {
        String effectiveRole = (body != null && body.getRole() != null) ? body.getRole() : role;
        chatService.markConversationRead(id, effectiveRole);
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
    }

    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markConversationReadPost(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "USER") String role,
            @RequestBody(required = false) MarkChatReadDto body) {
        String effectiveRole = (body != null && body.getRole() != null) ? body.getRole() : role;
        chatService.markConversationRead(id, effectiveRole);
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<ApiResponse<Boolean>> deleteConversation(@PathVariable String id) {
        boolean deleted = chatService.deleteConversation(id);
        return ResponseEntity.ok(ApiResponse.success("Conversation deleted successfully", deleted));
    }
}
