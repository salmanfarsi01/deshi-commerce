import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  Bell,
  User as UserIcon,
  Headphones,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { ProfileTab } from './account/ProfileTab';
import { AddressesTab } from './account/AddressesTab';
import { OrdersTab } from './account/OrdersTab';
import { NotificationsTab } from './account/NotificationsTab';
import { SecurityTab } from './account/SecurityTab';

export const AccountView: React.FC = () => {
  const { user, setCurrentView, openAuthModal, logout, openChat } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'notifications' | 'security'>('profile');
  const [orderCount, setOrderCount] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      apiService.orders.getCustomerOrders().then((res) => {
        setOrderCount(res.data?.length || 0);
      }).catch(() => {});

      apiService.notifications.getMyNotifications().then((res) => {
        setNotificationCount(res.data?.length || 0);
      }).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-2xl shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-slate-100 text-[#0F172A] rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <LogIn className="w-8 h-8 text-[#0F172A]" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Customer Account Portal
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sign in or create an account with <strong>Google Mail</strong> or your mobile number to view past orders, update your delivery address, and customize your profile.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="rounded-xl w-full py-3 px-4 bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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
              className="rounded-xl w-full py-3 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up (Create Account)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="text-slate-600 hover:text-[#0F172A] font-bold cursor-pointer"
            >
              Sign In with Mobile
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('catalog')}
              className="text-slate-900 hover:underline font-bold cursor-pointer"
            >
              Return to Catalog &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* User Hero Bar with live avatar preview */}
        <div className="bg-white p-5 sm:p-7 text-[#0F172A] shadow-xs rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-slate-100 rounded-full text-[#0F172A] p-0.5 border-2 border-slate-200 flex items-center justify-center font-bold text-xl overflow-hidden shadow-xs">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              {user.authProvider === 'google' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-200">
                  <span className="text-[10px] font-black text-blue-600">G</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{user.name}</h1>
                {user.gender && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {user.gender} {user.age ? `· ${user.age} yrs` : ''}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {user.phone} &bull; {user.email}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-500">
            <button
              type="button"
              onClick={openChat}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-700" />
              <span>Direct Chat with Admin</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold uppercase tracking-wider gap-3 sm:gap-6 mb-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile &amp; Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orderCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Updates &amp; Alerts ({notificationCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
};
