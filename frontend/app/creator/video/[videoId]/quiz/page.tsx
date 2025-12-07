'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video } from '@/lib/videos';
import { quizzesService, Quiz, CreateQuizDto } from '@/lib/quizzes';
import { LoadingPage } from '@/components/ui/Loading';

export default function ManageQuizPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [timestampMinutes, setTimestampMinutes] = useState(0);
  const [timestampSeconds, setTimestampSeconds] = useState(30);
  const [options, setOptions] = useState([
    { option_text: '', is_correct: true },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ]);

  const videoId = Number(params.videoId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'creator' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (videoId && user) {
      loadVideo();
      loadQuizzes();
    }
  }, [videoId, user]);

  const loadVideo = async () => {
    try {
      const data = await videosService.getById(videoId);
      setVideo(data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  const loadQuizzes = async () => {
    try {
      const data = await quizzesService.getByVideoId(videoId);
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleOptionChange = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    setOptions(prev => {
      const newOptions = [...prev];
      
      if (field === 'is_correct') {
        // ✅ FIX: Set all to false first, then set selected to true
        newOptions.forEach((opt, i) => {
          newOptions[i] = { ...opt, is_correct: i === index };
        });
      } else {
        // Update text field
        newOptions[index] = { ...newOptions[index], option_text: value as string };
      }
      
      return newOptions;
    });
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!questionText.trim()) {
      setError('Pertanyaan harus diisi');
      return;
    }

    const filledOptions = options.filter(o => o.option_text.trim());
    if (filledOptions.length < 2) {
      setError('Minimal 2 pilihan jawaban harus diisi');
      return;
    }

    if (!filledOptions.some(o => o.is_correct)) {
      setError('Harus ada satu jawaban yang benar');
      return;
    }

    setSubmitting(true);

    try {
      const dto: CreateQuizDto = {
        videoId,
        timestamp_seconds: timestampMinutes * 60 + timestampSeconds,
        question_text: questionText,
        options: filledOptions,
      };

      await quizzesService.create(dto);
      
      // Reset form
      setQuestionText('');
      setTimestampMinutes(0);
      setTimestampSeconds(30);
      setOptions([
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ]);
      setShowAddQuiz(false);
      
      // Reload quizzes
      loadQuizzes();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Gagal menambah quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Yakin ingin menghapus quiz ini?')) return;

    try {
      await quizzesService.delete(quizId);
      loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Gagal menghapus quiz');
    }
  };

  if (isLoading || loadingVideo) {
    return <LoadingPage text="Memuat data quiz..." />;
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-gray-600">Video tidak ditemukan</p>
          <button
            onClick={() => router.push('/creator')}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/creator')}
              className="text-[#8B7355] hover:text-[#FF7A00] transition font-bold flex items-center gap-2"
            >
              <span className="text-xl">←</span> Kembali
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#4A4A4A]">🎯 Kelola Quiz</h1>
              <p className="text-[#8B7355] text-sm font-bold truncate max-w-md">{video.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddQuiz(true)}
            className="bg-[#FF7A00] text-white px-6 py-3 rounded-full font-black hover:bg-[#E66E00] transition shadow-lg hover:shadow-xl hover:-translate-y-1 border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
          >
            + Tambah Quiz
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Video Preview */}
        <div className="bg-white rounded-[2rem] border-4 border-[#FFE0B2] shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF5E5] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <h2 className="text-xl font-black text-[#4A4A4A] mb-4 relative z-10">Video Preview</h2>
          <div className="aspect-video bg-[#000] rounded-2xl overflow-hidden max-w-3xl mx-auto border-4 border-[#4A4A4A] shadow-lg relative z-10">
            {video.platform === 'youtube' && (
              <iframe
                src={`https://www.youtube.com/embed/${video.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`}
                className="w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <p className="text-[#8B7355] text-sm font-bold mt-4 text-center bg-[#FFF9F0] py-2 rounded-xl border border-[#FFE0B2] inline-block px-4 relative z-10">
            💡 Tips: Perhatikan timestamp video untuk menentukan kapan quiz muncul
          </p>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-[2rem] border-4 border-[#FFE0B2] shadow-xl overflow-hidden">
          <div className="p-6 border-b-4 border-[#FFE0B2] bg-[#FFF5E5]">
            <h2 className="text-xl font-black text-[#4A4A4A]">
              Daftar Quiz ({quizzes.length})
            </h2>
          </div>

          {quizzes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-8xl mb-6 animate-bounce">🎯</div>
              <p className="text-[#8B7355] font-bold text-lg mb-8">Belum ada quiz untuk video ini</p>
              <button
                onClick={() => setShowAddQuiz(true)}
                className="bg-[#FF7A00] text-white px-8 py-4 rounded-full font-black hover:bg-[#E66E00] transition shadow-lg hover:shadow-xl hover:-translate-y-1 border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
              >
                Tambah Quiz Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y-2 divide-[#FFE0B2]">
              {quizzes.map((quiz, index) => (
                <div key={quiz.id} className="p-6 hover:bg-[#FFF9F0] transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#E1BEE7] text-[#7B1FA2] px-3 py-1 rounded-full text-xs font-black border border-[#CE93D8]">
                          Quiz #{index + 1}
                        </span>
                        <span className="bg-[#FFF5E5] text-[#8B7355] px-3 py-1 rounded-full text-xs font-bold border border-[#FFE0B2]">
                          ⏱ {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[#4A4A4A] font-black text-lg mb-4">{quiz.question_text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quiz.options.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                              option.is_correct
                                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                                : 'bg-white text-[#8B7355] border-[#FFE0B2]'
                            }`}
                          >
                            <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full mr-2 ${
                                option.is_correct ? 'bg-[#2E7D32] text-white' : 'bg-[#FFE0B2] text-[#8B7355]'
                            }`}>
                                {String.fromCharCode(65 + optIndex)}
                            </span>
                            {option.option_text}
                            {option.is_correct && <span className="ml-2 text-lg">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-[#C62828] hover:text-white hover:bg-[#C62828] p-3 rounded-xl transition-colors border-2 border-transparent hover:border-[#B71C1C]"
                      title="Hapus Quiz"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Quiz Modal */}
      {showAddQuiz && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FFF9F0] rounded-[2rem] border-8 border-[#FFE0B2] shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-[#4A4A4A]">🎯 Tambah Quiz Baru</h3>
                <p className="text-[#8B7355] text-sm font-bold mt-1">Buat pertanyaan interaktif untuk video</p>
              </div>
              <button
                onClick={() => {
                  setShowAddQuiz(false);
                  setError('');
                }}
                className="text-[#8B7355] hover:text-[#D94D2B] transition p-2 hover:bg-[#FFF5E5] rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-[#FFEBEE] border-2 border-[#EF5350] text-[#C62828] px-4 py-3 rounded-xl mb-6 font-bold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAddQuiz} className="space-y-6">
              {/* Timestamp */}
              <div>
                <label className="block text-sm font-black text-[#4A4A4A] mb-3 ml-1">
                  ⏱ Waktu Muncul (timestamp) *
                </label>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-[#FFE0B2]">
                  <input
                    type="number"
                    min="0"
                    value={timestampMinutes}
                    onChange={(e) => setTimestampMinutes(Number(e.target.value))}
                    className="w-20 px-3 py-2 border-2 border-[#FFE0B2] rounded-lg text-[#4A4A4A] font-bold focus:outline-none focus:border-[#FF7A00]"
                  />
                  <span className="text-[#8B7355] font-bold">menit</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timestampSeconds}
                    onChange={(e) => setTimestampSeconds(Number(e.target.value))}
                    className="w-20 px-3 py-2 border-2 border-[#FFE0B2] rounded-lg text-[#4A4A4A] font-bold focus:outline-none focus:border-[#FF7A00]"
                  />
                  <span className="text-[#8B7355] font-bold">detik</span>
                </div>
                <p className="text-xs font-bold text-[#8B7355] mt-2 ml-1">
                  Quiz akan muncul di: {timestampMinutes}:{String(timestampSeconds).padStart(2, '0')}
                </p>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-black text-[#4A4A4A] mb-3 ml-1">
                  ❓ Pertanyaan Quiz *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#FFE0B2] rounded-xl text-[#4A4A4A] font-bold focus:outline-none focus:border-[#FF7A00] transition-all resize-none"
                  rows={3}
                  placeholder="Contoh: Apa ibukota Indonesia?"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-black text-[#4A4A4A] mb-3 ml-1">
                  📝 Pilihan Jawaban * (minimal 2)
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      {/* Radio button */}
                      <div className="relative">
                        <input
                          type="radio"
                          name="correctAnswer"
                          id={`option-${index}`}
                          checked={option.is_correct}
                          onChange={() => handleOptionChange(index, 'is_correct', true)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`option-${index}`}
                          className="block w-8 h-8 rounded-full border-2 border-[#FFE0B2] bg-white peer-checked:bg-[#2E7D32] peer-checked:border-[#2E7D32] cursor-pointer transition-all hover:border-[#FF7A00] flex items-center justify-center"
                        >
                          <span className="text-white font-bold opacity-0 peer-checked:opacity-100">✓</span>
                        </label>
                      </div>
                      
                      <span className="w-6 text-[#8B7355] font-black text-lg">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        className={`flex-1 px-4 py-3 border-2 rounded-xl text-[#4A4A4A] font-bold focus:outline-none transition-all ${
                          option.is_correct 
                            ? 'border-[#A5D6A7] bg-[#E8F5E9] focus:border-[#2E7D32]' 
                            : 'border-[#FFE0B2] bg-white focus:border-[#FF7A00]'
                        }`}
                        placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-[#8B7355] mt-3 bg-[#FFF5E5] p-2 rounded-lg inline-block border border-[#FFE0B2]">
                  💡 Klik lingkaran untuk menandai jawaban yang benar
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuiz(false);
                    setError('');
                  }}
                  className="flex-1 py-3 border-2 border-[#FFE0B2] rounded-xl text-[#8B7355] font-black hover:bg-[#FFF5E5] hover:text-[#D94D2B] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FF7A00] text-white rounded-xl font-black hover:bg-[#E66E00] disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-[#CC6200] active:border-b-0 active:translate-y-1"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}