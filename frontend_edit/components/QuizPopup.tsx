'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/quizzes';
import { Button } from './ui';

interface QuizPopupProps {
  quiz: Quiz;
  onSubmit: (selectedOptionId: number) => Promise<void>;
  onClose: () => void;
}

export default function QuizPopup({ quiz, onSubmit, onClose }: QuizPopupProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!selectedOption) {
      setErrorMsg('Pilih jawaban terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSubmit(selectedOption);
      // Success - popup will close automatically
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      
      // Parse error message
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengirim jawaban';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('sudah pernah dijawab')) {
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

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-600 font-bold text-sm flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {quiz.options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id);
                setErrorMsg(''); // Clear error when selecting
              }}
              disabled={isSubmitting}
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
                <span>{option.option_text}</span>
              </div>
            </button>
          ))}
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