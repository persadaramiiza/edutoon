'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Loading';
import { ArrowLeft, Play, X } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';
import { reportService, ReportData } from '@/lib/report';
import { getYouTubeThumbnail } from '@/lib/utils';

function ReportContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const childName = searchParams.get('name') || 'Anak';
  const profileId = searchParams.get('id') || '';
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !profileId) {
      router.push('/dashboard');
      return;
    }

    const loadReport = async () => {
      try {
        setIsLoading(true);
        const data = await reportService.getProfileReport(parseInt(profileId));
        setReportData(data);
      } catch (err: any) {
        console.error('Error loading report:', err);
        setError('Gagal memuat laporan');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [profileId, user, router]);

  if (isLoading) {
    return <LoadingPage text="Memuat laporan..." />;
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#D94D2B] font-bold mb-4">Error: {error}</p>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleContinueWatching = () => {
    if (selectedItem) {
      router.push(`/watch/${selectedItem.id}?profile=${profileId}&from=report&childName=${encodeURIComponent(childName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="bg-white hover:bg-[#FFF5E5] text-[#8B7355] rounded-full p-2 shadow-sm"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </Button>
          <h1 className="text-3xl font-black text-[#4A4A4A]">Laporan Belajar {childName} 📊</h1>
        </div>

        <Card className="p-6 sm:p-8 border-b-8 border-[#FFE0B2] shadow-xl bg-white animate-scale-in">
          <div className="flex flex-col gap-8">
            {/* Top Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-[#FFF5E5]">
              <div className="w-24 h-24 bg-[#FFF5E5] rounded-full flex items-center justify-center text-4xl font-bold text-[#FF7A00] border-4 border-[#FFE0B2] shadow-inner">
                {childName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h2 className="text-2xl font-black text-[#4A4A4A]">{childName}</h2>
                </div>
                <p className="text-[#8B7355] font-bold">Terus semangat belajar ya! 🌟</p>
              </div>
              <div className="bg-[#E8F5E9] text-[#2E7D32] px-6 py-3 rounded-2xl text-center border-2 border-[#C8E6C9]">
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Skor Rata-rata</p>
                <p className="text-4xl font-black">{reportData.average_score}%</p>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity Summary */}
              <div className="space-y-4">
                <h3 className="font-black text-lg text-[#4A4A4A] flex items-center gap-2">
                  <span>📈</span> Ringkasan Aktivitas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFF9F0] p-4 rounded-2xl border-2 border-[#FFE0B2]">
                    <p className="text-3xl font-black text-[#FF7A00] mb-1">{reportData.total_watched}</p>
                    <p className="text-sm text-[#8B7355] font-bold leading-tight">Video Ditonton</p>
                  </div>
                  <div className="bg-[#E3F2FD] p-4 rounded-2xl border-2 border-[#BBDEFB]">
                    <p className="text-3xl font-black text-[#1976D2] mb-1">{reportData.quiz_attempts}</p>
                    <p className="text-sm text-[#1565C0] font-bold leading-tight">Kuis Dikerjakan</p>
                  </div>
                  <div className="bg-[#F3E5F5] p-4 rounded-2xl border-2 border-[#E1BEE7]">
                    <p className="text-3xl font-black text-[#7B1FA2] mb-1">{reportData.completed_videos}</p>
                    <p className="text-sm text-[#6A1B9A] font-bold leading-tight">Video Selesai</p>
                  </div>
                  <div className="bg-[#E0F2F1] p-4 rounded-2xl border-2 border-[#B2DFDB]">
                    <p className="text-3xl font-black text-[#00796B] mb-1">{reportData.correct_answers}</p>
                    <p className="text-sm text-[#004D40] font-bold leading-tight">Jawaban Benar</p>
                  </div>
                </div>
                <div className="bg-[#FFF9F0] p-4 rounded-2xl border-2 border-[#FFE0B2]">
                  <p className="text-sm text-[#8B7355] font-bold mb-1">Aktivitas Terakhir</p>
                  <p className="text-lg font-black text-[#4A4A4A]">{reportData.last_activity}</p>
                </div>
              </div>

              {/* Continue Watching List */}
              <div>
                <h3 className="font-black text-lg text-[#4A4A4A] mb-4 flex items-center gap-2">
                  <span>🎬</span> Lanjutkan Menonton
                </h3>
                <div className="space-y-3">
                  {reportData.continue_watching.length > 0 ? (
                    reportData.continue_watching.slice(0, 4).map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleItemClick(item)}
                        className="flex items-center justify-between p-3 bg-white border-2 border-[#F5F5F5] rounded-xl transition-all group hover:border-[#FF7A00] cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-[#FFF3E0] text-[#FF9800] overflow-hidden relative">
                            {item.thumbnail_url || getYouTubeThumbnail(item.video_url) ? (
                              <Image
                                src={item.thumbnail_url || getYouTubeThumbnail(item.video_url) || ''}
                                alt={item.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              '📺'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#4A4A4A] text-sm group-hover:text-[#FF7A00] transition-colors line-clamp-2">{item.title || 'Video'}</p>
                            <p className="text-xs text-[#8B7355]">{Math.round(item.last_position_seconds / 60)} menit ditonton</p>
                          </div>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 text-[#FF7A00] text-xs font-bold flex items-center gap-1 transition-opacity flex-shrink-0">
                          <Play size={12} fill="currentColor" />
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#FFF5E5] rounded-xl border-2 border-[#FFE0B2] text-center">
                      <p className="text-[#8B7355] font-bold">Belum ada video yang ditonton</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quiz History Section */}
            {reportData.quiz_history.length > 0 && (
              <div className="border-t-2 border-[#FFF5E5] pt-6">
                <h3 className="font-black text-lg text-[#4A4A4A] mb-4 flex items-center gap-2">
                  <span>📝</span> Riwayat Kuis Terbaru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportData.quiz_history.slice(0, 6).map((quiz, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        quiz.is_correct 
                          ? 'bg-[#E8F5E9] border-[#C8E6C9]' 
                          : 'bg-[#FFEBEE] border-[#FFCDD2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black">
                          {quiz.is_correct ? '✅' : '❌'}
                        </span>
                        <span className={`text-xs font-bold ${
                          quiz.is_correct ? 'text-[#2E7D32]' : 'text-[#C62828]'
                        }`}>
                          {new Date(quiz.attempted_at).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Continue Watching Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl border-b-8 border-[#FFE0B2] p-8 max-w-sm w-full animate-scale-in relative">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-[#8B7355] hover:text-[#FF7A00] transition-colors"
              >
                <X size={24} strokeWidth={3} />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#FFF5E5] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-[#FFE0B2] overflow-hidden relative">
                  {selectedItem.thumbnail_url || getYouTubeThumbnail(selectedItem.video_url) ? (
                    <Image
                      src={selectedItem.thumbnail_url || getYouTubeThumbnail(selectedItem.video_url) || ''}
                      alt={selectedItem.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    '📺'
                  )}
                </div>
                <h3 className="text-2xl font-black text-[#4A4A4A] mb-2">Lanjut Menonton?</h3>
                <p className="text-[#8B7355] font-bold mb-6">
                  Ingin menonton kembali video <br/>
                  <span className="text-[#FF7A00]">"{selectedItem.title || 'ini'}"</span>?
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 text-[#8B7355] font-bold hover:bg-[#FFF5E5]"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleContinueWatching}
                    className="flex-1 bg-[#FF7A00] text-white hover:bg-[#E66E00] font-black rounded-full shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play size={18} fill="currentColor" /> Ya, Putar!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
