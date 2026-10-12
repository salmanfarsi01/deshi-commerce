package com.example.SocialMedia.chat.repository;

import com.example.SocialMedia.chat.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {

    Optional<ChatConversation> findByUserId(String userId);

    List<ChatConversation> findAllByOrderByUpdatedAtDesc();
}
