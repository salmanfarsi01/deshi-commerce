import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  CheckCheck,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Printer,
  Trash2,
  X,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  FileDown,
  ArrowLeft,
  Users,
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
  const [activePopupConv, setActivePopupConv] = useState<ChatConversation | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');

  const messagesScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const popupMessagesScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await apiService.chat.getConversations();
      if (res.data) {
        setConversations(res.data);
        if (activePopupConv) {
          const updated = res.data.find((c) => c.id === activePopupConv.id);
          if (updated) setActivePopupConv(updated);
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
  }, [activePopupConv?.id]);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  // Mark read when selecting conversation
  useEffect(() => {
    const target = activePopupConv || activeConv;
    if (target && target.unreadAdminCount > 0) {
      apiService.chat.markRead(target.id, 'ADMIN');
      setConversations((prev) =>
        prev.map((c) => (c.id === target.id ? { ...c, unreadAdminCount: 0 } : c))
      );
      if (activePopupConv && activePopupConv.id === target.id) {
        setActivePopupConv((prev) => (prev ? { ...prev, unreadAdminCount: 0 } : null));
      }
    }
    scrollToBottom();
  }, [selectedConvId, activePopupConv?.id, activeConv?.messages?.length, activePopupConv?.messages?.length]);

  // Safe internal scrolling that does NOT shift the browser viewport horizontally
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesScrollContainerRef.current) {
        messagesScrollContainerRef.current.scrollTop = messagesScrollContainerRef.current.scrollHeight;
      }
      if (popupMessagesScrollContainerRef.current) {
        popupMessagesScrollContainerRef.current.scrollTop = popupMessagesScrollContainerRef.current.scrollHeight;
      }
    }, 60);
  };

  const handleSelectConv = (conv: ChatConversation) => {
    setSelectedConvId(conv.id);
    setMobileView('CHAT');
    if (conv.unreadAdminCount > 0) {
      apiService.chat.markRead(conv.id, 'ADMIN');
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadAdminCount: 0 } : c))
      );
    }
    scrollToBottom();
  };

  const handleOpenPopup = (conv: ChatConversation) => {
    setSelectedConvId(conv.id);
    setActivePopupConv(conv);
    if (conv.unreadAdminCount > 0) {
      apiService.chat.markRead(conv.id, 'ADMIN');
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadAdminCount: 0 } : c))
      );
    }
    scrollToBottom();
  };

  const handleClosePopup = () => {
    setActivePopupConv(null);
    setReplyText('');
  };

  const handleSendReply = async (convTarget?: ChatConversation, textToSend?: string) => {
    const target = convTarget || activePopupConv || activeConv;
    const text = (textToSend || replyText).trim();
    if (!text || !target || isSending) return;

    setIsSending(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistically create local message so admin sees it immediately with zero lag
    const tempMsg: ChatMessage = {
      id: `msg_temp_${Date.now()}`,
      conversationId: target.id,
      sender: 'ADMIN',
      senderName: user?.name || 'Store Administrator',
      text,
      timestamp: timeStr,
      isRead: false,
    };

    // Update conversation immediately in memory
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === target.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: timeStr,
            unreadAdminCount: 0,
            messages: [...c.messages, tempMsg],
          };
        }
        return c;
      })
    );

    if (activePopupConv && activePopupConv.id === target.id) {
      setActivePopupConv((prev) =>
        prev
          ? {
              ...prev,
              lastMessage: text,
              lastMessageTime: timeStr,
              unreadAdminCount: 0,
              messages: [...prev.messages, tempMsg],
            }
          : null
      );
    }

    setReplyText('');
    scrollToBottom();

    try {
      await apiService.chat.sendAdminReply({
        conversationId: target.id,
        adminName: user?.name || 'Store Administrator',
        text,
      });

      await fetchConversations();
      scrollToBottom();
      showToast('Reply dispatched & user notified in their profile', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch reply', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async (convId: string, convName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the chat history with ${convName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.chat.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activePopupConv?.id === convId) {
        setActivePopupConv(null);
      }
      if (selectedConvId === convId) {
        const remaining = conversations.filter((c) => c.id !== convId);
        setSelectedConvId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast(`Conversation with ${convName} deleted permanently`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete conversation', 'error');
    }
  };

  // Official PDF / Print Transcript Generator
  const handlePrintChat = (conv: ChatConversation) => {
    const printWindow = window.open('', '_blank', 'width=900,height=950');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to download PDF / print transcript.', 'error');
      return;
    }

    const messagesHtml = conv.messages
      .map((m) => {
        const isAdmin = m.sender === 'ADMIN';
        return `
          <div style="margin-bottom: 14px; padding: 12px 16px; border-radius: 12px; background-color: ${
            isAdmin ? '#0F172A' : '#FFFFFF'
          }; color: ${isAdmin ? '#FFFFFF' : '#0F172A'}; border: 1px solid ${isAdmin ? '#0F172A' : '#E2E8F0'}; max-width: 80%; margin-left: ${
          isAdmin ? 'auto' : '0'
        }; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11px; font-weight: 700; color: ${
              isAdmin ? '#93C5FD' : '#2563EB'
            };">
              <span>${isAdmin ? 'Store Administrator (' + (m.senderName || 'Deshi Support') + ')' : conv.userName + ' (Customer)'}</span>
              <span style="font-weight: 400; color: ${isAdmin ? '#94A3B8' : '#64748B'};">${m.timestamp}</span>
            </div>
            <div style="font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${m.text}</div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Chat Transcript PDF - ${conv.userName}</title>
          <style>
            @page { margin: 15mm; size: auto; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              background-color: #FFFFFF;
              margin: 0;
              padding: 24px;
            }
            .no-print {
              margin-bottom: 24px;
              padding: 12px 16px;
              background: #F1F5F9;
              border-radius: 12px;
              display: flex;
              gap: 12px;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #CBD5E1;
            }
            .header {
              border-bottom: 2px solid #0F172A;
              padding-bottom: 16px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: -0.5px;
              color: #0F172A;
            }
            .tagline {
              font-size: 12px;
              color: #64748B;
              margin-top: 3px;
            }
            .meta-box {
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 10px;
              padding: 14px 18px;
              margin-bottom: 24px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px 24px;
              font-size: 12px;
            }
            .meta-item strong {
              color: #475569;
              display: inline-block;
              width: 130px;
            }
            .chat-container {
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px dashed #CBD5E1;
              font-size: 11px;
              color: #94A3B8;
              text-align: center;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <span style="font-size: 13px; font-weight: 600; color: #334155;">
              Ready to print or save as PDF
            </span>
            <div style="display: flex; gap: 8px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #0F172A; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span>Save as PDF / Print Transcript</span>
              </button>
              <button onclick="window.close()" style="padding: 10px 16px; background: #E2E8F0; color: #334155; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Close
              </button>
            </div>
          </div>

          <div class="header">
            <div>
              <div class="brand">DESHI COMMERCE</div>
              <div class="tagline">Official Customer Service &amp; Support Direct Chat Transcript</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748B;">
              <div><strong>Conversation ID:</strong> ${conv.id}</div>
              <div><strong>Generated Date:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
            </div>
          </div>

          <div class="meta-box">
            <div class="meta-item"><strong>Customer Name:</strong> ${conv.userName}</div>
            <div class="meta-item"><strong>Customer Mobile:</strong> ${conv.userPhone || 'Not provided'}</div>
            <div class="meta-item"><strong>Customer Email:</strong> ${conv.userEmail || 'Not provided'}</div>
            <div class="meta-item"><strong>Total Messages:</strong> ${conv.messages.length}</div>
            <div class="meta-item"><strong>Chat Status:</strong> ${conv.status}</div>
            <div class="meta-item"><strong>Support Agent:</strong> ${user?.name || 'Administrator'}</div>
          </div>

          <div class="chat-container">
            <h4 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
              Chronological Messages Log
            </h4>
            ${messagesHtml}
          </div>

          <div class="footer">
            Confidential Document &bull; Generated for customer records and order dispute resolution &bull; Deshi Commerce Customer Service
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  };

  // Filter conversations safely
  const filteredConversations = conversations.filter((c) => {
    if (filter === 'UNREAD' && (c.unreadAdminCount || 0) === 0) return false;
    if (filter === 'RESOLVED' && c.status !== 'RESOLVED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (c.userName || '').toLowerCase().includes(q);
      const matchPhone = (c.userPhone || '').includes(q);
      const matchEmail = (c.userEmail || '').toLowerCase().includes(q);
      const matchMsg = (c.lastMessage || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchMsg;
    }
    return true;
  });

  const cannedResponses = [
    'Assalamu Alaikum! Your parcel has been dispatched via Steadfast courier.',
    'Yes, Cash on Delivery is available across all 64 districts in Bangladesh.',
    'We have noted your delivery address update. It is now saved in your profile.',
    'Our verification team is reviewing your payment and will update you shortly.',
    'Thank you for contacting Deshi Commerce support!',
  ];

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Customer Support Messenger</span>
                {totalUnreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    {totalUnreadCount} unread
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Direct live chat inquiries from store customers. Click any user to view chat history, reply, download PDF transcripts, or delete conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary Badges & PDF Print Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Users</span>
            <span className="text-xs font-black text-slate-800 font-mono">{conversations.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 block uppercase font-bold">Unread</span>
            <span className="text-xs font-black text-emerald-800 font-mono">{totalUnreadCount}</span>
          </div>

          {activeConv && (
            <button
              type="button"
              onClick={() => handlePrintChat(activeConv)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Download PDF / Print Transcript of active conversation"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Download PDF / Print</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchConversations}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Toggle Bar between User List & Active Chat */}
      <div className="md:hidden flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileView('LIST')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'LIST'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Users ({conversations.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('CHAT')}
          disabled={!activeConv}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'CHAT'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Active Chat {activeConv ? `(${activeConv.userName})` : ''}</span>
        </button>
      </div>

      {/* Two-Pane Messenger Layout with Strict Width Constraints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[760px] max-h-[85vh] w-full max-w-full">
        {/* ========================================================================= */}
        {/* LEFT PANE: All Users Messenger Directory */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 min-h-0 ${
            mobileView === 'CHAT' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Header */}
          <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Conversations</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {filteredConversations.length} Users
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, mobile, message..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all placeholder-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 text-xs pt-0.5">
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
                Unread ({conversations.filter((c) => (c.unreadAdminCount || 0) > 0).length})
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No customer conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const hasUnread = (conv.unreadAdminCount || 0) > 0;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all relative ${
                      isSelected
                        ? 'bg-white border-l-4 border-slate-900 shadow-2xs'
                        : 'hover:bg-slate-100/70 bg-transparent'
                    }`}
                  >
                    {/* Customer Avatar with Live Status Dot */}
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
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
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

                      <div className={`text-[11px] truncate mb-1.5 ${hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        {conv.lastMessage || 'Sent an attachment / inquiry'}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono truncate">{conv.userPhone || conv.userEmail || 'Store Customer'}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {hasUnread && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold text-[9px] animate-pulse">
                              {conv.unreadAdminCount} new
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">
                            {conv.messages.length} msgs
                          </span>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintChat(conv);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                          title="Download PDF / Print"
                        >
                          <FileDown className="w-3 h-3 text-rose-500" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id, conv.userName);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPopup(conv);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center gap-0.5 transition-colors"
                          title="Open dedicated pop-up modal"
                        >
                          <span>Pop-up</span> &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: Direct Messenger View (Strictly Constrained) */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 min-w-0 max-w-full flex flex-col bg-white overflow-hidden min-h-0 ${
            mobileView === 'LIST' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Thread Header Bar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileView('LIST')}
                    className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
                    title="Back to all users"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
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
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{activeConv.userName}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Connected
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{activeConv.userPhone || 'No mobile'}</span>
                      {activeConv.userEmail && <span>&bull; {activeConv.userEmail}</span>}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons (Always Visible & Labeled) */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Download PDF / Print Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintChat(activeConv)}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download PDF transcript or Print"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF / Print</span>
                  </button>

                  {/* Open Pop-up Window */}
                  <button
                    type="button"
                    onClick={() => handleOpenPopup(activeConv)}
                    className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Open individual pop-up modal"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pop-up Window</span>
                  </button>

                  {/* Delete Conversation */}
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(activeConv.id, activeConv.userName)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Permanently delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Delete</span>
                  </button>

                  {/* Customer 360 */}
                  {activeConv.userId && onInspectCustomer && (
                    <button
                      type="button"
                      onClick={() => onInspectCustomer(activeConv.userId!)}
                      className="hidden xl:flex px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold items-center gap-1 transition-colors cursor-pointer"
                      title="Inspect Customer 360 Profile"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread Scroll View (Constrained to pane width) */}
              <div
                ref={messagesScrollContainerRef}
                className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3.5 bg-slate-50/70 min-h-0"
              >
                <div className="text-center my-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 shadow-2xs">
                    Customer Chat History &bull; Stored until deleted &bull; {activeConv.messages.length} messages
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  const isAdmin = msg.sender === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col w-full ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
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
                            {isAdmin ? (user?.name || 'Store Administrator') : activeConv.userName}
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
              </div>

              {/* Quick Canned Response Chips */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick:</span>
                </span>
                {cannedResponses.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(activeConv, item)}
                    className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Reply Input Box */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 max-w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendReply(activeConv);
                  }}
                  className="flex items-center gap-2 w-full max-w-full"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeConv.userName} (will notify user profile)...`}
                    disabled={isSending}
                    className="min-w-0 flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl focus:outline-none transition-all placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className={`shrink-0 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs gap-3">
              <MessageSquare className="w-10 h-10 text-slate-300 stroke-1" />
              <p>Select any customer conversation from the list to view messages and reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INDIVIDUAL USER CHAT POP-UP MODAL */}
      {/* ========================================================================= */}
      {activePopupConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-2xl h-[90vh] max-h-[720px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Pop-up Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 relative">
                  {activePopupConv.userAvatar ? (
                    <img
                      src={activePopupConv.userAvatar}
                      alt={activePopupConv.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                      {activePopupConv.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{activePopupConv.userName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Chat
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2 mt-0.5 truncate">
                    <span>{activePopupConv.userPhone || 'No mobile'}</span>
                    {activePopupConv.userEmail && <span>&bull; {activePopupConv.userEmail}</span>}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePrintChat(activePopupConv)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Download PDF transcript or Print"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF / Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteConversation(activePopupConv.id, activePopupConv.userName)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Delete conversation permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>

                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close pop-up"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pop-up Message Feed */}
            <div
              ref={popupMessagesScrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3.5 bg-slate-50/70 min-h-0"
            >
              <div className="text-center my-1">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 shadow-2xs">
                  Chatting with {activePopupConv.userName} &bull; History stored until deleted &bull; {activePopupConv.messages.length} messages
                </span>
              </div>

              {activePopupConv.messages.map((msg) => {
                const isAdmin = msg.sender === 'ADMIN';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col w-full ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0 mb-1">
                          {activePopupConv.userAvatar ? (
                            <img src={activePopupConv.userAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                              {activePopupConv.userName.charAt(0)}
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
                          {isAdmin ? (user?.name || 'Store Administrator') : activePopupConv.userName}
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
            </div>

            {/* Quick Canned Responses in Pop-up */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick:</span>
              </span>
              {cannedResponses.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendReply(activePopupConv, item)}
                  className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Reply Input Box in Pop-up */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0 max-w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply(activePopupConv);
                }}
                className="flex items-center gap-2.5 w-full max-w-full"
              >
                <input
                  type="text"
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply directly to ${activePopupConv.userName}...`}
                  disabled={isSending}
                  className="min-w-0 flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl focus:outline-none transition-all placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className={`shrink-0 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    replyText.trim() && !isSending
                      ? 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                <span>User receives this reply instantly with a notification badge in their profile.</span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
