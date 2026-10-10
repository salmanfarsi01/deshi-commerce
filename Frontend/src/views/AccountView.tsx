import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Lock,
  Trash2,
  Edit3,
  Plus,
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
  User as UserIcon,
  MessageSquare,
  Headphones,
  Check,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Order, Address, NotificationLog } from '../types';
import { formatBDT, BANGLADESH_DIVISIONS } from '../data/bangladeshGeo';

// Curated stylish individual avatars for Male & Female
const MALE_AVATARS = [
  { id: 'm1', label: 'Casual Style', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm2', label: 'Young Pro', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm3', label: 'Warm Smile', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm4', label: 'Creative', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm5', label: 'Illustrated Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&facialHairProbability=0' },
  { id: 'm6', label: 'Illustrated Jack', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { id: 'm7', label: 'Illustrated Leo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: 'm8', label: 'Illustrated Oliver', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
];

const FEMALE_AVATARS = [
  { id: 'f1', label: 'Chic Smile', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f2', label: 'Professional Lady', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f3', label: 'Modern Aesthetic', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f4', label: 'Creative Warmth', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f5', label: 'Illustrated Aneka', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 'f6', label: 'Illustrated Sophia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { id: 'f7', label: 'Illustrated Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
  { id: 'f8', label: 'Illustrated Zoe', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
];

export const AccountView: React.FC = () => {
  const { user, setCurrentView, viewOrderDetail, showToast, openAuthModal, logout, updateUserProfile, openChat } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'notifications' | 'security'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileGender, setProfileGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [profileAge, setProfileAge] = useState<number | ''>(user?.age ?? 25);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatarUrl || MALE_AVATARS[0].url);
  const [avatarGenderTab, setAvatarGenderTab] = useState<'male' | 'female'>((user?.gender === 'female') ? 'female' : 'male');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    streetAddress: '',
    type: 'HOME' as 'HOME' | 'OFFICE',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Security tab
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Sync profile state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone);
      setProfileEmail(user.email);
      setProfileGender(user.gender || 'male');
      setProfileAge(user.age ?? 25);
      if (user.avatarUrl) setProfileAvatarUrl(user.avatarUrl);
      if (user.gender === 'female') setAvatarGenderTab('female');
    }
  }, [user]);

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

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    if (profileAge !== '' && (Number(profileAge) < 12 || Number(profileAge) > 120)) {
      showToast('Please enter a realistic age (12 - 120)', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileName.trim(),
        gender: profileGender,
        age: profileAge === '' ? undefined : Number(profileAge),
        avatarUrl: profileAvatarUrl,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Address Modal for New
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: '',
      streetAddress: '',
      type: 'HOME',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  // Open Address Modal for Edit
  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      division: addr.division || 'Dhaka',
      district: addr.district || 'Dhaka',
      upazila: addr.upazila || '',
      streetAddress: addr.streetAddress || '',
      type: addr.type || 'HOME',
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  // Save Delivery Address (Create / Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim()) {
      showToast('Recipient full name is required', 'error');
      return;
    }
    if (!addressForm.phone.trim() || addressForm.phone.replace(/[^0-9]/g, '').length < 10) {
      showToast('Please enter a valid Bangladesh contact mobile number', 'error');
      return;
    }
    if (!addressForm.streetAddress.trim()) {
      showToast('Street address / House / Road details are required', 'error');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddress) {
        await apiService.addresses.update(editingAddress.id, addressForm);
        showToast('Delivery address updated successfully!', 'success');
      } else {
        await apiService.addresses.create(addressForm);
        showToast('New delivery address added successfully!', 'success');
      }
      const res = await apiService.addresses.getAll();
      setAddresses(res.data);
      setIsAddressModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

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
              onClick={() => setCurrentView('home')}
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
            <span>My Orders ({orders.length})</span>
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
            <span>Updates &amp; Alerts ({notifications.length})</span>
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

        {/* =========================================================================
            TAB 1: PROFILE, GENDER, AGE & MALE/FEMALE AVATAR PICKER
        ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Profile &amp; Avatar</h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize your gender, age, and choose your preferred male or female avatar illustration.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Phone number is verified and tied to your account</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    disabled
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>

                {/* AGE FIELD */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="120"
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 26"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Helps us curate appropriate deals &amp; recommendations</span>
                </div>
              </div>

              {/* GENDER SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Gender Selection
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileGender('male');
                      setAvatarGenderTab('male');
                    }}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      profileGender === 'male'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-lg">👨</span>
                    <span className="text-xs">Male</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileGender('female');
                      setAvatarGenderTab('female');
                    }}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      profileGender === 'female'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-lg">👩</span>
                    <span className="text-xs">Female</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileGender('other')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      profileGender === 'other'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span className="text-lg">✨</span>
                    <span className="text-xs">Other</span>
                  </button>
                </div>
              </div>

              {/* AVATAR CHOOSING SECTION FOR MALE & FEMALE */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Choose Your Avatar
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Select an avatar icon that reflects your style. Click to preview immediately.
                    </p>
                  </div>

                  {/* Male / Female Avatar Tab Toggle */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setAvatarGenderTab('male')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        avatarGenderTab === 'male'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👨 Male Avatars
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarGenderTab('female')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        avatarGenderTab === 'female'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👩 Female Avatars
                    </button>
                  </div>
                </div>

                {/* Avatar Gallery Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
                  {(avatarGenderTab === 'male' ? MALE_AVATARS : FEMALE_AVATARS).map((av) => {
                    const isSelected = profileAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setProfileAvatarUrl(av.url)}
                        className={`relative aspect-square rounded-2xl overflow-hidden p-1 transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? 'ring-3 ring-slate-900 ring-offset-2 bg-slate-900'
                            : 'border-2 border-slate-200 hover:border-slate-400 bg-slate-50'
                        }`}
                        title={av.label}
                      >
                        <img
                          src={av.url}
                          alt={av.label}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SAVED DELIVERY ADDRESSES (UPDATE & ADD OPTIONS)
        ========================================================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Delivery Addresses</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage shipping addresses across all 64 districts in Bangladesh for one-click checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Delivery Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            {addresses.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
                  <MapPin className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">No Delivery Address Saved Yet</h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Add your home or office address to ensure quick and smooth doorstep parcel delivery.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  + Add First Delivery Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                      addr.isDefault ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                          <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-md uppercase tracking-wider border border-slate-200">
                            {addr.type || 'HOME'}
                          </span>
                        </div>
                        {addr.isDefault ? (
                          <span className="text-[10px] font-bold text-white bg-[#0F172A] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            Default Address
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline font-semibold cursor-pointer uppercase tracking-wider"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-600 mt-1">{addr.phone}</div>
                      <div className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">{addr.streetAddress}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {addr.upazila ? `${addr.upazila}, ` : ''}{addr.district}, {addr.division}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {/* Edit Address Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="text-xs font-bold text-slate-700 hover:text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Update / Edit</span>
                      </button>

                      {/* Delete Address Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: ORDERS
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="p-12 text-center text-slate-500 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl shadow-xs">
                <div className="w-14 h-14 bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200 rounded-full">
                  <Package className="w-7 h-7 text-slate-700" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1 tracking-tight">No orders yet</h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Browse products and place your first order with doorstep cash on delivery nationwide.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('catalog')}
                  className="rounded-xl px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Order #{ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-GB')} &bull; {ord.items.length} item(s)
                    </div>

                    <div className="text-xs text-slate-700 pt-1">
                      Shipping to: <strong className="text-slate-900">{ord.shippingAddress.fullName}</strong> ({ord.shippingAddress.district})
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-base font-black text-slate-900 font-mono">
                      {formatBDT(ord.totalAmount)}
                    </div>
                    <button
                      type="button"
                      onClick={() => viewOrderDetail(ord.id)}
                      className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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

        {/* =========================================================================
            TAB 4: NOTIFICATIONS & UPDATES (INCLUDING CHAT SUPPORT REPLIES)
        ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {loadingNotifications ? (
              <div className="p-12 text-center text-slate-500 text-xs">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
                <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">No Notifications Yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Updates on orders and direct replies from our admin team will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
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
              })
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: SECURITY
        ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          DELIVERY ADDRESS UPDATE / ADD MODAL
      ========================================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {editingAddress ? 'Update Delivery Address' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="e.g. 01700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Division *
                  </label>
                  <select
                    value={addressForm.division}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === newDiv);
                      const firstDist = divObj?.districts[0] || 'Dhaka';
                      setAddressForm({
                        ...addressForm,
                        division: newDiv,
                        district: firstDist,
                      });
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none cursor-pointer"
                  >
                    {(
                      BANGLADESH_DIVISIONS.find((d) => d.name === addressForm.division)?.districts || [
                        'Dhaka',
                      ]
                    ).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thana / Upazila / Area *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.upazila}
                  onChange={(e) => setAddressForm({ ...addressForm, upazila: e.target.value })}
                  placeholder="e.g. Dhanmondi, Gulshan, Uttara, Sadar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address / House / Road Details *
                </label>
                <textarea
                  rows={2}
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  placeholder="House #, Road #, Sector/Block, Flat/Floor details"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-800 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Address Type & Default */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Type:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type: 'HOME' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        addressForm.type === 'HOME'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, type: 'OFFICE' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        addressForm.type === 'OFFICE'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Office
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#0F172A]"
                  />
                  <span className="text-xs text-slate-700 font-semibold">Set as default</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  {isSavingAddress ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
