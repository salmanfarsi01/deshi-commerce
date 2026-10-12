package com.example.SocialMedia.chat.repository;

import com.example.SocialMedia.chat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findByConversation_IdOrderByCreatedAtAsc(String conversationId);
}
