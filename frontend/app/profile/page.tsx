'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Card } from '@/components/ui';
import { userProfileService } from '@/lib/user-profile';
import { profilesService, Profile } from '@/lib/profiles';
import { ArrowLeft, Save, X, Check, BarChart2 } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: 'parent' | 'creator' | 'admin';
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [childrenProfiles, setChildrenProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    newPassword: '',
    currentPassword: '',
    confirmPassword: '',
  });

  // Load profile
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userProfileService.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        email: data.email,
        newPassword: '',
        currentPassword: '',
        confirmPassword: '',
      });

      // Load children profiles if parent
      if (data.role === 'parent') {
        try {
          const children = await profilesService.getAll();
          setChildrenProfiles(children);
        } catch (err) {
          console.error('Failed to load children profiles', err);
        }
      }
    } catch (err: any) {
      setError('Gagal memuat profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi password
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError('Password harus minimal 8 karakter');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Password baru tidak cocok');
        return;
      }

      if (!formData.currentPassword) {
        setError('Masukkan password saat ini untuk mengubah password');
        return;
      }
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }

      const updatedProfile = await userProfileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setSuccess('Profil berhasil diperbarui');
      setIsEditMode(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        currentPassword: '',
        confirmPassword: '',
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Gagal memperbarui profil';
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        email: profile.email,
        newPassword: '',
        currentPassword: '',
        confirmPassword: '',
      });
    }
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-[#8B7355] font-bold">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#D94D2B] font-bold">Gagal memuat profil</p>
          <Button onClick={loadProfile} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-[#8B7355] hover:text-[#FF7A00] transition-colors">
            <ArrowLeft size={24} strokeWidth={3} />
          </Link>
          <h1 className="text-3xl font-black text-[#4A4A4A]">My Profile</h1>
          <div className="w-6" />
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-[#FFF5E5] border-l-4 border-[#D94D2B] text-[#D94D2B] p-4 rounded-r-xl mb-6 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <X size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl mb-6 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <Check size={18} /> {success}
          </div>
        )}

        {/* Profile Card */}
        <Card className="bg-white rounded-2xl shadow-xl border-4 border-[#FFE0B2] p-8 mb-6">
          {/* Role & Created Date */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-[#8B7355] font-bold text-sm uppercase">Role</p>
              <p className="text-[#4A4A4A] font-black text-lg capitalize">{profile.role}</p>
            </div>
            <div>
              <p className="text-[#8B7355] font-bold text-sm uppercase">Member Since</p>
              <p className="text-[#4A4A4A] font-black text-lg">
                {new Date(profile.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {!isEditMode ? (
            // View Mode
            <div className="space-y-6">
              <div>
                <p className="text-[#8B7355] font-bold text-sm uppercase">Full Name</p>
                <p className="text-[#4A4A4A] font-black text-lg">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-[#8B7355] font-bold text-sm uppercase">Email</p>
                <p className="text-[#4A4A4A] font-black text-lg">{profile.email}</p>
              </div>

              <Button
                onClick={() => setIsEditMode(true)}
                className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide">Full Name</label>
                <Input
                  type="text"
                  name="full_name"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#4A4A4A] font-black text-sm uppercase tracking-wide">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-[#FFF9F0] text-[#4A4A4A] font-medium"
                />
              </div>

              {/* Password Change Section */}
              <div className="bg-[#FFF5E5] rounded-xl p-4 border-2 border-[#FFE0B2]">
                <p className="text-[#4A4A4A] font-black text-sm uppercase mb-4">Change Password (Optional)</p>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[#4A4A4A] font-bold text-xs uppercase">Current Password</label>
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="h-10 rounded-lg border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-white text-[#4A4A4A] font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#4A4A4A] font-bold text-xs uppercase">New Password</label>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="h-10 rounded-lg border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-white text-[#4A4A4A] font-medium text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#4A4A4A] font-bold text-xs uppercase">Confirm New Password</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-10 rounded-lg border-2 border-[#FFE0B2] focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 bg-white text-[#4A4A4A] font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={18} strokeWidth={3} /> Save Changes
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 h-12 bg-gray-300 hover:bg-gray-400 text-[#4A4A4A] font-black rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Children Reports Section */}
        {!isEditMode && profile?.role === 'parent' && childrenProfiles.length > 0 && (
          <Card className="p-6 sm:p-8 border-b-8 border-[#FFE0B2] shadow-xl bg-white">
            <h3 className="text-xl font-black text-[#4A4A4A] mb-4 flex items-center gap-2">
              <span>📊</span> Laporan Belajar Anak
            </h3>
            <div className="grid gap-4">
              {childrenProfiles.map((child) => (
                <div 
                  key={child.id}
                  className="flex items-center justify-between p-4 bg-[#FFF9F0] rounded-xl border-2 border-[#FFE0B2]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF7A00] rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-[#4A4A4A]">{child.name}</p>
                      <p className="text-xs text-[#8B7355] font-bold">{child.age_group} Tahun</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/report?name=${child.name}&id=${child.id}`)}
                    className="bg-white hover:bg-[#FFF5E5] text-[#FF7A00] border-2 border-[#FF7A00] font-bold rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
                  >
                    <BarChart2 size={16} />
                    Lihat Laporan
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Logout Button */}
        {!isEditMode && (
          <Button
            onClick={logout}
            className="w-full h-12 bg-[#D94D2B] hover:bg-[#B83D1F] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#A0351E] active:border-b-0 active:translate-y-1"
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
