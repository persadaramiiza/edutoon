'use client';

import { useState } from 'react';
import { Quiz, quizzesService } from '@/lib/quizzes';

interface QuizPopupProps {
  quiz: Quiz;
  profileId: number;
  onComplete: (isCorrect: boolean) => void;
  onClose: () => void;
}

export default function QuizPopup({ quiz, profileId, onComplete, onClose }: QuizPopupProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean } | null>(null);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting quiz:', { quizId: quiz.id, profileId, selectedOptionId: selectedOption });
      const attempt = await quizzesService.submitAnswer({
        quizId: quiz.id,
        profileId,
        selectedOptionId: selectedOption,
      });

      setResult({ isCorrect: attempt.is_correct });

      // Auto close after showing result
      setTimeout(() => {
        onComplete(attempt.is_correct);
      }, 2500);
    } catch (error: unknown) {
      console.error('Error submitting quiz:', error);
      // Check if it's axios error with response data
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Unknown error';
      console.error('Error message:', errorMessage);
      
      // If already answered, show that result
      if (errorMessage.includes('sudah pernah dijawab')) {
        alert('Quiz ini sudah pernah dijawab!');
      } else {
        alert(`Error: ${errorMessage}`);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <p className="text-[#8B7355] text-xs font-bold uppercase tracking-wider">Let's Play</p>
                </div>
            </div>
            <span className="text-sm font-bold text-[#8B7355] bg-[#FFF5E5] px-3 py-1.5 rounded-full border border-[#FFE0B2]">
                @ {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
            </span>
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl p-6 mb-6 border-4 border-[#FFE0B2] shadow-sm relative">
                <div className="absolute -top-3 -left-3 bg-[#FF7A00] text-white p-1.5 rounded-lg shadow-md transform -rotate-6">
                    <span className="text-xl">❓</span>
                </div>
                <p className="text-xl text-[#4A4A4A] font-black text-center leading-relaxed">{quiz.question_text}</p>
            </div>

            {/* Options or Result */}
            {!result ? (
            <>
                <div className="space-y-3 mb-8">
                {quiz.options.map((option, index) => (
                    <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-2xl border-b-4 text-left transition-all transform hover:-translate-y-1 active:translate-y-0 group ${
                        selectedOption === option.id
                        ? 'border-[#CC6200] bg-[#FF7A00] text-white shadow-lg'
                        : 'border-[#FFE0B2] bg-white hover:border-[#CC6200] hover:bg-[#FF7A00] hover:text-white text-[#4A4A4A] shadow-sm'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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

                {/* Actions */}
                <div className="flex gap-4">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-4 rounded-2xl border-b-4 border-[#FFE0B2] bg-white text-[#8B7355] font-black hover:bg-[#FFF5E5] hover:text-[#FF7A00] transition disabled:opacity-50"
                >
                    Skip
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption || isSubmitting}
                    className={`flex-1 py-4 rounded-2xl font-black transition border-b-4 shadow-lg ${
                    selectedOption && !isSubmitting
                        ? 'bg-[#D94D2B] border-[#A0351E] text-white hover:bg-[#BF360C] hover:-translate-y-1'
                        : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isSubmitting ? (
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
