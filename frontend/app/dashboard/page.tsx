'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { profilesService, Profile } from '@/lib/profiles';
import { Button } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(5);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState('');

  const loadProfiles = useCallback(async () => {
    try {
      const data = await profilesService.getAll();
      setProfiles(data);
      console.log('✅ Profiles loaded:', data.length);
    } catch (error) {
      console.error('❌ Error loading profiles:', error);
    }
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('⚠️ Not authenticated, redirecting');
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'parent' && isHydrated) {
      console.log('👨‍👩‍👧 Loading profiles for parent');
      loadProfiles();
    } else if (user?.role === 'creator' && isHydrated) {
      console.log('🎬 User is creator, redirecting');
      router.push('/creator');
    }
  }, [user, isHydrated, router, loadProfiles]);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profilesService.create({
        name: newProfileName,
        age_group: newProfileAge,
      });
      setNewProfileName('');
      setNewProfileAge(5);
      setShowAddProfile(false);
      await loadProfiles();
    } catch (error) {
      console.error('❌ Error adding profile:', error);
      setError('Gagal menambah profil');
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (confirm('Yakin ingin menghapus profil ini?')) {
      try {
        await profilesService.delete(id);
        await loadProfiles();
      } catch (error) {
        console.error('❌ Error deleting profile:', error);
      }
    }
  };

  if (isLoading || !isHydrated) {
    return <LoadingPage text="Memuat dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/50 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-12 bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm rounded-[2rem] sm:rounded-full px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:rotate-12 duration-300">
              <img
                src="/images/desain-20tanpa-20judul-20-286-29.png"
                alt="EduToon Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#D94D2B] drop-shadow-sm group-hover:text-[#FF7A00] transition-colors">
              EduToon
            </span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div 
              onClick={() => router.push('/profile')}
              className="bg-[#FFF5E5] border border-[#FFE0B2] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 cursor-pointer hover:bg-[#FFE0B2] transition-colors"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FF7A00] flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
              <span className="text-[#8B7355] font-bold text-sm sm:text-base">{user.full_name || user.email}</span>
            </div>
            <Button variant="ghost" onClick={logout} className="text-[#8B7355] hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Profile Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2rem] shadow-xl border-b-8 border-[#FFE0B2] p-4 sm:p-8 md:p-12"
        >
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#4A4A4A] mb-2">
              Siapa yang menonton? 👀
            </h2>
            <p className="text-[#8B7355] font-bold text-base sm:text-lg">Pilih profil untuk memulai belajar</p>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-[#8B7355] font-bold mb-4">Belum ada profil anak</p>
              <Button onClick={() => setShowAddProfile(true)} className="bg-[#FF7A00] text-white font-black rounded-full px-6 py-2 sm:px-8 sm:py-3">
                Buat Profil Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
              {profiles.map((profile, index) => (
                <motion.div 
                  key={profile.id} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/dashboard/${profile.id}`)}
                    className="w-full flex flex-col items-center p-3 sm:p-6 rounded-[1.5rem] hover:bg-[#FFF9F0] border-2 border-transparent hover:border-[#FFE0B2] transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#FFF5E5] rounded-full flex items-center justify-center text-3xl sm:text-5xl text-[#FF7A00] mb-3 sm:mb-4 shadow-md group-hover:shadow-xl transition-shadow border-4 border-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-[#D94D2B] rounded-full flex items-center justify-center text-white text-xs sm:text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        ▶
                      </div>
                    </div>
                    <span className="font-black text-[#4A4A4A] text-base sm:text-lg mt-1 sm:mt-2 truncate w-full text-center">{profile.name}</span>
                    <span className="text-xs sm:text-sm text-[#8B7355] font-bold flex items-center gap-1">
                      <span>🎂</span> {profile.age_group} tahun
                    </span>
                  </motion.button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-[#D94D2B] text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#B93D1B] shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}

              {/* Add Profile Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: profiles.length * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddProfile(true)}
                className="flex flex-col items-center p-3 sm:p-6 rounded-[1.5rem] border-4 border-dashed border-[#FFE0B2] hover:border-[#FF7A00] hover:bg-[#FFF5E5] transition-all duration-300 group"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white transition-colors border-4 border-transparent">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#FFE0B2] group-hover:text-[#FF7A00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-black text-[#8B7355] group-hover:text-[#FF7A00] transition-colors mt-1 sm:mt-2 text-sm sm:text-base">Tambah Profil</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Quiz Interaktif', desc: 'Uji pemahaman setelah menonton video' },
            { icon: '📊', title: 'Pantau Progress', desc: 'Lihat perkembangan belajar anak' },
            { icon: '🔒', title: 'Konten Aman', desc: 'Semua video dikurasi untuk anak' },
          ].map((tip, i) => (
            <div key={i} className="bg-white rounded-xl p-6 flex items-center gap-4 animate-slide-up shadow-md border-b-4 border-[#FFE0B2]" style={{ animationDelay: `${(i + 1) * 150}ms` }}>
              <div className="text-3xl">{tip.icon}</div>
              <div>
                <div className="font-black text-[#4A4A4A]">{tip.title}</div>
                <div className="text-[#8B7355] text-sm font-bold">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-b-8 border-[#FFE0B2] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#4A4A4A]">Tambah Profil Anak 👶</h3>
                <button 
                  onClick={() => setShowAddProfile(false)}
                  className="text-[#8B7355] hover:text-[#FF7A00] transition-colors"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 font-bold text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-[#4A4A4A]">Nama Anak</label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Masukkan nama anak"
                    required
                    className="w-full px-4 py-3 bg-[#FFF9F0] border-2 border-[#FFE0B2] rounded-xl text-[#4A4A4A] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#FF7A00] focus:ring-0 font-bold transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-black text-[#4A4A4A] mb-3">
                    Usia Anak
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="18"
                      value={newProfileAge}
                      onChange={(e) => setNewProfileAge(Number(e.target.value))}
                      className="flex-1 h-3 bg-[#FFE0B2] rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                    />
                    <div className="w-20 h-12 bg-[#FF7A00] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {newProfileAge} th
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddProfile(false)}
                    className="flex-1 text-[#8B7355] font-bold hover:bg-[#FFF5E5]"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#FF7A00] text-white hover:bg-[#E66E00] font-black rounded-full shadow-lg">
                    Simpan
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}