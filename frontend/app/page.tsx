'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar, Button } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';

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
    return <LoadingPage text="Memuat..." />;
  }

  const features = [
    {
      icon: '🎨',
      title: 'Konten Animasi Menarik',
      description: 'Video edukatif dengan animasi colorful yang disukai anak-anak',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: '🎯',
      title: 'Quiz Interaktif',
      description: 'Uji pemahaman anak dengan quiz seru setelah menonton video',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '👨‍👩‍👧',
      title: 'Kontrol Orang Tua',
      description: 'Kelola profil anak dan pantau progress belajar mereka',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: '📊',
      title: 'Laporan Progress',
      description: 'Lihat statistik dan perkembangan belajar anak secara detail',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '🔒',
      title: 'Konten Aman',
      description: 'Semua video dikurasi untuk memastikan konten ramah anak',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: '🎥',
      title: 'Creator Dashboard',
      description: 'Platform untuk creator berbagi konten edukatif berkualitas',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Video Edukatif' },
    { value: '50K+', label: 'Anak Belajar' },
    { value: '500+', label: 'Quiz Interaktif' },
    { value: '4.9', label: 'Rating' },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Ibu dari 2 anak',
      content: 'Anak-anak saya sangat suka belajar dengan EduToon. Mereka tidak sabar menunggu video baru setiap minggu!',
      avatar: '👩',
    },
    {
      name: 'Budi W.',
      role: 'Ayah dari 3 anak',
      content: 'Fitur quiz-nya sangat membantu memastikan anak-anak benar-benar memahami materi yang dipelajari.',
      avatar: '👨',
    },
    {
      name: 'Rina K.',
      role: 'Guru TK',
      content: 'Saya merekomendasikan EduToon kepada semua orang tua murid saya. Kontennya sangat berkualitas!',
      avatar: '👩‍🏫',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob blob-1 absolute top-20 left-10 w-72 h-72 bg-blue-400"></div>
          <div className="blob blob-2 absolute top-40 right-20 w-96 h-96 bg-purple-400"></div>
          <div className="blob blob-3 absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="animate-slide-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <span className="animate-pulse">🚀</span>
              Platform Edukasi #1 untuk Anak Indonesia
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 animate-slide-up leading-tight">
            Belajar Jadi{' '}
            <span className="relative">
              <span className="relative z-10">Menyenangkan</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-400" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 8 Q50 0 100 4 T200 8" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
            <br />
            dengan{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              EduToon!
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
            Platform video edukatif dengan animasi menarik dan quiz interaktif 
            untuk anak-anak usia 3-12 tahun. Belajar sambil bermain!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
            <Link href="/register">
              <Button size="lg" className="shadow-2xl min-w-[200px]">
                Mulai Gratis
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-gray-800 min-w-[200px]">
                Sudah Punya Akun
              </Button>
            </Link>
          </div>

          {/* Floating Characters */}
          <div className="mt-16 flex justify-center items-end gap-4 animate-fade-in delay-500">
            <div className="animate-bounce-soft text-6xl sm:text-7xl">🦁</div>
            <div className="animate-bounce-soft delay-200 text-7xl sm:text-8xl">🐰</div>
            <div className="animate-bounce-soft delay-400 text-6xl sm:text-7xl">🐸</div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white relative -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg card-hover animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
              ✨ Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Kenapa Pilih <span className="gradient-text">EduToon?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Dirancang khusus untuk membantu anak-anak belajar dengan cara yang menyenangkan dan efektif
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
              📋 Cara Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Mudah untuk <span className="gradient-text">Memulai</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Daftar Akun', desc: 'Buat akun gratis sebagai orang tua atau creator', icon: '📝' },
              { step: '02', title: 'Buat Profil Anak', desc: 'Tambahkan profil untuk setiap anak dengan usia mereka', icon: '👶' },
              { step: '03', title: 'Mulai Belajar', desc: 'Pilih video edukatif dan selesaikan quiz interaktif', icon: '🎓' },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-8xl font-bold text-gray-100 absolute -top-4 left-1/2 -translate-x-1/2">{item.step}</div>
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-purple-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium mb-4">
              💬 Testimoni
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Apa Kata <span className="gradient-text">Mereka?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex gap-1 mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="blob blob-1 absolute top-10 right-10 w-64 h-64 bg-white/10"></div>
          <div className="blob blob-2 absolute bottom-10 left-10 w-80 h-80 bg-white/10"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 animate-slide-up">
            Siap Membuat Anak Anda
            <br />
            <span className="text-yellow-300">Suka Belajar?</span>
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto animate-slide-up delay-100">
            Bergabung dengan ribuan orang tua yang sudah mempercayakan pendidikan anak mereka kepada EduToon
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl min-w-[200px]">
                Daftar Sekarang - Gratis!
              </Button>
            </Link>
          </div>
          <p className="text-white/70 text-sm mt-6 animate-fade-in delay-300">
            ✓ Gratis untuk memulai &nbsp;&nbsp; ✓ Tanpa kartu kredit &nbsp;&nbsp; ✓ Batalkan kapan saja
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🎬</span>
                <span className="text-2xl font-bold">EduToon</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Platform edukasi video interaktif untuk anak-anak Indonesia. 
                Belajar jadi menyenangkan dengan animasi menarik dan quiz seru!
              </p>
              <div className="flex gap-4">
                {['📘', '📷', '🐦', '📺'].map((icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Tautan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Harga</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Keamanan Anak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EduToon. Made with ❤️ for Indonesian Children.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
