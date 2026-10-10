import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Check,
  CheckCheck,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Headphones,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { apiService } from '../../../services/apiClient';
import { ChatConversation, ChatMessage } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface AdminLiveChatTabProps {
  onInspectCustomer?: (userId: string) => void;
}

export const AdminLiveChatTab: React.FC<AdminLiveChatTabProps> = ({ onInspectCustomer }) => {
  const { user, showToast } = useApp();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await apiService.chat.getConversations();
      if (res.data) {
        setConversations(res.data);
        if (!selectedConvId && res.data.length > 0) {
          setSelectedConvId(res.data[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const handleUpdate = () => {
      fetchConversations();
    };

    window.addEventListener('deshi_chat_updated', handleUpdate);
    return () => window.removeEventListener('deshi_chat_updated', handleUpdate);
  }, []);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  useEffect(() => {
    if (activeConv && activeConv.unreadAdminCount > 0) {
      apiService.chat.markRead(activeConv.id, 'ADMIN');
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, unreadAdminCount: 0 } : c))
      );
    }
    scrollToBottom();
  }, [selectedConvId, activeConv?.messages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendReply = async (textToSend?: string) => {
    const text = (textToSend || replyText).trim();
    if (!text || !activeConv || isSending) return;

    setIsSending(true);
    try {
      await apiService.chat.sendAdminReply({
        conversationId: activeConv.id,
        adminName: user?.name || 'Store Administrator',
        text,
      });

      setReplyText('');
      await fetchConversations();
      scrollToBottom();
      showToast('Reply dispatched & customer notified in their profile', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch reply', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filter === 'UNREAD' && c.unreadAdminCount === 0) return false;
    if (filter === 'RESOLVED' && c.status !== 'RESOLVED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.userName.toLowerCase().includes(q);
      const matchPhone = (c.userPhone || '').includes(q);
      const matchMsg = c.lastMessage.toLowerCase().includes(q);
      return matchName || matchPhone || matchMsg;
    }
    return true;
  });

  const cannedResponses = [
    'Assalamu Alaikum! Your parcel has been dispatched via Steadfast courier.',
    'Yes, Cash on Delivery is available across all 64 districts in Bangladesh.',
    'We have noted your delivery address update. It is now saved in your profile.',
    'Our verification team is reviewing your payment and will update you shortly.',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[720px] max-h-[85vh]">
      {/* LEFT PANE: Conversation Directory */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
        {/* Search & Header */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Customer Live Chat</h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, mobile, message..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs pt-1">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({conversations.filter((c) => c.unreadAdminCount > 0).length})
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              const hasUnread = conv.unreadAdminCount > 0;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                    isSelected
                      ? 'bg-white border-l-4 border-slate-900 shadow-2xs'
                      : 'hover:bg-slate-100/60 bg-transparent'
                  }`}
                >
                  {/* Customer Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                      {conv.userAvatar ? (
                        <img
                          src={conv.userAvatar}
                          alt={conv.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {conv.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5" />
                    )}
                  </div>

                  {/* Conv Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {conv.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mb-1">
                      {conv.lastMessage}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">{conv.userPhone || 'Online Customer'}</span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[9px]">
                          {conv.unreadAdminCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat Window & Real-Time Messaging */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Thread Header Bar */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {activeConv.userAvatar ? (
                    <img
                      src={activeConv.userAvatar}
                      alt={activeConv.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {activeConv.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{activeConv.userName}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Customer
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>{activeConv.userPhone || 'No phone'}</span>
                    {activeConv.userEmail && <span>&bull; {activeConv.userEmail}</span>}
                  </div>
                </div>
              </div>

              {/* Actions: View Customer 360 */}
              <div className="flex items-center gap-2">
                {activeConv.userId && onInspectCustomer && (
                  <button
                    type="button"
                    onClick={() => onInspectCustomer(activeConv.userId!)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer 360</span>
                  </button>
                )}
                {activeConv.userPhone && (
                  <a
                    href={`https://wa.me/88${activeConv.userPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Message Thread Scroll View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/60">
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 shadow-2xs">
                  Direct Live Chat Thread &bull; User ID: {activeConv.userId || 'Guest'}
                </span>
              </div>

              {activeConv.messages.map((msg) => {
                const isAdmin = msg.sender === 'ADMIN';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0 mb-1">
                          {activeConv.userAvatar ? (
                            <img src={activeConv.userAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                              {activeConv.userName.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                          isAdmin
                            ? 'bg-[#0F172A] text-white rounded-br-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <div className={`text-[10px] font-bold mb-1 ${isAdmin ? 'text-slate-300' : 'text-slate-500'}`}>
                          {isAdmin ? (user?.name || 'Administrator') : activeConv.userName}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400 font-mono">
                      <span>{msg.timestamp}</span>
                      {isAdmin && <CheckCheck className="w-3 h-3 text-blue-400" />}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Canned Response Chips */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick:</span>
              </span>
              {cannedResponses.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendReply(item)}
                  className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeConv.userName} (will notify user profile)...`}
                  disabled={isSending}
                  className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl focus:outline-none transition-all placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    replyText.trim() && !isSending
                      ? 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
            Select a conversation on the left to start live chatting.
          </div>
        )}
      </div>
    </div>
  );
};
