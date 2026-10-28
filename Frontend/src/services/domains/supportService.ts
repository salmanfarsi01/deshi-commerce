import { apiClient, ApiResponse, wrapSuccess, simulateDelay, safeLocalStorage } from '../baseClient';
import {
  getNotificationLogs,
  getCurrentUser,
  getSupportTickets,
  submitSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  markSupportTicketRead,
  getChatConversations,
  getChatConversation,
  sendUserChatMessage,
  sendAdminChatMessage,
  markChatConversationRead,
  deleteChatConversation,
} from '../dbStorage';
import { NotificationLog, SupportTicket, ChatConversation, ChatMessage } from '../../types';

export const notificationService = {
  getMyNotifications: async (): Promise<ApiResponse<NotificationLog[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/users/me/notifications');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const logs: NotificationLog[] = res.data.data.map((n: any) => ({
          id: n.id,
          channel: n.channel,
          event: n.event,
          recipient: n.recipient,
          subject: n.subject || 'Order Update',
          message: n.message,
          status: n.status || 'SENT',
          orderId: n.orderId,
          userId: n.userId,
          timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
        }));
        return wrapSuccess(logs);
      }
    } catch {
      // Fallback
    }
    await simulateDelay(60);
    const user = getCurrentUser();
    const allLogs = getNotificationLogs();
    const filtered = user ? allLogs.filter((l) => !l.userId || l.userId === user.id) : allLogs;
    return wrapSuccess(filtered);
  },
};

export const supportTicketService = {
  getTickets: async (): Promise<ApiResponse<SupportTicket[]>> => {
    await simulateDelay(30);
    return wrapSuccess(getSupportTickets());
  },
  submitTicket: async (ticket: {
    name: string;
    contact: string;
    orderNumber?: string;
    topic: string;
    message: string;
  }): Promise<ApiResponse<SupportTicket>> => {
    await simulateDelay(50);
    const newTicket = submitSupportTicket(ticket);
    return wrapSuccess(newTicket, 'Support inquiry submitted successfully');
  },
  updateTicket: async (
    id: string,
    updates: Partial<SupportTicket>
  ): Promise<ApiResponse<SupportTicket | null>> => {
    await simulateDelay(40);
    const updated = updateSupportTicket(id, updates);
    return wrapSuccess(updated, 'Support ticket updated');
  },
  deleteTicket: async (id: string): Promise<ApiResponse<boolean>> => {
    await simulateDelay(30);
    const ok = deleteSupportTicket(id);
    return wrapSuccess(ok, 'Ticket deleted');
  },
  markRead: async (id: string): Promise<ApiResponse<void>> => {
    markSupportTicketRead(id);
    return wrapSuccess(undefined);
  },
};

export const chatService = {
  getConversations: async (): Promise<ApiResponse<ChatConversation[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<ChatConversation[]>>('/chat/conversations');
      if (res.data && Array.isArray(res.data.data)) {
        safeLocalStorage.setItem('deshi_chat_conversations_v1', JSON.stringify(res.data.data));
        return res.data;
      }
    } catch {
      // Fallback to local storage if backend offline
    }
    return wrapSuccess(getChatConversations());
  },
  getConversation: async (id: string): Promise<ApiResponse<ChatConversation | null>> => {
    try {
      const res = await apiClient.get<ApiResponse<ChatConversation>>(`/chat/conversations/${encodeURIComponent(id)}`);
      if (res.data && res.data.data) {
        return res.data;
      }
    } catch {
      // Fallback
    }
    const conv = getChatConversation(id);
    return wrapSuccess(conv || null);
  },
  sendUserMessage: async (payload: {
    conversationId: string;
    userId?: string;
    userName: string;
    userPhone?: string;
    userEmail?: string;
    userAvatar?: string;
    text: string;
  }): Promise<ApiResponse<ChatMessage>> => {
    try {
      const res = await apiClient.post<ApiResponse<ChatMessage>>('/chat/send-user', payload);
      if (res.data && res.data.data) {
        sendUserChatMessage(payload);
        return res.data;
      }
    } catch {
      // Fallback
    }
    const res = sendUserChatMessage(payload);
    return wrapSuccess(res.message, 'Message sent to support team');
  },
  sendAdminReply: async (payload: {
    conversationId: string;
    adminName: string;
    text: string;
  }): Promise<ApiResponse<ChatMessage>> => {
    try {
      const res = await apiClient.post<ApiResponse<ChatMessage>>('/chat/reply-admin', payload);
      if (res.data && res.data.data) {
        sendAdminChatMessage(payload);
        return res.data;
      }
    } catch {
      // Fallback
    }
    const res = sendAdminChatMessage(payload);
    return wrapSuccess(res.message, 'Reply sent to customer');
  },
  markRead: async (conversationId: string, role: 'USER' | 'ADMIN'): Promise<ApiResponse<void>> => {
    try {
      await apiClient.put(`/chat/conversations/${encodeURIComponent(conversationId)}/read?role=${role}`, { role });
    } catch {
      // Fallback
    }
    markChatConversationRead(conversationId, role);
    return wrapSuccess(undefined);
  },
  deleteConversation: async (conversationId: string): Promise<ApiResponse<boolean>> => {
    try {
      const res = await apiClient.delete<ApiResponse<boolean>>(`/chat/conversations/${encodeURIComponent(conversationId)}`);
      if (res.data && res.data.success) {
        deleteChatConversation(conversationId);
        return res.data;
      }
    } catch {
      // Fallback
    }
    const res = deleteChatConversation(conversationId);
    return wrapSuccess(res, 'Conversation permanently deleted');
  },
};
