'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video, CreateVideoData } from '@/lib/videos';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🎥 Creator Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>{user.full_name || user.email}</span>
            <button
              onClick={logout}
              className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-purple-600">{videos.length}</div>
            <div className="text-gray-600">Total Video</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-green-600">
              {videos.filter(v => v.status === 'published').length}
            </div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-blue-600">
              {videos.reduce((acc, v) => acc + v.view_count, 0)}
            </div>
            <div className="text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Add Video Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Video Saya</h2>
          <button
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
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            + Tambah Video
          </button>
        </div>

        {/* Video List */}
        {videos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-500">Belum ada video. Klik &quot;Tambah Video&quot; untuk memulai.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              🎬
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{video.title}</div>
                          <div className="text-sm text-gray-500">{video.category || 'Tanpa kategori'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : video.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{video.view_count}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {video.min_age}-{video.max_age || '18'} tahun
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/creator/video/${video.id}/quiz`)}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                          title="Kelola Quiz"
                        >
                          🎯 Quiz
                        </button>
                        {video.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(video.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Publish
                          </button>
                        )}
                        {video.status === 'published' && (
                          <button
                            onClick={() => handleArchive(video.id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(video)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Video Modal */}
      {showAddVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingVideo ? 'Edit Video' : 'Tambah Video Baru'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Video *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Video (YouTube/Vimeo) *
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="">Pilih kategori</option>
                  <option value="matematika">Matematika</option>
                  <option value="sains">Sains</option>
                  <option value="bahasa">Bahasa</option>
                  <option value="seni">Seni</option>
                  <option value="musik">Musik</option>
                  <option value="cerita">Cerita</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usia Min: {formData.min_age} tahun
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    value={formData.min_age}
                    onChange={(e) => setFormData({ ...formData, min_age: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usia Max: {formData.max_age} tahun
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    value={formData.max_age}
                    onChange={(e) => setFormData({ ...formData, max_age: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideo(false);
                    setEditingVideo(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingVideo ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
