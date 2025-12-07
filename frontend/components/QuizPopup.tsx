'use client';

import { useState, useEffect } from 'react';
import { Quiz, quizzesService } from '@/lib/quizzes';
import { Button } from './ui';
import api from '@/lib/api';

interface QuizPopupProps {
  quiz: Quiz;
  onSubmit: (selectedOptionId: number) => Promise<any>;
  onClose: () => void;
  profileId?: number;
}

export default function QuizPopup({ quiz, onSubmit, onClose, profileId }: QuizPopupProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [answerResult, setAnswerResult] = useState<null | boolean>(null);
  const [attempts, setAttempts] = useState(0);
  // attempts shown in this popup session (reset on rewind / reopen) — counts attempts made here
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const maxAttempts = 3;
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [hintLoading, setHintLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOption) {
      setErrorMsg('Pilih jawaban terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await onSubmit(selectedOption);

      // Backend returns helpful fields: is_correct, previously_correct, current_attempts, max_attempts, ever_answered_correctly
      const isCorrect = !!res?.is_correct;
      const previouslyCorrect = !!res?.previously_correct;
      const everAnswered = !!res?.ever_answered_correctly;
      const currentAttempts = typeof res?.current_attempts === 'number' ? res.current_attempts : attempts + 1;

      // Clear previous messages
      setErrorMsg('');
      setInfoMsg('');

      // If profile already answered this quiz correctly before (ever), show an informational note
      if (previouslyCorrect || everAnswered) {
        setInfoMsg('Kuis ini sudah pernah dijawab sebelumnya — kamu tidak akan mendapat poin lagi. Kamu masih bisa menjawab untuk latihan.');
      }


      // Update internal counters
      setAttempts(currentAttempts);
      if (!isCorrect) {
        setSessionAttempts((s) => s + 1);
        setAnswerResult(false);
      } else {
        setAnswerResult(true);
      }

      if (isCorrect) {
        // show a short success then close
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      // If session attempts reached limit and still incorrect, request reveal
      if (!isCorrect && sessionAttempts + 1 >= maxAttempts) {
        // ask backend to reveal correct option
        try {
          setHintLoading(true);
          const revealRes = await api.get(`/quizzes/${quiz.id}/hint?reveal=1`);
          if (revealRes?.data?.optionId) {
            // highlight correct option
            setEliminated([]);
            setAnswerResult(true);
            // optionally auto-close after short delay
            setTimeout(() => onClose(), 1200);
          }
        } catch (err) {
          console.warn('Hint reveal failed', err);
        } finally {
          setHintLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);

      // If backend rejects because quiz already answered (409), treat as INFO: show message and reveal correct option locally
      const status = error?.response?.status;
      const errorBody = error?.response?.data;
      const errorMessage = errorBody?.message || error.message || 'Gagal mengirim jawaban';

      if (status === 409 && typeof errorMessage === 'string' && errorMessage.includes('sudah pernah dijawab')) {
        // Show informational message instead of fatal error
        setInfoMsg('Kuis ini sudah pernah dijawab sebelumnya — kamu tidak akan mendapat poin lagi. Menampilkan jawaban yang benar.');

        // fetch reveal from backend to show correct option in UI
        try {
          setHintLoading(true);
          const revealRes = await api.get(`/quizzes/${quiz.id}/hint?reveal=1`);
          const correctId = revealRes?.data?.optionId;
          if (correctId) {
            // highlight correct option visually
            setEliminated([]);
            setSelectedOption(correctId);
            setAnswerResult(true);
          }
        } catch (err) {
          console.warn('Failed to reveal correct option after 409', err);
        } finally {
          setHintLoading(false);
        }
      } else if (typeof errorMessage === 'string' && errorMessage.includes('sudah pernah dijawab')) {
        setErrorMsg('Quiz ini sudah pernah dijawab');
      } else if (Array.isArray(errorMessage)) {
        setErrorMsg(errorMessage[0]);
      } else {
        setErrorMsg(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHint = async () => {
    if (hintLoading) return;
    try {
      setHintLoading(true);
      const res = await api.get(`/quizzes/${quiz.id}/hint`);
      const optionId = res?.data?.optionId;
      if (optionId) {
        setEliminated((e) => Array.from(new Set([...e, optionId])));
      }
    } catch (err: any) {
      console.warn('Failed to fetch hint', err);
      setErrorMsg('Gagal mengambil hint');
    } finally {
      setHintLoading(false);
    }
  };

  // Initialize attempts / info from backend about previous attempts
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        if (!profileId) return;

        // Use getAttempts to get reliable list of attempts, then compute summary for this quiz
        const allAttempts = await quizzesService.getAttempts(profileId);
        if (!mounted) return;
        const videoAttempts = allAttempts.filter((a: any) => a.quiz_id === quiz.id);
        const currentAttempts = videoAttempts.length || 0;
        const everAnswered = videoAttempts.some((a: any) => a.is_correct === true);

        // Debug: print attempts so we can see why everAnswered may be true
        // Open browser DevTools Console to inspect this output when popup appears.
        console.debug('[QuizPopup] init attempts for quiz', quiz.id, {
          profileId,
          allAttemptsCount: allAttempts.length,
          videoAttempts,
          currentAttempts,
          everAnswered,
        });

        setAttempts(currentAttempts);
        if (everAnswered) {
          // If ever answered correctly before, show info and don't reset session attempts
          setInfoMsg('Kuis ini sudah pernah dijawab sebelumnya — kamu tidak akan mendapat poin lagi. Kamu masih bisa menjawab untuk latihan.');
          setSessionAttempts(0);
        } else {
          // Learning mode: reset session attempts on popup open so user gets fresh 3 tries
          setInfoMsg('');
          setSessionAttempts(0);
        }
      } catch (err) {
        // ignore init errors
      }
    };
    init();
    return () => { mounted = false; };
  }, [quiz.id, profileId]);

  if (!quiz || !quiz.options || quiz.options.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border-4 border-[#FFE0B2]">
          <p className="text-[#8B7355] font-bold text-lg">❌ Quiz data tidak valid</p>
          <Button onClick={onClose} className="mt-4">Tutup</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl border-4 border-[#FFE0B2] animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF7A00] text-white p-2 rounded-lg shadow-md">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-2xl font-black text-[#4A4A4A]">Quiz Time!</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B7355] hover:text-[#D94D2B] transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Question */}
        <div className="bg-[#FFF5E5] p-6 rounded-2xl mb-6 border-2 border-[#FFE0B2]">
          <p className="text-lg font-bold text-[#4A4A4A] leading-relaxed">
            {quiz.question_text}
          </p>
        </div>

        {/* Error / Info Messages */}
        {errorMsg && (
          <div className="mb-4">
            <div className="mb-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-600 font-bold text-sm flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </p>
            </div>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4">
            <div className="mb-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-blue-700 font-bold text-sm flex items-center gap-2">💡 {infoMsg}</p>
            </div>
          </div>
        )}

        {answerResult === true && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-green-700 font-bold text-sm flex items-center gap-2">✅ Jawaban benar! Kamu bisa lanjut menonton.</p>
          </div>
        )}

        {answerResult === false && !errorMsg && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-yellow-700 font-bold text-sm flex items-center gap-2">❌ Jawaban salah. Coba lagi sampai benar.</p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {quiz.options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                // prevent selecting eliminated option
                if (eliminated.includes(option.id)) return;
                  setSelectedOption(option.id);
                  setAnswerResult(null);
                setErrorMsg(''); // Clear error when selecting
              }}
              disabled={isSubmitting || eliminated.includes(option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 font-bold text-left
                ${selectedOption === option.id
                  ? 'bg-[#FF7A00] border-[#FF7A00] text-white shadow-lg scale-105'
                  : 'bg-white border-[#FFE0B2] text-[#4A4A4A] hover:border-[#FF7A00] hover:shadow-md'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${selectedOption === option.id
                    ? 'border-white bg-white'
                    : 'border-[#FFE0B2]'
                  }`}
                >
                  {selectedOption === option.id && (
                    <div className="w-3 h-3 rounded-full bg-[#FF7A00]"></div>
                  )}
                </div>
                <span className={`${eliminated.includes(option.id) ? 'line-through text-gray-400' : ''}`}>{option.option_text}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleHint}
            disabled={hintLoading}
            className="px-4 py-2 bg-white border border-[#FFE0B2] rounded-xl font-bold hover:bg-[#FFF5E5]"
          >
            {hintLoading ? 'Mengambil hint...' : 'Minta Hint'}
          </button>
          <div className="text-sm text-[#8B7355]">Percobaan: {attempts}/{maxAttempts}</div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white font-black py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Mengirim...
            </span>
          ) : (
            'Kirim Jawaban'
          )}
        </Button>
      </div>
    </div>
  );
}