'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { profilesService, Profile } from '@/lib/profiles';
import { videosService, Video } from '@/lib/videos';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(5);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Profile Selection View
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">🎬 EduToon</h1>
            <div className="flex items-center gap-4">
              <span className="text-white">Halo, {user.full_name || user.email}</span>
              <button
                onClick={logout}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Profile Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Siapa yang menonton?
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="relative group">
                  <button
                    onClick={() => setSelectedProfile(profile)}
                    className="w-full flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl text-white mb-3">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{profile.name}</span>
                    <span className="text-sm text-gray-500">{profile.age_group} tahun</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add Profile Button */}
              <button
                onClick={() => setShowAddProfile(true)}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-400 mb-3">
                  +
                </div>
                <span className="font-medium text-gray-600">Tambah Profil</span>
              </button>
            </div>
          </div>

          {/* Add Profile Modal */}
          {showAddProfile && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tambah Profil Anak</h3>
                <form onSubmit={handleAddProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Anak
                    </label>
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usia: {newProfileAge} tahun
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="18"
                      value={newProfileAge}
                      onChange={(e) => setNewProfileAge(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProfile(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Video List View
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProfile(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Ganti Profil
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              🎬 EduToon - {selectedProfile.name}
            </h1>
          </div>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Video untuk {selectedProfile.name} ({selectedProfile.age_group} tahun)
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Belum ada video yang tersedia untuk usia ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/watch/${video.id}?profile=${selectedProfile.id}`)}
              >
                <div className="aspect-video bg-gray-200 relative">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎬
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.platform === 'youtube' && '▶ YouTube'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>👁 {video.view_count} views</span>
                    {video.category && <span>• {video.category}</span>}
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
