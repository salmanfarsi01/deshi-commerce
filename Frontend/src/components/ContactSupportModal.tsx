import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Phone, Mail, HelpCircle, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { apiService } from '../services/apiClient';

export const ContactSupportModal: React.FC = () => {
  const { isSupportModalOpen, closeSupportModal, user, showToast, lang } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.phone || user?.email || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [topic, setTopic] = useState('Order Delivery Inquiry');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isSupportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiService.support.submitTicket({
        name: name.trim(),
        contact: contact.trim(),
        orderNumber: orderNumber.trim() || undefined,
        topic,
        message: message.trim(),
      });

      const ticketId = res.data?.id || `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket(ticketId);
      showToast(
        lang === 'bn'
          ? `সাপোর্ট টিকিট #${ticketId} সফলভাবে গৃহীত হয়েছে! এডমিন টিম শীঘ্রই যোগাযোগ করবেন।`
          : `Support ticket #${ticketId} submitted! Admin has been notified with your contact info.`,
        'success'
      );
    } catch (err) {
      showToast('Failed to submit ticket. Please try again or call hotline.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setMessage('');
    setOrderNumber('');
    closeSupportModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {lang === 'bn' ? 'কাস্টমার সাপোর্ট ও হেল্প ডেস্ক' : 'Customer Support & Help Desk'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'bn' ? 'সরাসরি ঢাকা সেন্ট্রাল সাপোর্ট টিম' : 'Direct Dhaka Central Support Desk'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSupportModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Submitted Success View */}
        {submittedTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {lang === 'bn' ? 'টিকিট সফল হয়েছে' : 'Inquiry Received'}
              </span>
              <h4 className="text-lg font-bold text-[#0F172A]">
                {lang === 'bn' ? 'টিকেট আইডি:' : 'Ticket ID:'}{' '}
                <span className="font-mono text-rose-600">{submittedTicket}</span>
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed pt-1">
                {lang === 'bn'
                  ? 'আপনার অনুরোধ আমাদের কাস্টমার কেয়ারে জমা হয়েছে। আমাদের প্রতিনিধি ২ ঘণ্টার মধ্যে যোগাযোগ করবেন।'
                  : 'Your request has been routed to our customer support officers. A representative will contact you via phone or email within 2 business hours.'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-left text-slate-700 space-y-1.5 font-mono">
              <div><strong>Name:</strong> {name}</div>
              <div><strong>Contact:</strong> {contact}</div>
              {orderNumber && <div><strong>Cash Memo / Order:</strong> {orderNumber}</div>}
              <div><strong>Department:</strong> {topic}</div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
            >
              {lang === 'bn' ? 'ঠিক আছে' : 'Done & Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
            {/* Quick Hotline Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold">Hotline: 09612-DESHI</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>9 AM – 10 PM Everyday</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  {lang === 'bn' ? 'আপনার নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  {lang === 'bn' ? 'ফোন বা ইমেইল' : 'Phone / Email'} *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="017XXXXXXXX or email"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  {lang === 'bn' ? 'ক্যাশ মেমো / অর্ডার নং' : 'Cash Memo / Order #'}
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ORD-2026-8491"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                  {lang === 'bn' ? 'বিষয়' : 'Inquiry Topic'} *
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-800"
                >
                  <option value="Order Delivery Inquiry">Order Delivery Inquiry</option>
                  <option value="Cash Memo & Invoice Verification">Cash Memo & Invoice Verification</option>
                  <option value="7-Day Return / Replacement Request">7-Day Return / Replacement Request</option>
                  <option value="Damaged / Incorrect Product Received">Damaged / Incorrect Product Received</option>
                  <option value="Payment / SSLCommerz Query">Payment / SSLCommerz Query</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1 text-[11px]">
                {lang === 'bn' ? 'আপনার বার্তা / সমস্যা' : 'Detailed Message'} *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'আপনার সমস্যার বিবরণ লিখুন (যেমন: ডেলিভারি বিলম্ব, মেমো কপি ইত্যাদি)...'
                    : 'Please explain your request or order issue in detail...'
                }
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-800 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeSupportModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : lang === 'bn' ? 'পাঠিয়ে দিন' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
