'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video } from '@/lib/videos';
import { quizzesService, Quiz, CreateQuizDto } from '@/lib/quizzes';

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
        // Only one can be correct
        newOptions.forEach((opt, i) => {
          opt.is_correct = i === index;
        });
      } else {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/creator')}
              className="text-purple-200 hover:text-white transition"
            >
              ← Kembali
            </button>
            <div>
              <h1 className="text-xl font-bold">🎯 Kelola Quiz</h1>
              <p className="text-purple-200 text-sm">{video.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddQuiz(true)}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition"
          >
            + Tambah Quiz
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Video Preview */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Preview</h2>
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden max-w-2xl">
            {video.platform === 'youtube' && (
              <iframe
                src={`https://www.youtube.com/embed/${video.video_url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`}
                className="w-full h-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <p className="text-gray-500 text-sm mt-2">
            💡 Tips: Perhatikan timestamp video untuk menentukan kapan quiz muncul
          </p>
        </div>

        {/* Quiz List */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Quiz ({quizzes.length})
            </h2>
          </div>

          {quizzes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 mb-4">Belum ada quiz untuk video ini</p>
              <button
                onClick={() => setShowAddQuiz(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Tambah Quiz Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {quizzes.map((quiz, index) => (
                <div key={quiz.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">
                          Quiz #{index + 1}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                          ⏱ {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-3">{quiz.question_text}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {quiz.options.map((option, optIndex) => (
                          <div
                            key={option.id}
                            className={`p-2 rounded text-sm ${
                              option.is_correct
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>{' '}
                            {option.option_text}
                            {option.is_correct && <span className="ml-2">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      🗑️
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tambah Quiz Baru</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddQuiz} className="space-y-4">
              {/* Timestamp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Muncul (timestamp)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={timestampMinutes}
                    onChange={(e) => setTimestampMinutes(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <span className="text-gray-600">menit</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timestampSeconds}
                    onChange={(e) => setTimestampSeconds(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <span className="text-gray-600">detik</span>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pertanyaan *
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={2}
                  placeholder="Contoh: Apa ibukota Indonesia?"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilihan Jawaban * (minimal 2)
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.is_correct}
                        onChange={() => handleOptionChange(index, 'is_correct', true)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="w-6 text-gray-500 font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg text-gray-900 ${
                          option.is_correct ? 'border-green-500 bg-green-50' : 'border-gray-300'
                        }`}
                        placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Pilih radio button untuk menandai jawaban yang benar
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddQuiz(false);
                    setError('');
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
