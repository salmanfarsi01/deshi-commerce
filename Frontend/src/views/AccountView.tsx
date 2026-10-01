import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Lock,
  Trash2,
  ChevronRight,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Mail,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Order, Address, NotificationLog } from '../types';
import { formatBDT } from '../data/bangladeshGeo';

export const AccountView: React.FC = () => {
  const { user, setCurrentView, viewOrderDetail, showToast, openAuthModal, logout } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'notifications' | 'addresses' | 'security'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Security tab
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    // Pre-fetch notifications count
    apiService.notifications.getMyNotifications().then((res) => {
      setNotifications(res.data);
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      apiService.orders.getCustomerOrders().then((res) => {
        setOrders(res.data);
        setLoadingOrders(false);
      });
    } else if (activeTab === 'notifications') {
      setLoadingNotifications(true);
      apiService.notifications.getMyNotifications().then((res) => {
        setNotifications(res.data);
        setLoadingNotifications(false);
      });
    } else if (activeTab === 'addresses') {
      apiService.addresses.getAll().then((res) => {
        setAddresses(res.data);
      });
    }
  }, [activeTab]);

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await apiService.addresses.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Address deleted successfully', 'info');
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      await apiService.addresses.update(addr.id, { isDefault: true });
      const res = await apiService.addresses.getAll();
      setAddresses(res.data);
      showToast('Default delivery address updated', 'success');
    } catch {
      showToast('Failed to set default address', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setPassLoading(true);
    try {
      await apiService.auth.changePassword(oldPassword, newPassword);
      showToast('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Failed to update password', 'error');
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
        <div className="max-w-md w-full bg-white p-8 border border-[#D4D4D4] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-[#2B2B2B] text-white flex items-center justify-center mx-auto border border-[#3D3D3D]">
            <LogIn className="w-8 h-8 text-[#E11D48]" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#2B2B2B] font-serif uppercase tracking-tight">
              Customer Account Portal
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Sign in or create an account with <strong>Google Mail</strong> or your mobile number to view past orders, track live delivery consignments, and manage saved shipping addresses.
            </p>
          </div>

          {/* Direct Google Mail Sign In & Sign Up buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="rounded-none w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#2B2B2B] border-2 border-[#2B2B2B] hover:border-[#E11D48] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google Mail</span>
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="rounded-none w-full py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up (Create Account)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#D4D4D4] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="rounded-none text-stone-600 hover:text-[#2B2B2B] font-bold uppercase tracking-wider cursor-pointer"
            >
              Sign In with Mobile
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="rounded-none text-[#E11D48] hover:underline font-bold uppercase tracking-wider cursor-pointer"
            >
              Return to Catalog &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* User Hero Bar */}
        <div className="bg-[#2B2B2B] p-6 sm:p-8 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-[#E11D48]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-white/10 text-white p-0.5 border border-white/20 flex items-center justify-center font-bold text-lg font-serif">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              {user.authProvider === 'google' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs border border-stone-200">
                  <span className="text-[10px] font-black text-blue-600">G</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white uppercase">{user.name}</h1>
                {user.authProvider === 'google' && (
                  <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 uppercase tracking-wider">
                    Google Mail
                  </span>
                )}
              </div>
              <div className="text-xs text-[#D4D4D4] font-mono mt-0.5">
                {user.phone} · {user.email}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:border-l sm:border-stone-700 sm:pl-6 text-xs text-[#B3B3B3]">
            <div className="text-right hidden sm:block">
              <div>Member since</div>
              <div className="font-bold text-white">
                {new Date(user.createdAt).toLocaleDateString('en-GB')}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-none px-3 py-1.5 bg-white/10 hover:bg-red-900/60 text-white border border-white/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="flex border-b border-[#D4D4D4] text-xs font-bold uppercase tracking-wider gap-6 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`rounded-none pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-stone-500 hover:text-[#2B2B2B]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`rounded-none pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-stone-500 hover:text-[#2B2B2B]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Updates &amp; Alerts ({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`rounded-none pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-stone-500 hover:text-[#2B2B2B]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`rounded-none pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-transparent text-stone-500 hover:text-[#2B2B2B]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="p-12 text-center text-stone-500 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 text-center border border-[#D4D4D4]">
                <div className="w-14 h-14 bg-rose-50 flex items-center justify-center mx-auto mb-3 text-stone-400 border border-rose-200">
                  <Package className="w-7 h-7 text-[#E11D48]" />
                </div>
                <h4 className="font-bold text-[#2B2B2B] text-base mb-1 uppercase tracking-wider">No orders yet</h4>
                <p className="text-xs text-stone-500 mb-4">
                  Browse products and place your first order with doorstep delivery.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="rounded-none px-4 py-2 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold cursor-pointer uppercase tracking-wider transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 sm:p-6 border border-[#D4D4D4] hover:border-[#2B2B2B] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold font-mono text-[#2B2B2B] text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-stone-400">·</span>
                      <span
                        className={`font-bold px-2 py-0.5 text-[10px] uppercase ${
                          ord.status === 'DELIVERED'
                            ? 'bg-slate-900 text-white'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : ord.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 shrink-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 object-cover bg-stone-100 border border-[#D4D4D4]"
                          />
                          <div className="text-[11px] max-w-[140px] truncate">
                            <span className="font-bold text-[#2B2B2B]">{item.productName}</span>
                            <div className="text-stone-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-200">
                    <div className="text-right">
                      <div className="text-[11px] text-stone-500 uppercase tracking-wider">Total</div>
                      <div className="text-base font-bold font-mono text-[#E11D48] tabular-nums">
                        {formatBDT(ord.totalAmount)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => viewOrderDetail(ord.id)}
                      className="rounded-none px-4 py-2 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Notifications / Updates & Alerts */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {loadingNotifications ? (
              <div className="p-12 text-center text-stone-500 text-xs">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="bg-white p-12 text-center border border-[#D4D4D4]">
                <div className="w-14 h-14 bg-rose-50 flex items-center justify-center mx-auto mb-3 text-stone-400 border border-rose-200">
                  <Bell className="w-7 h-7 text-[#E11D48]" />
                </div>
                <h4 className="font-bold text-[#2B2B2B] text-base mb-1 uppercase tracking-wider">No notifications yet</h4>
                <p className="text-xs text-stone-500 mb-4">
                  Order updates, SMS dispatches, and email alerts will appear here in real-time.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="rounded-none px-4 py-2 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold cursor-pointer uppercase tracking-wider transition-colors"
                >
                  View My Orders
                </button>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white p-5 sm:p-6 border border-[#D4D4D4] hover:border-[#2B2B2B] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Channel Badge */}
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 text-[10px] uppercase ${
                          notif.channel === 'EMAIL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {notif.channel === 'EMAIL' ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                        {notif.channel}
                      </span>

                      {/* Event Badge */}
                      <span
                        className={`font-bold px-2 py-0.5 text-[10px] uppercase ${
                          notif.event === 'ORDER_CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : notif.event === 'ORDER_SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : notif.event === 'ORDER_DELIVERED'
                            ? 'bg-slate-900 text-white'
                            : notif.event === 'ORDER_CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {notif.event.replace('_', ' ')}
                      </span>

                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500 font-mono text-[11px]">
                        {new Date(notif.timestamp).toLocaleString('en-GB')}
                      </span>

                      {notif.orderNumber && (
                        <>
                          <span className="text-stone-400">·</span>
                          <span className="font-mono text-stone-700 font-bold text-[11px]">
                            Order #{notif.orderNumber}
                          </span>
                        </>
                      )}
                    </div>

                    {notif.subject && (
                      <h4 className="text-sm font-bold text-[#2B2B2B]">{notif.subject}</h4>
                    )}

                    <div className="text-xs text-stone-600 bg-[#F8F9FA] p-3 border border-[#E5E7EB] font-mono whitespace-pre-wrap leading-relaxed">
                      {notif.message}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>Recipient:</span>
                      <span className="font-mono text-stone-600">{notif.recipient}</span>
                    </div>
                  </div>

                  {notif.orderId && (
                    <div className="flex md:flex-col items-end shrink-0 pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={() => viewOrderDetail(notif.orderId!)}
                        className="rounded-none px-3 py-1.5 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Order</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white p-5 border-2 flex flex-col justify-between space-y-3 ${
                    addr.isDefault ? 'border-[#2B2B2B] bg-[#F8F9FA]' : 'border-[#D4D4D4]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2B2B2B]">{addr.fullName}</span>
                        <span className="text-[10px] font-bold text-stone-600 px-1.5 py-0.5 bg-stone-100 uppercase">
                          {addr.type || 'HOME'}
                        </span>
                      </div>
                      {addr.isDefault ? (
                        <span className="text-[10px] font-bold text-white bg-[#2B2B2B] px-2 py-0.5 uppercase">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr)}
                          className="rounded-none text-[11px] text-[#E11D48] hover:underline font-bold cursor-pointer uppercase"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-mono text-stone-500">{addr.phone}</div>
                    <div className="text-xs text-stone-700 mt-2">{addr.streetAddress}</div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      {addr.upazila}, {addr.district}, {addr.division}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#D4D4D4]">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="rounded-none text-xs text-red-700 hover:text-red-900 flex items-center gap-1 font-bold cursor-pointer uppercase tracking-wider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <div className="max-w-md bg-white p-6 border border-[#D4D4D4] shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B] mb-4">Change Account Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="rounded-none w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="rounded-none w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="rounded-none w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#D4D4D4]"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="rounded-none w-full py-2.5 bg-[#2B2B2B] hover:bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
