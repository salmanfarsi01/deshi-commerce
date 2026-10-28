import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MALE_AVATARS = [
  { id: 'm1', label: 'Casual Style', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm2', label: 'Young Pro', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm3', label: 'Warm Smile', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm4', label: 'Creative', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'm5', label: 'Illustrated Felix', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&facialHairProbability=0' },
  { id: 'm6', label: 'Illustrated Jack', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { id: 'm7', label: 'Illustrated Leo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: 'm8', label: 'Illustrated Oliver', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
];

export const FEMALE_AVATARS = [
  { id: 'f1', label: 'Chic Smile', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f2', label: 'Professional Lady', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f3', label: 'Modern Aesthetic', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f4', label: 'Creative Warmth', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80' },
  { id: 'f5', label: 'Illustrated Aneka', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 'f6', label: 'Illustrated Sophia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { id: 'f7', label: 'Illustrated Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
  { id: 'f8', label: 'Illustrated Zoe', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
];

export const ProfileTab: React.FC = () => {
  const { user, updateUserProfile, showToast } = useApp();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileGender, setProfileGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [profileAge, setProfileAge] = useState<number | ''>(user?.age ?? 25);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatarUrl || MALE_AVATARS[0].url);
  const [avatarGenderTab, setAvatarGenderTab] = useState<'male' | 'female'>(user?.gender === 'female' ? 'female' : 'male');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  return (
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
  );
};
