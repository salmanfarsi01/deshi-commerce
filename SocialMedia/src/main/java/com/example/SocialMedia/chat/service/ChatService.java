package com.example.SocialMedia.chat.service;

import com.example.SocialMedia.chat.dto.ChatConversationDto;
import com.example.SocialMedia.chat.dto.ChatMessageDto;
import com.example.SocialMedia.chat.dto.SendAdminReplyDto;
import com.example.SocialMedia.chat.dto.SendUserChatMessageDto;

import java.util.List;

public interface ChatService {

    List<ChatConversationDto> getAllConversations();

    ChatConversationDto getConversation(String idOrUserId);

    ChatMessageDto sendUserMessage(SendUserChatMessageDto dto);

    ChatMessageDto sendAdminReply(SendAdminReplyDto dto);

    void markConversationRead(String conversationId, String role);

    boolean deleteConversation(String conversationId);
}
