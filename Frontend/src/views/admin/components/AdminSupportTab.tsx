import React, { useMemo } from 'react';
import {
  MessageCircle,
  Mail,
  Search,
  HelpCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Trash2,
} from 'lucide-react';
import { SupportTicket, NotificationLog } from '../../../types';

interface Props {
  supportTickets: SupportTicket[];
  openTicketsCount: number;
  supportFilter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  onSupportFilterChange: (f: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
  supportSearch: string;
  onSupportSearchChange: (s: string) => void;
  notifications: NotificationLog[];
  notificationSubTab: 'SUPPORT' | 'LOGS';
  onNotificationSubTabChange: (tab: 'SUPPORT' | 'LOGS') => void;
  ticketNotesInput: { [ticketId: string]: string };
  onTicketNotesInputChange: (ticketId: string, val: string) => void;
  onSaveTicketNote: (ticketId: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
  onDeleteTicket: (ticketId: string) => void;
  onViewOrder: (orderNumber: string) => void;
}

export const AdminSupportTab: React.FC<Props> = ({
  supportTickets,
  openTicketsCount,
  supportFilter,
  onSupportFilterChange,
  supportSearch,
  onSupportSearchChange,
  notifications,
  notificationSubTab,
  onNotificationSubTabChange,
  ticketNotesInput,
  onTicketNotesInputChange,
  onSaveTicketNote,
  onUpdateTicketStatus,
  onDeleteTicket,
  onViewOrder,
}) => {
  const filteredSupportTickets = useMemo(() => {
    return supportTickets.filter((ticket) => {
      const matchesFilter = supportFilter === 'ALL' || ticket.status === supportFilter;
      const q = supportSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ticket.name.toLowerCase().includes(q) ||
        ticket.contact.toLowerCase().includes(q) ||
        ticket.topic.toLowerCase().includes(q) ||
        ticket.message.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q) ||
        (ticket.orderNumber && ticket.orderNumber.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [supportTickets, supportFilter, supportSearch]);

  return (
    <div className="space-y-5">
      {/* Top Sub-Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNotificationSubTabChange('SUPPORT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              notificationSubTab === 'SUPPORT'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Customer Support Inquiries</span>
            {openTicketsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {openTicketsCount} New
              </span>
            ) : (
              <span className="text-[10px] opacity-75 font-mono">({supportTickets.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNotificationSubTabChange('LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              notificationSubTab === 'LOGS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-sky-400" />
            <span>SMS &amp; Email Dispatch Logs</span>
            <span className="text-[10px] opacity-75 font-mono">({notifications.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {notificationSubTab === 'SUPPORT' ? 'Direct Customer Assistance' : 'Communication Audit Trail'}
        </div>
      </div>

      {/* SUB-VIEW 1: CUSTOMER SUPPORT INQUIRIES & DIRECT REACH-OUT */}
      {notificationSubTab === 'SUPPORT' && (
        <div className="space-y-4">
          {/* Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</div>
              <div className="text-xl font-black text-slate-900 mt-1 font-mono">{supportTickets.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Needs Action
              </div>
              <div className="text-xl font-black text-rose-600 mt-1 font-mono">{openTicketsCount}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                In Progress
              </div>
              <div className="text-xl font-black text-amber-600 mt-1 font-mono">
                {supportTickets.filter((t) => t.status === 'IN_PROGRESS').length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Resolved
              </div>
              <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
                {supportTickets.filter((t) => t.status === 'RESOLVED').length}
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
              {[
                { id: 'ALL', label: `All (${supportTickets.length})` },
                { id: 'OPEN', label: `🔴 Needs Action (${openTicketsCount})` },
                { id: 'IN_PROGRESS', label: `🟡 In Progress (${supportTickets.filter((t) => t.status === 'IN_PROGRESS').length})` },
                { id: 'RESOLVED', label: `🟢 Resolved (${supportTickets.filter((t) => t.status === 'RESOLVED').length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSupportFilterChange(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    supportFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={supportSearch}
                  onChange={(e) => onSupportSearchChange(e.target.value)}
                  placeholder="Search client, phone, topic, ticket..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Inquiry Cards List */}
          {filteredSupportTickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">No Support Inquiries Found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {supportSearch
                  ? 'No inquiries match your current search query.'
                  : 'All incoming customer messages will appear here with complete contact info for immediate resolution.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSupportTickets.map((ticket) => {
                const cleanPhone = (ticket.phone || ticket.contact || '').replace(/[^0-9+]/g, '');
                const isPhone = !!cleanPhone && cleanPhone.length >= 10;
                const isEmail = ticket.contact.includes('@');

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow space-y-4 ${
                      ticket.status === 'OPEN'
                        ? 'border-rose-200 ring-1 ring-rose-100'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'border-amber-200'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Card Header: Client Info & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-base shadow-xs">
                          {ticket.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{ticket.name}</h4>
                            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                              #{ticket.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono mt-0.5">
                            <span className="font-bold text-slate-800">{ticket.contact}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-slate-400 text-[11px]">{ticket.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ticket.topic}
                        </span>

                        {ticket.status === 'OPEN' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Needs Action
                          </span>
                        )}
                        {ticket.status === 'IN_PROGRESS' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            In Progress
                          </span>
                        )}
                        {ticket.status === 'RESOLVED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Body & Associated Order */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Client Inquiry Message:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">
                        {ticket.message}
                      </p>

                      {ticket.orderNumber && (
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Linked Order:</span>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {ticket.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => onViewOrder(ticket.orderNumber!)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-1"
                          >
                            View Order #{ticket.orderNumber} &rarr;
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DIRECT CLIENT REACH-OUT ACTIONS (Call, WhatsApp, Email) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 mr-1">Reach Client:</span>

                        {/* Call Customer Button */}
                        {isPhone ? (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                            title={`Call ${cleanPhone} directly`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {cleanPhone}</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>No Phone</span>
                          </button>
                        )}

                        {/* WhatsApp Direct Chat */}
                        {isPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                              `Hello ${ticket.name}, thank you for contacting Deshi Commerce regarding support inquiry #${ticket.id} (${ticket.topic}). How can I assist you today?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            title="Open direct WhatsApp conversation"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Direct Email */}
                        {(isEmail || ticket.email) && (
                          <a
                            href={`mailto:${ticket.email || ticket.contact}?subject=${encodeURIComponent(
                              `Regarding Support Inquiry #${ticket.id} - Deshi Commerce`
                            )}&body=${encodeURIComponent(
                              `Dear ${ticket.name},\n\nThank you for contacting Deshi Commerce Customer Care regarding your inquiry #${ticket.id} (${ticket.topic}).\n\n\nBest regards,\nCustomer Support Team\nDeshi Commerce`
                            )}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                            title="Send email to client"
                          >
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span>Email</span>
                          </a>
                        )}
                      </div>

                      {/* Status Resolution Controls */}
                      <div className="flex items-center gap-2">
                        {ticket.status !== 'RESOLVED' ? (
                          <>
                            {ticket.status !== 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() => onUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer transition-colors"
                              >
                                Mark In Progress
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onUpdateTicketStatus(ticket.id, 'RESOLVED')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark as Solved</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onUpdateTicketStatus(ticket.id, 'OPEN')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 transition-colors"
                          >
                            <span>Re-open Inquiry</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteTicket(ticket.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Admin Resolution Notes Strip */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {ticket.adminNotes && (
                        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-xs text-emerald-950">
                          <div className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider mb-0.5">
                            Saved Resolution / Action Taken:
                          </div>
                          <div className="font-medium">{ticket.adminNotes}</div>
                          {ticket.resolvedAt && (
                            <div className="text-[10px] text-emerald-600 mt-1 font-mono">
                              Resolved on: {new Date(ticket.resolvedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ticketNotesInput[ticket.id] !== undefined ? ticketNotesInput[ticket.id] : (ticket.adminNotes || '')}
                          onChange={(e) => onTicketNotesInputChange(ticket.id, e.target.value)}
                          placeholder="Add resolution note (e.g. Called customer, confirmed redelivery address, solved)..."
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => onSaveTicketNote(ticket.id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer transition-colors"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: AUTOMATED SMS & EMAIL NOTIFICATION LOGS */}
      {notificationSubTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              SMS &amp; Email Notification Dispatch Logs
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of all automated customer communications triggered by order status, courier dispatches, and system events
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Message Content</th>
                    <th className="py-3 px-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {n.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          n.channel === 'SMS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : n.channel === 'SUPPORT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {n.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {n.event}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {n.recipient}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {n.message}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
