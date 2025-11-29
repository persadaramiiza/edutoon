'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'creator' || user.role === 'admin') {
        router.push('/creator');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">🎬 EduToon</h1>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-white hover:text-white/80 transition px-4 py-2"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-white/90 transition"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Belajar Jadi
          <span className="block text-yellow-300">Menyenangkan! 🎉</span>
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mb-8">
          Platform video edukatif berbasis webtoon untuk anak-anak Indonesia.
          Konten aman, menyenangkan, dan penuh edukasi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-300 transition transform hover:scale-105"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/login"
            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition"
          >
            Sudah Punya Akun?
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Mengapa EduToon?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">👶</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Aman untuk Anak</h4>
              <p className="text-gray-600">
                Konten dikurasi khusus untuk anak-anak dengan kontrol orang tua penuh.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Edukatif</h4>
              <p className="text-gray-600">
                Video pembelajaran dari berbagai mata pelajaran yang dikemas menarik.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🎨</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Kreatif</h4>
              <p className="text-gray-600">
                Animasi dan webtoon yang membuat anak-anak betah belajar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-4 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">
          Siap Memulai Perjalanan Belajar?
        </h3>
        <p className="text-white/80 mb-8">
          Daftar sekarang dan dapatkan akses ke ribuan konten edukatif.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition"
        >
          Daftar Gratis
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-xl font-bold mb-4 md:mb-0">🎬 EduToon</div>
          <p className="text-gray-400 text-sm">
            © 2025 EduToon. Semua hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
