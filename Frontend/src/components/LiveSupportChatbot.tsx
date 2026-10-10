import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  Check,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { ChatConversation, ChatMessage } from '../types';

export const LiveSupportChatbot: React.FC = () => {
  const { user, isChatOpen, setIsChatOpen, chatUnreadCount } = useApp();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine conversation ID: user id if logged in, or stable guest id
  const getConversationId = (): string => {
    if (user) {
      return `conv_${user.id}`;
    }
    let guestId = localStorage.getItem('deshi_guest_chat_id');
    if (!guestId) {
      guestId = `conv_guest_${Date.now()}`;
      localStorage.setItem('deshi_guest_chat_id', guestId);
    }
    return guestId;
  };

  const loadConversation = async () => {
    const convId = getConversationId();
    try {
      const res = await apiService.chat.getConversation(convId);
      if (res.data) {
        setConversation(res.data);
      } else {
        // Fallback default starter
        setConversation({
          id: convId,
          userId: user?.id,
          userName: user?.name || 'Guest Customer',
          userPhone: user?.phone,
          userEmail: user?.email,
          userAvatar: user?.avatarUrl,
          lastMessage: 'Welcome to Deshi Commerce live support!',
          lastMessageTime: 'Just now',
          unreadAdminCount: 0,
          unreadUserCount: 0,
          status: 'OPEN',
          messages: [
            {
              id: 'msg_welcome',
              conversationId: convId,
              sender: 'ADMIN',
              senderName: 'Deshi Support Team',
              text: 'Assalamu Alaikum! Welcome to Deshi Commerce. Feel free to ask any questions about our products, delivery, or orders. An admin is ready to assist you.',
              timestamp: 'Just now',
              isRead: true,
            },
          ],
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadConversation();

    const handleUpdate = () => {
      loadConversation();
    };

    window.addEventListener('deshi_chat_updated', handleUpdate);
    return () => window.removeEventListener('deshi_chat_updated', handleUpdate);
  }, [user]);

  // When chat opens, mark user unread messages as read
  useEffect(() => {
    if (isChatOpen) {
      const convId = getConversationId();
      apiService.chat.markRead(convId, 'USER');
      scrollToBottom();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    const convId = getConversationId();

    try {
      await apiService.chat.sendUserMessage({
        conversationId: convId,
        userId: user?.id,
        userName: user?.name || 'Guest Customer',
        userPhone: user?.phone,
        userEmail: user?.email,
        userAvatar: user?.avatarUrl,
        text,
      });

      setInputText('');
      await loadConversation();
      scrollToBottom();
    } catch {
      // fallback
    } finally {
      setIsSending(false);
    }
  };

  const quickChips = [
    '📦 Where is my order?',
    '💳 Cash on Delivery available?',
    '🚚 Delivery time to my area',
    '🏠 Need to update delivery address',
  ];

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 font-sans print:hidden">
      {/* Floating launcher trigger button */}
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-700/50"
          title="Direct Support Chat with Admin"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F172A] absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Direct Support
          </span>

          {chatUnreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
              {chatUnreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isChatOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header Bar */}
          <div className="bg-[#0F172A] text-white p-3.5 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0F172A] absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">Deshi Support Team</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span>Typically replies in minutes</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-600 shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Direct messages to Store Administrator</span>
            </span>
            <span className="font-semibold text-slate-500">Live</span>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
            {/* Introductory bubble */}
            <div className="text-center my-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 bg-white border border-slate-200 shadow-2xs font-mono">
                Encrypted Real-Time Support
              </span>
            </div>

            {/* Conversation Messages */}
            {conversation?.messages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mb-0.5">
                        <Headphones className="w-3 h-3 text-emerald-400" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                        isUser
                          ? 'bg-[#0F172A] text-white rounded-br-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {!isUser && (
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                          {msg.senderName || 'Admin'}
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isUser && (
                      msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write your message here..."
                disabled={isSending}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl focus:outline-none transition-all placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  inputText.trim() && !isSending
                    ? 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[9px] text-center text-slate-400 mt-1">
              Admin replies will also be notified in your profile account alerts
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
