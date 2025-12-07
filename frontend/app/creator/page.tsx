'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video, CreateVideoData } from '@/lib/videos';
import { userProfileService } from '@/lib/user-profile';
import { Button, Card, Input } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';
import { X } from 'lucide-react';

export default function CreatorDashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<CreateVideoData>({
    title: '',
    description: '',
    video_url: '',
    platform: 'youtube',
    category: '',
    min_age: 0,
    max_age: 18,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'creator' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadVideos();
    }
  }, [user]);

  useEffect(() => {
    if (showProfileModal && user) {
      setProfileForm({
        full_name: user.full_name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setIsEditMode(false);
      setProfileError('');
      setProfileSuccess('');
    }
  }, [showProfileModal, user]);

  const loadVideos = async () => {
    try {
      const data = await videosService.getMyVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingVideo) {
        await videosService.update(editingVideo.id, formData);
      } else {
        await videosService.create(formData);
      }
      setShowAddVideo(false);
      setFormData({
        title: '',
        description: '',
        video_url: '',
        platform: 'youtube',
        category: '',
        min_age: 0,
        max_age: 18,
      });
      loadVideos();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Gagal menyimpan video');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      platform: video.platform || 'youtube',
      category: video.category || '',
      min_age: video.min_age,
      max_age: video.max_age,
    });
    setShowAddVideo(true);
  };

  const handlePublish = async (id: number) => {
    try {
      await videosService.publish(id);
      loadVideos();
    } catch (error) {
      console.error('Error publishing video:', error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await videosService.archive(id);
      loadVideos();
    } catch (error) {
      console.error('Error archiving video:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus video ini?')) {
      try {
        await videosService.delete(id);
        loadVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsProfileSubmitting(true);

    try {
      // Validate password change if provided
      if (profileForm.new_password || profileForm.confirm_password) {
        if (!profileForm.current_password) {
          setProfileError('Password saat ini harus diisi untuk mengganti password');
          setIsProfileSubmitting(false);
          return;
        }
        if (profileForm.new_password !== profileForm.confirm_password) {
          setProfileError('Password baru tidak cocok');
          setIsProfileSubmitting(false);
          return;
        }
        if (profileForm.new_password.length < 6) {
          setProfileError('Password minimal 6 karakter');
          setIsProfileSubmitting(false);
          return;
        }
      }

      const updateData: any = {
        full_name: profileForm.full_name,
        email: profileForm.email,
      };

      if (profileForm.new_password) {
        updateData.current_password = profileForm.current_password;
        updateData.new_password = profileForm.new_password;
      }

      await userProfileService.updateProfile(updateData);
      setProfileSuccess('Profil berhasil diperbarui');
      setIsEditMode(false);
      setProfileForm({
        full_name: profileForm.full_name,
        email: profileForm.email,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingPage text="Memuat dashboard creator..." />;
  }

  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    return null;
  }

  const totalViews = videos.reduce((acc, v) => acc + v.view_count, 0);
  const publishedCount = videos.filter(v => v.status === 'published').length;
  const draftCount = videos.filter(v => v.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-10 w-10 transition-transform group-hover:rotate-12 duration-300 filter drop-shadow-md">
              <img
                src="/images/desain-20tanpa-20judul-20-286-29.png"
                alt="EduToon Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#D94D2B] drop-shadow-sm group-hover:text-[#FF7A00] transition-colors">Creator Dashboard</h1>
              <p className="text-xs font-bold text-[#8B7355]">Kelola konten video Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setShowProfileModal(true)}
              className="hidden sm:flex items-center gap-2 bg-[#FFF5E5] border-2 border-[#FFE0B2] text-[#8B7355] px-4 py-2 rounded-full shadow-sm cursor-pointer hover:border-[#FF7A00] transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 bg-[#FF7A00] text-white rounded-full flex items-center justify-center text-sm font-black shadow-md">
                {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-sm">{user?.full_name || user?.email}</span>
              <span className="bg-[#D94D2B] text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">
                Creator Mode
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-[#8B7355] hover:text-[#D94D2B] hover:bg-[#FFF5E5]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Video', value: videos.length, icon: '🎬', color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Published', value: publishedCount, icon: '✅', color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Draft', value: draftCount, icon: '📝', color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁', color: 'text-blue-500', bg: 'bg-blue-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 border-4 border-[#FFE0B2] shadow-xl relative overflow-hidden animate-slide-up hover:-translate-y-1 transition-transform duration-300" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50`}></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 drop-shadow-sm">{stat.icon}</div>
                <div className="text-3xl font-black text-[#4A4A4A] mb-1">{stat.value}</div>
                <div className="text-[#8B7355] font-bold text-sm uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Video Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#4A4A4A] mb-1">Video Saya</h2>
            <p className="text-[#8B7355] font-bold">Kelola dan pantau performa video Anda</p>
          </div>
          <Button
            onClick={() => {
              setEditingVideo(null);
              setFormData({
                title: '',
                description: '',
                video_url: '',
                platform: 'youtube',
                category: '',
                min_age: 0,
                max_age: 18,
              });
              setShowAddVideo(true);
            }}
            className="bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-full px-6 py-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
          >
            <span className="mr-2 text-xl">+</span> Tambah Video
          </Button>
        </div>

        {/* Video List */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border-4 border-[#FFE0B2] shadow-xl animate-scale-in">
            <div className="text-8xl mb-6 animate-bounce">🎬</div>
            <h3 className="text-3xl font-black text-[#4A4A4A] mb-2">Belum Ada Video</h3>
            <p className="text-[#8B7355] font-bold max-w-md mx-auto mb-8 text-lg">
              Klik &quot;Tambah Video&quot; untuk mulai upload konten edukatif Anda
            </p>
            <Button
              onClick={() => {
                setEditingVideo(null);
                setFormData({
                  title: '',
                  description: '',
                  video_url: '',
                  platform: 'youtube',
                  category: '',
                  min_age: 0,
                  max_age: 18,
                });
                setShowAddVideo(true);
              }}
              className="bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-full px-8 py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
            >
              Tambah Video Pertama
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4 animate-slide-up">
              {videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="bg-white rounded-2xl p-4 border-4 border-[#FFE0B2] shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-3 mb-4">
                    <div className="w-24 h-16 bg-[#FFF5E5] rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-[#FFE0B2]">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🎬
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-[#4A4A4A] truncate mb-1">{video.title}</div>
                      <div className="text-xs font-bold text-[#8B7355] mb-2">{video.category || 'Tanpa kategori'}</div>
                      <span className="inline-flex items-center gap-1 bg-[#E3F2FD] text-[#1565C0] px-2.5 py-1 rounded-lg text-[10px] font-black border border-[#BBDEFB] whitespace-nowrap">
                        {video.min_age}-{video.max_age || '18'} tahun
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-[#FFE0B2]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                        video.status === 'published'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                          : video.status === 'draft'
                          ? 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        video.status === 'published' ? 'bg-[#2E7D32]' : 
                        video.status === 'draft' ? 'bg-[#F57F17]' : 'bg-gray-500'
                      }`}></span>
                      {video.status === 'published' ? 'Published' : video.status === 'draft' ? 'Draft' : video.status}
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-[#8B7355] font-bold text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {video.view_count.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/creator/video/${video.id}/quiz`)}
                      className="p-2 bg-[#F3E5F5] text-[#7B1FA2] hover:bg-[#E1BEE7] rounded-xl transition-colors border-2 border-[#E1BEE7]"
                      title="Kelola Quiz"
                    >
                      🎯
                    </button>
                    {video.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(video.id)}
                        className="p-2 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded-xl transition-colors border-2 border-[#C8E6C9]"
                        title="Publish"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    {video.status === 'published' && (
                      <button
                        onClick={() => handleArchive(video.id)}
                        className="p-2 bg-[#FFF8E1] text-[#F57F17] hover:bg-[#FFECB3] rounded-xl transition-colors border-2 border-[#FFECB3]"
                        title="Archive"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] rounded-xl transition-colors border-2 border-[#BBDEFB]"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] rounded-xl transition-colors border-2 border-[#FFCDD2]"
                      title="Hapus"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white rounded-[2rem] border-4 border-[#FFE0B2] shadow-xl overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FFF5E5] border-b-4 border-[#FFE0B2]">
                    <tr>
                      <th className="px-6 py-6 text-left text-sm font-black text-[#8B7355] uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-6 text-left text-sm font-black text-[#8B7355] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-6 text-left text-sm font-black text-[#8B7355] uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-6 text-left text-sm font-black text-[#8B7355] uppercase tracking-wider">
                        Usia Target
                      </th>
                      <th className="px-6 py-6 text-right text-sm font-black text-[#8B7355] uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#FFE0B2]">
                    {videos.map((video, index) => (
                      <tr 
                        key={video.id} 
                        className="hover:bg-[#FFF9F0] transition-colors animate-slide-up group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-16 bg-[#FFF5E5] rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-[#FFE0B2] group-hover:border-[#FF7A00] transition-colors">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  🎬
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-lg text-[#4A4A4A] truncate max-w-xs group-hover:text-[#FF7A00] transition-colors">{video.title}</div>
                              <div className="text-sm font-bold text-[#8B7355] truncate max-w-xs">{video.category || 'Tanpa kategori'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border-2 ${
                              video.status === 'published'
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                                : video.status === 'draft'
                                ? 'bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              video.status === 'published' ? 'bg-[#2E7D32]' : 
                              video.status === 'draft' ? 'bg-[#F57F17]' : 'bg-gray-500'
                            }`}></span>
                            {video.status === 'published' ? 'Published' : video.status === 'draft' ? 'Draft' : video.status}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 text-[#8B7355] font-bold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {video.view_count.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="inline-flex items-center gap-1 bg-[#E3F2FD] text-[#1565C0] px-3 py-1.5 rounded-full text-xs font-black border-2 border-[#BBDEFB] whitespace-nowrap">
                            {video.min_age}-{video.max_age || '18'} tahun
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => router.push(`/creator/video/${video.id}/quiz`)}
                              className="p-2.5 bg-[#F3E5F5] text-[#7B1FA2] hover:bg-[#E1BEE7] rounded-xl transition-colors border-2 border-[#E1BEE7] hover:border-[#CE93D8]"
                              title="Kelola Quiz"
                            >
                              🎯
                            </button>
                            {video.status === 'draft' && (
                              <button
                                onClick={() => handlePublish(video.id)}
                                className="p-2.5 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded-xl transition-colors border-2 border-[#C8E6C9] hover:border-[#A5D6A7]"
                                title="Publish"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {video.status === 'published' && (
                              <button
                                onClick={() => handleArchive(video.id)}
                                className="p-2.5 bg-[#FFF8E1] text-[#F57F17] hover:bg-[#FFECB3] rounded-xl transition-colors border-2 border-[#FFECB3] hover:border-[#FFE082]"
                                title="Archive"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(video)}
                              className="p-2.5 bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] rounded-xl transition-colors border-2 border-[#BBDEFB] hover:border-[#90CAF9]"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="p-2.5 bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2] rounded-xl transition-colors border-2 border-[#FFCDD2] hover:border-[#EF9A9A]"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Video Modal */}
      {showAddVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in bg-[#FFF9F0] rounded-[2rem] border-8 border-[#FFE0B2] shadow-2xl p-8 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black text-[#4A4A4A]">
                {editingVideo ? '✏️ Edit Video' : '🎬 Tambah Video'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddVideo(false);
                  setEditingVideo(null);
                  setError('');
                }}
                className="text-[#8B7355] hover:text-[#D94D2B] transition-colors bg-[#FFF5E5] p-2 rounded-full hover:bg-[#FFE0B2]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-[#FFEBEE] border-l-8 border-[#D94D2B] text-[#C62828] px-6 py-4 rounded-r-xl mb-8 animate-slide-down flex items-center gap-3 font-bold shadow-sm">
                <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black text-[#4A4A4A] ml-1">Judul Video *</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul video"
                  required
                  className="border-2 border-[#FFE0B2] focus:border-[#FF7A00] rounded-xl py-3 font-bold text-[#4A4A4A] placeholder-[#8B7355]/50"
                  icon={
                    <svg className="w-5 h-5 text-[#FF7A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-black text-[#4A4A4A] ml-1">URL Video (YouTube) *</label>
                <Input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="border-2 border-[#FFE0B2] focus:border-[#FF7A00] rounded-xl py-3 font-bold text-[#4A4A4A] placeholder-[#8B7355]/50"
                  icon={
                    <svg className="w-5 h-5 text-[#FF7A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-black text-[#4A4A4A] mb-2 ml-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#FFE0B2] rounded-xl text-[#4A4A4A] font-bold placeholder-[#8B7355]/50 transition-all duration-300 focus:outline-none focus:border-[#FF7A00] hover:border-[#FFCC80]"
                  rows={3}
                  placeholder="Deskripsi singkat tentang video..."
                />
              </div>

              <div>
                <label className="block text-sm font-black text-[#4A4A4A] mb-2 ml-1">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-[#FFE0B2] rounded-xl text-[#4A4A4A] font-bold transition-all duration-300 focus:outline-none focus:border-[#FF7A00] hover:border-[#FFCC80] appearance-none cursor-pointer"
                  >
                    <option value="">Pilih kategori</option>
                    <option value="matematika">📐 Matematika</option>
                    <option value="sains">🔬 Sains</option>
                    <option value="bahasa">📖 Bahasa</option>
                    <option value="seni">🎨 Seni</option>
                    <option value="musik">🎵 Musik</option>
                    <option value="cerita">📚 Cerita</option>
                    <option value="lainnya">📁 Lainnya</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF7A00]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-[#FFF5E5] p-4 rounded-2xl border-2 border-[#FFE0B2]">
                <div>
                  <label className="block text-sm font-black text-[#4A4A4A] mb-2">
                    Usia Minimum
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="18"
                      value={formData.min_age}
                      onChange={(e) => setFormData({ ...formData, min_age: Number(e.target.value) })}
                      className="flex-1 h-2 bg-[#FFE0B2] rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                    />
                    <span className="w-12 text-center font-black text-[#FF7A00] bg-white py-1 rounded-lg border border-[#FFE0B2]">{formData.min_age} th</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-[#4A4A4A] mb-2">
                    Usia Maximum
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="18"
                      value={formData.max_age}
                      onChange={(e) => setFormData({ ...formData, max_age: Number(e.target.value) })}
                      className="flex-1 h-2 bg-[#FFE0B2] rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                    />
                    <span className="w-12 text-center font-black text-[#FF7A00] bg-white py-1 rounded-lg border border-[#FFE0B2]">{formData.max_age} th</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddVideo(false);
                    setEditingVideo(null);
                    setError('');
                  }}
                  className="flex-1 text-[#8B7355] font-black hover:bg-[#FFF5E5] hover:text-[#D94D2B]"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
                >
                  {isSubmitting ? 'Menyimpan...' : editingVideo ? 'Update Video' : 'Simpan Video'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creator Profile Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl border-b-8 border-[#FFE0B2] p-8 max-w-md w-full animate-scale-in relative max-h-96 overflow-y-auto">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-[#8B7355] hover:text-[#FF7A00] transition-colors sticky"
            >
              <X size={24} strokeWidth={3} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#FF7A00] text-white rounded-full flex items-center justify-center text-2xl font-black shadow-md mx-auto mb-3">
                {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-black text-[#4A4A4A] mb-1">Pengaturan Profil</h3>
              <p className="text-sm text-[#8B7355]">Creator Mode</p>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 text-green-600 rounded-xl font-bold text-sm">
                {profileSuccess}
              </div>
            )}

            {!isEditMode ? (
              <div className="space-y-4">
                <div className="bg-[#FFF5E5] border-2 border-[#FFE0B2] rounded-2xl p-4">
                  <p className="text-xs text-[#8B7355] font-bold uppercase mb-1">Nama</p>
                  <p className="text-lg font-black text-[#4A4A4A]">{profileForm.full_name}</p>
                </div>
                <div className="bg-[#FFF5E5] border-2 border-[#FFE0B2] rounded-2xl p-4">
                  <p className="text-xs text-[#8B7355] font-bold uppercase mb-1">Email</p>
                  <p className="text-lg font-black text-[#4A4A4A]">{profileForm.email}</p>
                </div>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="w-full bg-[#FF7A00] text-white hover:bg-[#E66E00] font-black rounded-full"
                >
                  Edit Profil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-[#4A4A4A] mb-2">Nama Lengkap</label>
                  <Input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Masukkan nama"
                    className="rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#4A4A4A] mb-2">Email</label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Masukkan email"
                    className="rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] font-bold"
                  />
                </div>

                <div className="pt-2 border-t-2 border-[#FFE0B2]">
                  <p className="text-xs font-black text-[#8B7355] uppercase mb-3">Ganti Password (Opsional)</p>
                  
                  <div className="space-y-3">
                    <Input
                      type="password"
                      value={profileForm.current_password}
                      onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                      placeholder="Password saat ini"
                      className="rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] font-bold"
                    />
                    <Input
                      type="password"
                      value={profileForm.new_password}
                      onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                      placeholder="Password baru"
                      className="rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] font-bold"
                    />
                    <Input
                      type="password"
                      value={profileForm.confirm_password}
                      onChange={(e) => setProfileForm({ ...profileForm, confirm_password: e.target.value })}
                      placeholder="Konfirmasi password baru"
                      className="rounded-xl border-2 border-[#FFE0B2] focus:border-[#FF7A00] font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 text-[#8B7355] font-black hover:bg-[#FFF5E5]"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isProfileSubmitting}
                    className="flex-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black rounded-full"
                  >
                    Simpan
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

