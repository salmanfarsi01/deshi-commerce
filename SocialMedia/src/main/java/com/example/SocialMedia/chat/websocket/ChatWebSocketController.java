package com.example.SocialMedia.chat.websocket;

import com.example.SocialMedia.chat.dto.ChatMessageDto;
import com.example.SocialMedia.chat.dto.SendAdminReplyDto;
import com.example.SocialMedia.chat.dto.SendUserChatMessageDto;
import com.example.SocialMedia.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.sendUserMessage")
    public ChatMessageDto sendUserMessage(SendUserChatMessageDto payload) {
        return chatService.sendUserMessage(payload);
    }

    @MessageMapping("/chat.sendAdminReply")
    public ChatMessageDto sendAdminReply(SendAdminReplyDto payload) {
        return chatService.sendAdminReply(payload);
    }
}
