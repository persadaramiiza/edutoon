'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'creator'>('parent');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    // Validasi password yang lebih kuat
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password harus mengandung minimal 1 huruf besar');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password harus mengandung minimal 1 huruf kecil');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password harus mengandung minimal 1 angka');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name, role);
      setSuccess('Registrasi berhasil! Silakan login.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        setError(message[0]); // Tampilkan error pertama
      } else {
        setError(message || 'Registrasi gagal. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-hero overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <span className="text-5xl">🎬</span>
            <h1 className="text-2xl font-bold text-white mt-2">EduToon</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Buat Akun Baru
              </h2>
              <p className="text-gray-500 mt-2">
                Mulai perjalanan belajar anak Anda
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slide-down flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 animate-slide-down flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daftar sebagai
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 ${
                      role === 'parent'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className={`text-3xl mb-2 transition-transform duration-300 ${role === 'parent' ? 'scale-110' : 'group-hover:scale-105'}`}>
                      👨‍👩‍👧
                    </div>
                    <div className={`font-semibold ${role === 'parent' ? 'text-blue-700' : 'text-gray-700'}`}>
                      Orang Tua
                    </div>
                    <div className={`text-xs mt-1 ${role === 'parent' ? 'text-blue-600' : 'text-gray-500'}`}>
                      Kelola profil anak
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 ${
                      role === 'creator'
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className={`text-3xl mb-2 transition-transform duration-300 ${role === 'creator' ? 'scale-110' : 'group-hover:scale-105'}`}>
                      🎥
                    </div>
                    <div className={`font-semibold ${role === 'creator' ? 'text-purple-700' : 'text-gray-700'}`}>
                      Creator
                    </div>
                    <div className={`text-xs mt-1 ${role === 'creator' ? 'text-purple-600' : 'text-gray-500'}`}>
                      Upload konten video
                    </div>
                  </button>
                </div>
              </div>

              <Input
                label="Nama Lengkap"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 karakter, huruf besar, kecil, angka"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
                variant={role === 'creator' ? 'secondary' : 'primary'}
              >
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Masuk
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob blob-1 absolute top-20 right-10 w-64 h-64 bg-pink-400/30"></div>
          <div className="blob blob-2 absolute bottom-20 left-10 w-80 h-80 bg-indigo-400/30"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center gap-4 mb-8">
            <div className="animate-bounce-soft text-6xl">👶</div>
            <div className="animate-bounce-soft delay-200 text-7xl">📚</div>
            <div className="animate-bounce-soft delay-400 text-6xl">🎓</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Bergabung dengan EduToon
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Ribuan orang tua telah mempercayakan pendidikan anak mereka kepada kami
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '50K+', label: 'Pengguna' },
              { value: '1000+', label: 'Video' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
