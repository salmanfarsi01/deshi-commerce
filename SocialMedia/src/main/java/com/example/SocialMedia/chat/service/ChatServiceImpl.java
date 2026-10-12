package com.example.SocialMedia.chat.service;

import com.example.SocialMedia.chat.dto.ChatConversationDto;
import com.example.SocialMedia.chat.dto.ChatMessageDto;
import com.example.SocialMedia.chat.dto.SendAdminReplyDto;
import com.example.SocialMedia.chat.dto.SendUserChatMessageDto;
import com.example.SocialMedia.chat.model.ChatConversation;
import com.example.SocialMedia.chat.model.ChatMessage;
import com.example.SocialMedia.chat.repository.ChatConversationRepository;
import com.example.SocialMedia.chat.repository.ChatMessageRepository;
import com.example.SocialMedia.common.exception.ResourceNotFoundException;
import com.example.SocialMedia.notification.model.NotificationChannel;
import com.example.SocialMedia.notification.model.NotificationEvent;
import com.example.SocialMedia.notification.model.NotificationLog;
import com.example.SocialMedia.notification.model.NotificationStatus;
import com.example.SocialMedia.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a")
            .withZone(ZoneId.of("Asia/Dhaka"));

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public ChatServiceImpl(ChatConversationRepository conversationRepository,
                           ChatMessageRepository messageRepository,
                           SimpMessagingTemplate messagingTemplate,
                           NotificationRepository notificationRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationDto> getAllConversations() {
        List<ChatConversation> conversations = conversationRepository.findAllByOrderByUpdatedAtDesc();
        return conversations.stream()
                .map(this::toConversationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatConversationDto getConversation(String idOrUserId) {
        if (idOrUserId == null || idOrUserId.isBlank()) {
            return null;
        }

        // Try lookup by ID first
        Optional<ChatConversation> convOpt = conversationRepository.findById(idOrUserId);
        if (convOpt.isEmpty()) {
            // Fallback lookup by userId
            convOpt = conversationRepository.findByUserId(idOrUserId);
        }

        return convOpt.map(this::toConversationDto).orElse(null);
    }

    @Override
    public ChatMessageDto sendUserMessage(SendUserChatMessageDto dto) {
        String convId = dto.getConversationId();
        ChatConversation conversation = null;

        if (convId != null && !convId.isBlank()) {
            conversation = conversationRepository.findById(convId).orElse(null);
        }
        if (conversation == null && dto.getUserId() != null && !dto.getUserId().isBlank()) {
            conversation = conversationRepository.findByUserId(dto.getUserId()).orElse(null);
        }

        String nowFormatted = TIME_FORMATTER.format(Instant.now());

        if (conversation == null) {
            String resolvedId = (convId != null && !convId.isBlank())
                    ? convId
                    : (dto.getUserId() != null ? "conv_" + dto.getUserId() : "conv_guest_" + UUID.randomUUID().toString().substring(0, 8));

            conversation = new ChatConversation(
                    resolvedId,
                    dto.getUserId(),
                    dto.getUserName() != null ? dto.getUserName() : "Shopper",
                    dto.getUserPhone(),
                    dto.getUserEmail(),
                    dto.getUserAvatar()
            );
        } else {
            // Update profile metadata if provided
            if (dto.getUserName() != null && !dto.getUserName().isBlank()) conversation.setUserName(dto.getUserName());
            if (dto.getUserPhone() != null && !dto.getUserPhone().isBlank()) conversation.setUserPhone(dto.getUserPhone());
            if (dto.getUserEmail() != null && !dto.getUserEmail().isBlank()) conversation.setUserEmail(dto.getUserEmail());
            if (dto.getUserAvatar() != null && !dto.getUserAvatar().isBlank()) conversation.setUserAvatar(dto.getUserAvatar());
        }

        String messageId = "msg_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);
        ChatMessage message = new ChatMessage(
                messageId,
                conversation,
                "USER",
                conversation.getUserName(),
                conversation.getUserAvatar(),
                dto.getText(),
                nowFormatted
        );

        conversation.addMessage(message);
        conversation.setUnreadAdminCount(conversation.getUnreadAdminCount() + 1);
        conversation.setStatus("OPEN");
        conversation.setUpdatedAt(Instant.now());

        ChatConversation savedConversation = conversationRepository.save(conversation);
        ChatMessage savedMessage = messageRepository.save(message);

        ChatMessageDto messageDto = toMessageDto(savedMessage);
        ChatConversationDto convDto = toConversationDto(savedConversation);

        // Broadcast to WebSocket subscribers for real-time live synchronization
        broadcastToWebSocket(savedConversation.getId(), messageDto, convDto);

        log.info("[Live Chat] User '{}' sent message in conversation '{}'", conversation.getUserName(), savedConversation.getId());
        return messageDto;
    }

    @Override
    public ChatMessageDto sendAdminReply(SendAdminReplyDto dto) {
        String convId = dto.getConversationId();
        ChatConversation conversation = conversationRepository.findById(convId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatConversation", "id", convId));

        String nowFormatted = TIME_FORMATTER.format(Instant.now());
        String adminName = (dto.getAdminName() != null && !dto.getAdminName().isBlank())
                ? dto.getAdminName()
                : "Deshi Support";

        String messageId = "msg_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6);
        ChatMessage message = new ChatMessage(
                messageId,
                conversation,
                "ADMIN",
                adminName,
                null,
                dto.getText(),
                nowFormatted
        );

        conversation.addMessage(message);
        conversation.setUnreadUserCount(conversation.getUnreadUserCount() + 1);
        conversation.setUnreadAdminCount(0); // Admin viewed & replied
        conversation.setUpdatedAt(Instant.now());

        ChatConversation savedConversation = conversationRepository.save(conversation);
        ChatMessage savedMessage = messageRepository.save(message);

        // Record support notification for the customer profile
        try {
            String recipient = conversation.getUserPhone() != null ? conversation.getUserPhone()
                    : (conversation.getUserEmail() != null ? conversation.getUserEmail() : conversation.getUserName());

            NotificationLog notif = new NotificationLog(
                    "notif_chat_" + UUID.randomUUID().toString().substring(0, 8),
                    NotificationChannel.SUPPORT,
                    NotificationEvent.SUPPORT_INQUIRY,
                    recipient,
                    "Live Support Reply from " + adminName,
                    dto.getText(),
                    NotificationStatus.SENT,
                    null,
                    conversation.getUserId()
            );
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.warn("[Live Chat] Could not persist notification log for admin reply: {}", e.getMessage());
        }

        ChatMessageDto messageDto = toMessageDto(savedMessage);
        ChatConversationDto convDto = toConversationDto(savedConversation);

        // Broadcast via WebSocket STOMP
        broadcastToWebSocket(savedConversation.getId(), messageDto, convDto);

        log.info("[Live Chat] Admin '{}' replied to customer in conversation '{}'", adminName, savedConversation.getId());
        return messageDto;
    }

    @Override
    public void markConversationRead(String conversationId, String role) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) return;

        List<ChatMessage> messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);
        boolean changed = false;

        if ("USER".equalsIgnoreCase(role)) {
            conversation.setUnreadUserCount(0);
            for (ChatMessage m : messages) {
                if ("ADMIN".equalsIgnoreCase(m.getSender()) && !m.isRead()) {
                    m.setRead(true);
                    changed = true;
                }
            }
        } else {
            // ADMIN role
            conversation.setUnreadAdminCount(0);
            for (ChatMessage m : messages) {
                if ("USER".equalsIgnoreCase(m.getSender()) && !m.isRead()) {
                    m.setRead(true);
                    changed = true;
                }
            }
        }

        conversationRepository.save(conversation);
        if (changed) {
            messageRepository.saveAll(messages);
        }

        // Broadcast updated conversation status to WebSocket
        try {
            ChatConversationDto convDto = toConversationDto(conversation);
            messagingTemplate.convertAndSend("/topic/chat-conversations", convDto);
        } catch (Exception e) {
            log.warn("[Live Chat WS] Failed to broadcast read update: {}", e.getMessage());
        }
    }

    @Override
    public boolean deleteConversation(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            return false;
        }
        conversationRepository.deleteById(conversationId);

        // Broadcast deletion event to all connected admin and user stations
        try {
            Map<String, Object> deleteNotice = Map.of(
                    "type", "CONVERSATION_DELETED",
                    "conversationId", conversationId
            );
            messagingTemplate.convertAndSend("/topic/chat-conversations", (Object) deleteNotice);
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId, (Object) deleteNotice);
        } catch (Exception e) {
            log.warn("[Live Chat WS] Failed to broadcast deletion: {}", e.getMessage());
        }

        log.info("[Live Chat] Conversation '{}' permanently deleted", conversationId);
        return true;
    }

    private void broadcastToWebSocket(String conversationId, ChatMessageDto messageDto, ChatConversationDto convDto) {
        try {
            // Real-time channel for the specific conversation window (User & Assigned Admin)
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId, messageDto);
            // Real-time broadcast channel for all admin dashboard overview monitors
            messagingTemplate.convertAndSend("/topic/chat-conversations", convDto);
        } catch (Exception e) {
            log.warn("[Live Chat WebSocket Broadcast Failed] Error: {}", e.getMessage());
        }
    }

    private ChatConversationDto toConversationDto(ChatConversation conv) {
        List<ChatMessage> msgs = conv.getMessages() != null
                ? conv.getMessages()
                : messageRepository.findByConversation_IdOrderByCreatedAtAsc(conv.getId());

        List<ChatMessageDto> msgDtos = msgs.stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());

        return new ChatConversationDto(
                conv.getId(),
                conv.getUserId(),
                conv.getUserName(),
                conv.getUserPhone(),
                conv.getUserEmail(),
                conv.getUserAvatar(),
                conv.getLastMessage(),
                conv.getLastMessageTime(),
                conv.getUnreadAdminCount(),
                conv.getUnreadUserCount(),
                conv.getStatus(),
                msgDtos
        );
    }

    private ChatMessageDto toMessageDto(ChatMessage msg) {
        return new ChatMessageDto(
                msg.getId(),
                msg.getConversation() != null ? msg.getConversation().getId() : null,
                msg.getSender(),
                msg.getSenderName(),
                msg.getSenderAvatar(),
                msg.getText(),
                msg.getTimestamp(),
                msg.isRead(),
                msg.getCreatedAt()
        );
    }
}
