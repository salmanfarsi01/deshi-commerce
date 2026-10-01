import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, CheckCheck, Sparkles, HelpCircle, PhoneCall } from 'lucide-react';
import footerLogo from '../images/footer logo.png';

interface WhatsAppChatWidgetProps {
  whatsappNumber?: string; // International format without + (e.g. 8801700000000)
  storeName?: string;
}

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  whatsappNumber = '8801712345678', // Default Bangladesh merchant WhatsApp number
  storeName = 'Deshi Commerce Support',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  // Auto-prompt badge animation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prompt user subtly after 4 seconds
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const quickPrompts = [
    '📦 I want to track my order status',
    '💳 Need assistance with bKash / Card payment',
    '🏷️ Any special voucher or discount available?',
    '🚚 How fast is home delivery to my district?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || message;
    if (!msg.trim()) return;

    const encodedMessage = encodeURIComponent(msg.trim());
    // Direct WhatsApp chat link
    const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 font-sans print:hidden">
      {/* Floating Messenger / WhatsApp Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Tooltip / Prompt bubble on hover */}
          <div className="absolute right-0 bottom-full mb-3 hidden group-hover:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none transition-all">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Chat on WhatsApp with Us!</span>
          </div>

          {/* Unread indicator badge */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
              1
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setHasUnread(false);
            }}
            className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-108 active:scale-95 border-2 border-white/40 ring-4 ring-[#25D366]/20"
            aria-label="Open WhatsApp Chat"
          >
            <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
          </button>
        </div>
      )}

      {/* Messenger-Style Floating Chat Dialog */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          {/* Header (WhatsApp Brand Style) */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-inner">
                  <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
                </div>
                {/* Live pulsating green dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>{storeName}</span>
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online &bull; Replies within minutes</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body (Message Area) */}
          <div className="p-4 bg-[#F8FAFC] space-y-3.5 max-h-[360px] overflow-y-auto text-xs">
            {/* Timestamp */}
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Direct WhatsApp Channel
              </span>
            </div>

            {/* Agent Greeting Bubble */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                DS
              </div>
              <div className="space-y-1 max-w-[82%]">
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/80 text-slate-800 leading-relaxed text-xs">
                  <p className="font-semibold text-slate-950 mb-1">Assalamu Alaikum! 👋</p>
                  <p>Welcome to Deshi Commerce. How can we help you right now? Click any option below or type your question:</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1 font-mono">
                  <span>Just now</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                Frequently Asked:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left px-3 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-xl border border-slate-200 hover:border-emerald-300 text-xs font-medium transition-all shadow-2xs cursor-pointer flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-100 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message on WhatsApp..."
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
              <span>Direct merchant response</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected to WhatsApp
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
