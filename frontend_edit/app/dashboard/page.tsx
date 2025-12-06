'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { profilesService, Profile } from '@/lib/profiles';
import { videosService, Video } from '@/lib/videos';
import { Button, Card, Input } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(5);
  const [isHydrated, setIsHydrated] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const data = await profilesService.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    try {
      const data = await videosService.getAll(selectedProfile?.id);
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, [selectedProfile]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'parent') {
      let ignore = false;
      (async () => {
        try {
          const data = await profilesService.getAll();
          if (!ignore) {
            setProfiles(data);
          }
        } catch (error) {
          console.error('Error loading profiles:', error);
        }
      })();
      return () => {
        ignore = true;
      };
    } else if (user?.role === 'creator') {
      router.push('/creator');
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedProfile) {
      let ignore = false;
      (async () => {
        try {
          const data = await videosService.getAll(selectedProfile?.id);
          if (!ignore) {
            setVideos(data);
          }
        } catch (error) {
          console.error('Error loading videos:', error);
        }
      })();
      return () => {
        ignore = true;
      };
    }
  }, [selectedProfile]);

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
      loadProfiles();
    } catch (error) {
      console.error('Error adding profile:', error);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (confirm('Yakin ingin menghapus profil ini?')) {
      try {
        await profilesService.delete(id);
        loadProfiles();
        if (selectedProfile?.id === id) {
          setSelectedProfile(null);
        }
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingPage text="Memuat dashboard..." />;
  }

  if (!user || !isHydrated) {
    return null;
  }

  // Profile Selection View
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12 bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm rounded-full px-8 py-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative h-10 w-10 transition-transform group-hover:rotate-12 duration-300">
                <img
                  src="/images/desain-20tanpa-20judul-20-286-29.png"
                  alt="EduToon Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#D94D2B] drop-shadow-sm group-hover:text-[#FF7A00] transition-colors">
                EduToon
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div 
                onClick={() => router.push('/profile')}
                className="bg-[#FFF5E5] border border-[#FFE0B2] rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-[#FFE0B2] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF7A00] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-[#8B7355] font-bold hidden sm:block">{user.full_name || user.email}</span>
              </div>
              <Button variant="ghost" onClick={logout} className="text-[#8B7355] hover:text-[#FF7A00] hover:bg-[#FF7A00]/10 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </header>

          {/* Profile Selection */}
          <div className="bg-white rounded-[2rem] shadow-xl border-b-8 border-[#FFE0B2] p-8 sm:p-12 animate-scale-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-black text-[#4A4A4A] mb-2">
                Siapa yang menonton? 👀
              </h2>
              <p className="text-[#8B7355] font-bold text-lg">Pilih profil untuk memulai belajar</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {profiles.map((profile, index) => (
                <div 
                  key={profile.id} 
                  className="relative group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => setSelectedProfile(profile)}
                    className="w-full flex flex-col items-center p-6 rounded-[1.5rem] hover:bg-[#FFF9F0] border-2 border-transparent hover:border-[#FFE0B2] transition-all duration-300 group-hover:scale-105"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FFF5E5] rounded-full flex items-center justify-center text-4xl sm:text-5xl text-[#FF7A00] mb-4 shadow-md group-hover:shadow-xl transition-shadow border-4 border-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D94D2B] rounded-full flex items-center justify-center text-white text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        ▶
                      </div>
                    </div>
                    <span className="font-black text-[#4A4A4A] text-lg mt-2">{profile.name}</span>
                    <span className="text-sm text-[#8B7355] font-bold flex items-center gap-1">
                      <span>🎂</span> {profile.age_group} tahun
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(profile.id);
                    }}
                    className="absolute top-2 right-2 bg-[#D94D2B] text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#B93D1B] shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add Profile Button */}
              <button
                onClick={() => setShowAddProfile(true)}
                className="flex flex-col items-center p-6 rounded-[1.5rem] border-4 border-dashed border-[#FFE0B2] hover:border-[#FF7A00] hover:bg-[#FFF5E5] transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${profiles.length * 100}ms` }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors border-4 border-transparent">
                  <svg className="w-12 h-12 text-[#FFE0B2] group-hover:text-[#FF7A00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-black text-[#8B7355] group-hover:text-[#FF7A00] transition-colors mt-2">Tambah Profil</span>
              </button>
            </div>
          </div>

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
        {showAddProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-b-8 border-[#FFE0B2] p-8 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-[#4A4A4A]">Tambah Profil Anak 👶</h3>
                <button 
                  onClick={() => setShowAddProfile(false)}
                  className="text-[#8B7355] hover:text-[#FF7A00] transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-black text-[#4A4A4A]">Nama Anak</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Masukkan nama anak"
                      required
                      className="w-full px-4 py-3 pl-10 bg-[#FFF9F0] border-2 border-[#FFE0B2] rounded-xl text-[#4A4A4A] placeholder-[#8B7355]/50 focus:outline-none focus:border-[#FF7A00] focus:ring-0 font-bold transition-colors"
                    />
                    <div className="absolute left-3 top-3.5 text-[#8B7355]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
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
            </div>
          </div>
        )}
      </div>
    );
  }

  // Video List View
  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b-2 border-[#FFE0B2]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProfile(null)}
              className="flex items-center gap-2 text-[#8B7355] hover:text-[#FF7A00] transition-colors group font-bold"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Ganti Profil</span>
            </button>
            <div className="h-6 w-px bg-[#FFE0B2]"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <h1 className="text-xl font-black text-[#D94D2B]">EduToon</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FFF5E5] border border-[#FFE0B2] px-4 py-2 rounded-full shadow-sm">
              <div className="w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center text-sm font-bold text-white">
                {selectedProfile.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-[#8B7355]">{selectedProfile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-[#8B7355] hover:text-[#FF7A00]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A4A4A]">
              Video untuk {selectedProfile.name} 🎉
            </h2>
            <p className="text-[#8B7355] font-bold mt-1">
              Konten edukatif untuk usia {selectedProfile.age_group} tahun
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#FFF5E5] border border-[#FFE0B2] px-4 py-2 rounded-full">
            <span className="text-[#FF7A00]">🎂</span>
            <span className="text-[#D94D2B] font-black">{selectedProfile.age_group} tahun</span>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-xl border-b-8 border-[#FFE0B2] p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-black text-[#4A4A4A] mb-2">Belum Ada Video</h3>
            <p className="text-[#8B7355] font-bold max-w-md mx-auto">
              Belum ada video yang tersedia untuk usia {selectedProfile.age_group} tahun.
              Video baru akan segera tersedia!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl shadow-lg border-b-4 border-[#FFE0B2] overflow-hidden animate-slide-up cursor-pointer group hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/watch/${video.id}?profile=${selectedProfile.id}`)}
              >
                <div className="aspect-video bg-[#FFF5E5] relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-[#FFE0B2]">
                      🎬
                    </div>
                  )}
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-[#FF7A00] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-xl border-4 border-white">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Platform Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                    {video.platform === 'youtube' && (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-[#4A4A4A] line-clamp-2 group-hover:text-[#FF7A00] transition-colors text-lg leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-sm text-[#8B7355] font-bold mt-2 line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[#8B7355]/70 font-bold">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {video.view_count}
                    </span>
                    {video.category && (
                      <span className="bg-[#FFF5E5] text-[#D94D2B] px-2 py-0.5 rounded-full border border-[#FFE0B2]">
                        {video.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
