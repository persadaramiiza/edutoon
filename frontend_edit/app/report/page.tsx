'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { ArrowLeft, Play, X } from 'lucide-react';
import { Suspense, useState } from 'react';

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childName = searchParams.get('name') || 'Anak';
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // TODO: Fetch real stats from API
  const stats = {
    name: childName,
    age: 0,
    total_watched: 0,
    avg_score: 0,
    last_activity: '-',
    history: [] as any[]
  };

  const handleItemClick = (item: any) => {
    if (item.type === 'video') {
      setSelectedItem(item);
    }
  };

  const handleContinueWatching = () => {
    if (selectedItem) {
      // Mock navigation to watch page
      router.push(`/watch/${selectedItem.id}`);
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
          <h1 className="text-3xl font-black text-[#4A4A4A]">Laporan Belajar {stats.name} 📊</h1>
        </div>

        <Card className="p-6 sm:p-8 border-b-8 border-[#FFE0B2] shadow-xl bg-white animate-scale-in">
          <div className="flex flex-col gap-8">
            {/* Top Stats */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-[#FFF5E5]">
              <div className="w-24 h-24 bg-[#FFF5E5] rounded-full flex items-center justify-center text-4xl font-bold text-[#FF7A00] border-4 border-[#FFE0B2] shadow-inner">
                {stats.name.charAt(0)}
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h2 className="text-2xl font-black text-[#4A4A4A]">{stats.name}</h2>
                  <span className="bg-[#FF7A00] text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm w-fit mx-auto sm:mx-0">
                    {stats.age} Tahun
                  </span>
                </div>
                <p className="text-[#8B7355] font-bold">Terus semangat belajar ya! 🌟</p>
              </div>
              <div className="bg-[#E8F5E9] text-[#2E7D32] px-6 py-3 rounded-2xl text-center border-2 border-[#C8E6C9]">
                <p className="text-sm font-bold uppercase tracking-wider opacity-80">Skor Rata-rata</p>
                <p className="text-4xl font-black">{stats.avg_score}</p>
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
                    <p className="text-3xl font-black text-[#FF7A00] mb-1">{stats.total_watched}</p>
                    <p className="text-sm text-[#8B7355] font-bold leading-tight">Video Ditonton</p>
                  </div>
                  <div className="bg-[#E3F2FD] p-4 rounded-2xl border-2 border-[#BBDEFB]">
                    <p className="text-3xl font-black text-[#1976D2] mb-1">{stats.history.filter(h => h.type === 'quiz').length}</p>
                    <p className="text-sm text-[#1565C0] font-bold leading-tight">Kuis Dikerjakan</p>
                  </div>
                </div>
                <div className="bg-[#FFF9F0] p-4 rounded-2xl border-2 border-[#FFE0B2]">
                  <p className="text-sm text-[#8B7355] font-bold mb-1">Aktivitas Terakhir</p>
                  <p className="text-lg font-black text-[#4A4A4A]">{stats.last_activity}</p>
                </div>
              </div>

              {/* History List */}
              <div>
                <h3 className="font-black text-lg text-[#4A4A4A] mb-4 flex items-center gap-2">
                  <span>🕒</span> Riwayat Terbaru
                </h3>
                <div className="space-y-3">
                  {stats.history.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center justify-between p-3 bg-white border-2 border-[#F5F5F5] rounded-xl transition-all group ${
                        item.type === 'video' 
                          ? 'hover:border-[#FF7A00] cursor-pointer hover:shadow-md hover:-translate-y-0.5' 
                          : 'hover:border-[#BBDEFB]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.type === 'video' ? 'bg-[#FFF3E0] text-[#FF9800]' : 'bg-[#E3F2FD] text-[#2196F3]'}`}>
                          {item.type === 'video' ? '📺' : '📝'}
                        </div>
                        <div>
                          <p className="font-bold text-[#4A4A4A] text-sm group-hover:text-[#FF7A00] transition-colors">{item.title}</p>
                          <p className="text-xs text-[#8B7355]">{item.date}</p>
                        </div>
                      </div>
                      {item.score ? (
                        <span className="font-black text-[#4CAF50] bg-[#E8F5E9] px-2 py-1 rounded-lg text-xs">
                          {item.score} Poin
                        </span>
                      ) : (
                        <span className="opacity-0 group-hover:opacity-100 text-[#FF7A00] text-xs font-bold flex items-center gap-1 transition-opacity">
                          <Play size={12} fill="currentColor" /> Tonton Lagi
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                <div className="w-20 h-20 bg-[#FFF5E5] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-[#FFE0B2]">
                  📺
                </div>
                <h3 className="text-2xl font-black text-[#4A4A4A] mb-2">Lanjut Menonton?</h3>
                <p className="text-[#8B7355] font-bold mb-6">
                  Ingin menonton kembali video <br/>
                  <span className="text-[#FF7A00]">"{selectedItem.title}"</span>?
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
