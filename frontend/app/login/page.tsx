'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-hero overflow-hidden">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob blob-1 absolute top-20 left-10 w-64 h-64 bg-blue-400/30"></div>
          <div className="blob blob-2 absolute bottom-20 right-10 w-80 h-80 bg-purple-400/30"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-8 animate-bounce-soft">🎬</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Selamat Datang di EduToon!
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Platform edukasi video interaktif untuk anak-anak Indonesia. 
            Belajar jadi menyenangkan!
          </p>
          
          {/* Floating Elements */}
          <div className="flex justify-center gap-4 mt-8">
            <div className="animate-float delay-100 text-5xl">📚</div>
            <div className="animate-float delay-300 text-5xl">🎨</div>
            <div className="animate-float delay-500 text-5xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🎬</span>
            <h1 className="text-2xl font-bold text-white mt-2">EduToon</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Masuk ke Akun
              </h2>
              <p className="text-gray-500 mt-2">
                Lanjutkan perjalanan belajar Anda
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="••••••••"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">atau</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Belum punya akun?{' '}
                  <Link 
                    href="/register" 
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
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
    </div>
  );
}
