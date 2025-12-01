'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video, CreateVideoData } from '@/lib/videos';
import { Button, Card, Input } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';

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
    category: '',
    min_age: 0,
    max_age: 18,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user?.role === 'parent') {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.role === 'creator' || user?.role === 'admin') {
      loadVideos();
    }
  }, [user]);

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
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        video_url: '',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🎥
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Creator Dashboard</h1>
              <p className="text-xs text-gray-500">Kelola konten video Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{user.full_name || user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
            { label: 'Total Video', value: videos.length, icon: '🎬', gradient: 'from-purple-500 to-indigo-500' },
            { label: 'Published', value: publishedCount, icon: '✅', gradient: 'from-green-500 to-emerald-500' },
            { label: 'Draft', value: draftCount, icon: '📝', gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁', gradient: 'from-blue-500 to-cyan-500' },
          ].map((stat, i) => (
            <Card key={i} className="relative overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`}></div>
              <div className="relative">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Video Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Video Saya</h2>
            <p className="text-gray-500">Kelola dan pantau performa video Anda</p>
          </div>
          <Button
            onClick={() => {
              setEditingVideo(null);
              setFormData({
                title: '',
                description: '',
                video_url: '',
                category: '',
                min_age: 0,
                max_age: 18,
              });
              setShowAddVideo(true);
            }}
            variant="secondary"
            className="shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Video
          </Button>
        </div>

        {/* Video List */}
        {videos.length === 0 ? (
          <Card className="text-center py-16 animate-scale-in">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Video</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Klik &quot;Tambah Video&quot; untuk mulai upload konten edukatif Anda
            </p>
            <Button
              onClick={() => {
                setEditingVideo(null);
                setFormData({
                  title: '',
                  description: '',
                  video_url: '',
                  category: '',
                  min_age: 0,
                  max_age: 18,
                });
                setShowAddVideo(true);
              }}
              variant="secondary"
            >
              Tambah Video Pertama
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0 animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Usia Target
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {videos.map((video, index) => (
                    <tr 
                      key={video.id} 
                      className="hover:bg-gray-50/50 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                🎬
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate max-w-xs">{video.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{video.category || 'Tanpa kategori'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            video.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : video.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            video.status === 'published' ? 'bg-green-500' : 
                            video.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></span>
                          {video.status === 'published' ? 'Published' : video.status === 'draft' ? 'Draft' : video.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {video.view_count.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {video.min_age}-{video.max_age || '18'} tahun
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1 flex-wrap">
                          <button
                            onClick={() => router.push(`/creator/video/${video.id}/quiz`)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Kelola Quiz"
                          >
                            🎯
                          </button>
                          {video.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(video.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Publish"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {video.status === 'published' && (
                            <button
                              onClick={() => handleArchive(video.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(video)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Add/Edit Video Modal */}
      {showAddVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingVideo ? '✏️ Edit Video' : '🎬 Tambah Video Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddVideo(false);
                  setEditingVideo(null);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Judul Video *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul video"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              />

              <Input
                label="URL Video (YouTube/Vimeo) *"
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400"
                  rows={3}
                  placeholder="Deskripsi singkat tentang video..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usia Minimum
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="18"
                      value={formData.min_age}
                      onChange={(e) => setFormData({ ...formData, min_age: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="w-12 text-center font-semibold text-purple-600">{formData.min_age} th</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usia Maximum
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="18"
                      value={formData.max_age}
                      onChange={(e) => setFormData({ ...formData, max_age: Number(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="w-12 text-center font-semibold text-purple-600">{formData.max_age} th</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddVideo(false);
                    setEditingVideo(null);
                    setError('');
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Menyimpan...' : editingVideo ? 'Update Video' : 'Simpan Video'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
