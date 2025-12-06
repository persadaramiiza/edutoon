'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/quizzes';
import { X } from 'lucide-react';

interface QuizPopupProps {
  quiz: Quiz;
  profileId: number;
  onComplete: (isCorrect: boolean) => void;
  onClose: () => void;
  onSubmitAnswer?: (optionId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function QuizPopup({ 
  quiz, 
  profileId, 
  onComplete, 
  onClose,
  onSubmitAnswer,
  isLoading = false 
}: QuizPopupProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async () => {
    if (!selectedOption) {
      setErrorMsg('Pilih jawaban terlebih dahulu');
      return;
    }

    const finalIsSubmitting = isSubmitting || isLoading;
    if (finalIsSubmitting) {
      console.warn('Already submitting');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      console.log('🎯 handleSubmit called with optionId:', selectedOption);
      
      // Gunakan callback dari parent
      if (onSubmitAnswer) {
        console.log('✅ Using parent onSubmitAnswer callback');
        await onSubmitAnswer(selectedOption);
        return;
      }

      console.error('❌ No onSubmitAnswer handler provided');
      setErrorMsg('Error: No handler provided');
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('❌ Error in handleSubmit:', error);
      setErrorMsg(error.response?.data?.message || 'Error submitting answer');
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !selectedOption || isSubmitting || isLoading;

  if (!quiz || !quiz.options || quiz.options.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-[#FFF9F0] rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border-8 border-[#FFE0B2] text-center">
          <p className="text-[#8B7355] font-bold text-lg">❌ Quiz data tidak valid</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-3 bg-[#FF7A00] text-white rounded-full font-black hover:bg-[#E66E00] transition"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-[#FFF9F0] rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl animate-bounce-in border-8 border-[#FFE0B2] relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF7A00]/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D94D2B]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF5E5] p-2 rounded-full border-2 border-[#FFE0B2]">
                <span className="text-3xl">🎯</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#4A4A4A]">Quiz Time!</h3>
                <p className="text-xs text-[#8B7355] font-bold">
                  ⏱ {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="text-[#8B7355] hover:text-[#FF7A00] text-2xl transition disabled:opacity-50"
              type="button"
            >
              <X size={28} />
            </button>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-[#FFF5E5] to-[#FFE0B2] rounded-2xl p-6 mb-8 border-2 border-[#FFE0B2] relative">
            <div className="absolute -top-3 -left-3 bg-[#FF7A00] text-white p-1.5 rounded-lg shadow-md transform -rotate-6">
              <span className="text-xl">❓</span>
            </div>
            <p className="text-xl text-[#4A4A4A] font-black text-center leading-relaxed">
              {quiz.question_text}
            </p>
          </div>

          {/* Options or Result */}
          {!result ? (
            <>
              <div className="space-y-3 mb-8">
                {quiz.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (!isSubmitting && !isLoading) {
                        setSelectedOption(option.id);
                        setErrorMsg('');
                      }
                    }}
                    disabled={isSubmitting || isLoading}
                    type="button"
                    className={`w-full p-4 rounded-2xl border-b-4 text-left transition-all transform hover:-translate-y-1 active:translate-y-0 group ${
                      selectedOption === option.id
                        ? 'border-[#CC6200] bg-[#FF7A00] text-white shadow-lg'
                        : 'border-[#FFE0B2] bg-white hover:border-[#CC6200] hover:bg-[#FF7A00] hover:text-white text-[#4A4A4A] shadow-sm'
                    } ${isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-2 transition-colors ${
                          selectedOption === option.id
                            ? 'bg-white text-[#FF7A00] border-white'
                            : 'bg-[#FFF9F0] text-[#8B7355] border-[#FFE0B2] group-hover:bg-white group-hover:text-[#FF7A00] group-hover:border-white'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 font-bold text-lg">{option.option_text}</span>
                      {selectedOption === option.id && (
                        <span className="text-white bg-white/20 rounded-full p-1">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-xl text-red-700 font-bold text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isSubmitting || isLoading}
                  type="button"
                  className="flex-1 py-4 rounded-2xl border-b-4 border-[#FFE0B2] bg-white text-[#8B7355] font-black hover:bg-[#FFF5E5] hover:text-[#FF7A00] transition disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isButtonDisabled}
                  type="button"
                  className={`flex-1 py-4 rounded-2xl font-black transition border-b-4 shadow-lg ${
                    isButtonDisabled
                      ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-[#D94D2B] border-[#A0351E] text-white hover:bg-[#BF360C] hover:-translate-y-1'
                  }`}
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Checking...
                    </span>
                  ) : (
                    'Answer!'
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Result */
            <div className="text-center py-8 animate-in zoom-in duration-300">
              {result.isCorrect ? (
                <>
                  <div className="text-8xl mb-6 animate-bounce drop-shadow-md">🎉</div>
                  <h4 className="text-3xl font-black text-[#4CAF50] mb-2">Correct! Awesome!</h4>
                  <p className="text-[#8B7355] font-bold text-lg">You are so smart! 🌟</p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] px-6 py-3 rounded-full border-2 border-[#4CAF50] shadow-lg transform rotate-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-black text-xl">+10 Points</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6 animate-pulse">🤔</div>
                  <h4 className="text-3xl font-black text-[#FF7A00] mb-2">Almost There!</h4>
                  <p className="text-[#8B7355] font-bold text-lg">Don't give up, keep learning! 💪</p>
                  <button 
                    onClick={onClose}
                    type="button"
                    className="mt-8 px-8 py-3 bg-[#FF7A00] text-white rounded-full font-black shadow-lg hover:bg-[#E66E00] transition-all"
                  >
                    Continue Watching
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}