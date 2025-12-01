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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-bounce-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-800">Quiz Time!</h3>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            @ {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
          <p className="text-lg text-gray-800 font-medium">{quiz.question_text}</p>
        </div>

        {/* Options or Result */}
        {!result ? (
          <>
            <div className="space-y-3 mb-6">
              {quiz.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                        selectedOption === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option.option_text}</span>
                    {selectedOption === option.id && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Lewati
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                className={`flex-1 py-3 rounded-xl font-medium transition ${
                  selectedOption && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Memeriksa...
                  </span>
                ) : (
                  'Jawab!'
                )}
              </button>
            </div>
          </>
        ) : (
          /* Result */
          <div className="text-center py-8">
            {result.isCorrect ? (
              <>
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h4 className="text-2xl font-bold text-green-600 mb-2">Benar! Hebat!</h4>
                <p className="text-gray-600">Kamu pintar sekali! 🌟</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  <span>⭐</span>
                  <span className="font-bold">+10 Poin</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-7xl mb-4">🤔</div>
                <h4 className="text-2xl font-bold text-orange-600 mb-2">Hampir Benar!</h4>
                <p className="text-gray-600">Jangan menyerah, terus belajar ya! 💪</p>
              </>
            )}
          </div>
        )}
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
