"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, Maximize, ArrowLeft, CheckCircle, XCircle, Star, Trophy } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock Quiz Data
const QUIZ_DATA = {
  timestamp: 5, // Show quiz at 5 seconds for demo
  question: "How many planets are in our solar system?",
  options: [
    { id: "a", text: "7 Planets" },
    { id: "b", text: "8 Planets" },
    { id: "c", text: "9 Planets" },
  ],
  correctId: "b",
}

export default function WatchPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Handle Video Progress
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const current = video.currentTime
      const duration = video.duration || 1
      setProgress((current / duration) * 100)

      // Trigger Quiz
      if (!quizCompleted && Math.abs(current - QUIZ_DATA.timestamp) < 0.5) {
        video.pause()
        setIsPlaying(false)
        setShowQuiz(true)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    return () => video.removeEventListener("timeupdate", handleTimeUpdate)
  }, [quizCompleted])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAnswer = (id: string) => {
    setSelectedAnswer(id)
    const correct = id === QUIZ_DATA.correctId
    setIsCorrect(correct)

    if (correct) {
      setTimeout(() => {
        setShowQuiz(false)
        setQuizCompleted(true)
        if (videoRef.current) {
          videoRef.current.play()
          setIsPlaying(true)
        }
      }, 2000)
    }
  }

  return (
    <div className="h-screen bg-black flex flex-col font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/browse">
          <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full px-6 h-12 text-lg font-bold">
            <ArrowLeft className="mr-2 h-6 w-6" />
            Back
          </Button>
        </Link>
      </div>

      {/* Video Player Container */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full max-h-screen object-contain"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
          poster="/placeholder.svg?key=p4uj3"
          onClick={togglePlay}
        />

        {/* Quiz Overlay */}
        {showQuiz && (
          <div className="absolute inset-0 z-30 bg-brand-olive/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#FFF9F0] rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border-[12px] border-white relative overflow-hidden ring-8 ring-brand-orange/30">
              {/* Decorative background blobs inside card */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-yellow/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl animate-pulse delay-700" />

              <div className="relative z-10">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-brand-yellow text-white font-black text-lg mb-8 shadow-lg transform -rotate-2 border-4 border-white">
                    <Star className="h-6 w-6 fill-current animate-spin-slow" />
                    INTERACTIVE QUIZ
                    <Star className="h-6 w-6 fill-current animate-spin-slow" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-brand-olive font-nunito leading-tight drop-shadow-sm">
                    {QUIZ_DATA.question}
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-1 max-w-2xl mx-auto">
                  {QUIZ_DATA.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "p-6 rounded-3xl border-b-8 text-left transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-2",
                        selectedAnswer === null
                          ? "border-brand-cream bg-white hover:border-brand-orange hover:bg-brand-cream/30 shadow-sm"
                          : selectedAnswer === option.id
                            ? isCorrect
                              ? "border-green-600 bg-green-100 shadow-lg"
                              : "border-brand-red bg-red-100 shadow-lg"
                            : "border-gray-200 bg-gray-50 opacity-50 grayscale",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-3xl font-black transition-colors",
                            selectedAnswer === option.id
                              ? isCorrect
                                ? "text-green-700"
                                : "text-brand-red"
                              : "text-brand-olive group-hover:text-brand-orange",
                          )}
                        >
                          {option.text}
                        </span>
                        {selectedAnswer === option.id && (
                          <div className="animate-in zoom-in duration-300 bg-white rounded-full p-2 shadow-md">
                            {isCorrect ? (
                              <CheckCircle className="h-10 w-10 text-green-500 fill-green-100" />
                            ) : (
                              <XCircle className="h-10 w-10 text-brand-red fill-red-100" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAnswer && !isCorrect && (
                  <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="inline-block bg-brand-red text-white px-8 py-4 rounded-2xl font-black text-2xl mb-6 shadow-xl transform rotate-1 border-4 border-white">
                      Oops! Try again 😅
                    </div>
                    <br />
                    <Button
                      onClick={() => {
                        setSelectedAnswer(null)
                        setIsCorrect(null)
                      }}
                      variant="outline"
                      className="border-4 border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-black text-xl h-16 px-10 rounded-2xl bg-white"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {isCorrect && (
                  <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="inline-flex items-center gap-3 bg-green-500 text-white px-10 py-5 rounded-3xl font-black text-3xl shadow-xl transform -rotate-1 mb-4 border-4 border-white">
                      <Trophy className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-bounce" />
                      Great! Your answer is correct! 🎉
                    </div>
                    <p className="text-brand-olive/60 font-bold text-xl">Video will continue shortly...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Controls */}
        {!showQuiz && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            {/* Progress Bar */}
            <div className="w-full h-4 bg-white/20 rounded-full mb-6 cursor-pointer overflow-hidden group">
              <div
                className="h-full bg-brand-orange relative rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform border-4 border-brand-orange" />
              </div>
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                <button
                  onClick={togglePlay}
                  className="hover:text-brand-orange transition-colors transform hover:scale-110 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10 fill-current" />
                  ) : (
                    <Play className="h-10 w-10 fill-current" />
                  )}
                </button>
                <div className="flex items-center gap-3 group">
                  <Volume2 className="h-8 w-8" />
                  <div className="w-0 group-hover:w-32 transition-all overflow-hidden duration-300">
                    <div className="h-2 bg-white/30 rounded-full w-28 ml-2 cursor-pointer">
                      <div className="h-full w-3/4 bg-brand-yellow rounded-full" />
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono bg-white/10 px-3 py-1 rounded-lg">02:15 / 12:30</span>
              </div>
              <button className="hover:text-brand-orange transition-colors transform hover:scale-110">
                <Maximize className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
