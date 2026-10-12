package com.example.SocialMedia.chat.dto;

public class SendUserChatMessageDto {
    private String conversationId;
    private String userId;
    private String userName;
    private String userPhone;
    private String userEmail;
    private String userAvatar;
    private String text;

    public SendUserChatMessageDto() {
    }

    public SendUserChatMessageDto(String conversationId, String userId, String userName,
                                  String userPhone, String userEmail, String userAvatar, String text) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.userName = userName;
        this.userPhone = userPhone;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
        this.text = text;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
