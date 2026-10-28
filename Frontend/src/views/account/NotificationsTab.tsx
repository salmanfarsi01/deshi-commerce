import React, { useState, useEffect } from 'react';
import { Bell, Headphones, Mail, Smartphone, MessageSquare, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
import { NotificationLog } from '../../types';

export const NotificationsTab: React.FC = () => {
  const { openChat, viewOrderDetail } = useApp();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    setLoadingNotifications(true);
    apiService.notifications.getMyNotifications()
      .then((res) => {
        setNotifications(res.data);
      })
      .finally(() => {
        setLoadingNotifications(false);
      });
  }, []);

  if (loadingNotifications) {
    return <div className="p-12 text-center text-slate-500 text-xs">Loading alerts...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
        <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="font-bold text-slate-900 text-sm">No Notifications Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          Updates on orders and direct replies from our admin team will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notif) => {
        const isSupportChat = notif.channel === 'SUPPORT' || notif.event === 'SUPPORT_INQUIRY';
        return (
          <div
            key={notif.id}
            className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs ${
              isSupportChat ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Channel Badge */}
                <span
                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 text-[10px] rounded-md uppercase tracking-wider ${
                    isSupportChat
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : notif.channel === 'EMAIL'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isSupportChat ? (
                    <Headphones className="w-3 h-3" />
                  ) : notif.channel === 'EMAIL' ? (
                    <Mail className="w-3 h-3" />
                  ) : (
                    <Smartphone className="w-3 h-3" />
                  )}
                  {isSupportChat ? 'LIVE SUPPORT' : notif.channel}
                </span>

                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(notif.timestamp).toLocaleString('en-GB')}
                </span>
              </div>

              {notif.subject && (
                <h4 className="text-sm font-bold text-slate-900">{notif.subject}</h4>
              )}

              <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans shadow-2xs">
                {notif.message}
              </div>
            </div>

            <div className="flex md:flex-col items-end shrink-0 pt-2 md:pt-0">
              {isSupportChat ? (
                <button
                  type="button"
                  onClick={openChat}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Live Chat</span>
                </button>
              ) : notif.orderId ? (
                <button
                  type="button"
                  onClick={() => viewOrderDetail(notif.orderId!)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>View Order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
