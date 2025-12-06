'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  age_group: string;
  pin?: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  platform: string;
  category: string;
  age_group: string;
  view_count: number;
}

export default function ProfileDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchProfileAndVideos = async () => {
      try {
        const profileId = params.id as string;
        if (!profileId) return;

        // Fetch profile details
        const profilesRes = await api.get('/profiles');
        // Convert both to string for comparison to be safe
        const foundProfile = profilesRes.data.find((p: Profile) => String(p.id) === String(profileId));
        
        if (foundProfile) {
          setProfile(foundProfile);
          
          // Fetch videos for this profile
          setLoadingVideos(true);
          const videosRes = await api.get(`/videos/recommendations?age_group=${foundProfile.age_group}`);
          setVideos(videosRes.data);
        } else {
          // Profile not found, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setLoadingVideos(false);
      }
    };

    if (user) {
      fetchProfileAndVideos();
    }
  }, [user, params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="animate-bounce text-4xl">⏳</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b-2 border-[#FFE0B2]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/report?name=${profile.name}&id=${profile.id}`)}
              className="text-[#8B7355] hover:text-[#FF7A00] hover:bg-[#FFF5E5] mr-1 hidden sm:flex items-center gap-2"
              title="Lihat Laporan Belajar"
            >
              <span className="text-xl">📊</span>
              <span className="font-bold text-sm">Laporan</span>
            </Button>

            <div className="flex items-center gap-2 bg-[#FFF5E5] border border-[#FFE0B2] px-4 py-2 rounded-full shadow-sm">
              <div className="w-6 h-6 bg-[#FF7A00] rounded-full flex items-center justify-center text-sm font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-[#8B7355]">{profile.name}</span>
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
              Video untuk {profile.name} 🎉
            </h2>
            <p className="text-[#8B7355] font-bold mt-1">
              Konten edukatif untuk usia {profile.age_group} tahun
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#FFF5E5] border border-[#FFE0B2] px-4 py-2 rounded-full">
            <span className="text-[#FF7A00]">🎂</span>
            <span className="text-[#D94D2B] font-black">{profile.age_group} tahun</span>
          </div>
        </div>

        {loadingVideos ? (
          <div className="bg-white rounded-[2rem] shadow-xl border-b-8 border-[#FFE0B2] p-12 text-center animate-pulse">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-[#8B7355] font-bold">Sedang memuat video...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-xl border-b-8 border-[#FFE0B2] p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-black text-[#4A4A4A] mb-2">Belum Ada Video</h3>
            <p className="text-[#8B7355] font-bold max-w-md mx-auto">
              Belum ada video yang tersedia untuk usia {profile.age_group} tahun.
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
                onClick={() => router.push(`/watch/${video.id}?profile=${profile.id}`)}
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
