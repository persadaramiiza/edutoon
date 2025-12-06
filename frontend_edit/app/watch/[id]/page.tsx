'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video, VideoProgress } from '@/lib/videos';
import { quizzesService, Quiz } from '@/lib/quizzes';
import QuizPopup from '@/components/QuizPopup';
import api from '@/lib/api';
import { ArrowLeft, Eye, Star, CheckCircle2, AlertCircle, PlayCircle, Clock, Brain } from "lucide-react";
import { Button } from "@/components/ui";

interface SubmitQuizDto {
  quizId: number;
  profileId: number;
  selectedOptionId: number;
}

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<number>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ytApiLoadedRef = useRef(false);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoId = Number(params?.id);
  const profileId = Number(searchParams?.get('profile')) || 0;

  // ==================== LOAD VIDEO ====================
  const loadVideo = useCallback(async () => {
    try {
      setLoadingVideo(true);
      setError(null);
      
      if (!videoId) {
        console.error('❌ Video ID is missing');
        setError('Video ID tidak valid');
        return;
      }

      console.log('📥 Loading video:', videoId);
      const data = await videosService.getById(videoId);
      console.log('✅ Video loaded:', data.title);
      setVideo(data);

      // Increment view count
      console.log('👁 Incrementing view count');
      await videosService.incrementView(videoId);

      // Load previous progress
      if (profileId > 0) {
        console.log('📊 Loading video progress');
        const progress = await videosService.getProgress(videoId, profileId);
        if (progress) {
          setVideoProgress(progress);
          console.log(`⏱️ Previous progress: ${progress.timestamp_seconds}s`);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading video:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load video';
      setError(errorMsg);
    } finally {
      setLoadingVideo(false);
    }
  }, [videoId, profileId]);

  // ==================== LOAD QUIZZES ====================
  const loadQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      
      if (!videoId) {
        console.warn('⚠️ Video ID is missing, skipping quiz load');
        setQuizzes([]);
        return;
      }

      console.log('📥 Loading quizzes for video:', videoId);
      const data = await quizzesService.getByVideoId(videoId);
      console.log('✅ Loaded', data.length, 'quizzes');
      setQuizzes(data);
    } catch (err: any) {
      console.error('❌ Error loading quizzes:', err);
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [videoId]);

  // ==================== SAVE PROGRESS ====================
  const saveProgress = useCallback(
    async (currentTime: number, isCompleted: boolean = false) => {
      if (!profileId || !user || !videoId) return;

      try {
        console.log('💾 Saving progress:', { videoId, profileId, currentTime, isCompleted });
        await videosService.saveProgress(videoId, {
          profileId,
          timestampSeconds: Math.floor(currentTime),
          isCompleted,
        });
        console.log('✅ Progress saved');
      } catch (error: any) {
        console.warn('⚠️ Failed to save progress (non-critical):', error.message);
      }
    },
    [profileId, videoId, user]
  );

  // ==================== SUBMIT QUIZ ANSWER ====================
  const handleSubmitQuizAnswer = useCallback(
    async (optionId: number) => {
      console.log('🎯 handleSubmitQuizAnswer called with optionId:', optionId);

      if (!currentQuiz) {
        console.error('❌ No current quiz');
        return;
      }

      if (isSubmittingQuiz) {
        console.warn('⚠️ Already submitting');
        return;
      }

      if (!profileId || !user) {
        console.error('❌ Missing profile or user');
        setError('Profile atau user tidak lengkap');
        return;
      }

      setIsSubmittingQuiz(true);

      try {
        const dto: SubmitQuizDto = {
          quizId: currentQuiz.id,
          profileId,
          selectedOptionId: optionId,
        };

        console.log('📤 Submitting quiz:', dto);
        console.log('🌐 Calling POST /quiz/submit');
        
        const response = await api.post('/quiz/submit', dto);
        const result = response.data;

        console.log('✅ API Response:', result);
        
        // Handle both formats dari API
        const isCorrect = result.is_correct === true || result.isCorrect === true;
        
        if (isCorrect) {
          setCorrectCount((prev) => prev + 1);
          console.log('🎉 Correct! Points:', result.points_earned || 10);
        } else {
          console.log('❌ Incorrect');
        }
        
        handleQuizComplete(isCorrect);
      } catch (error: any) {
        console.error('❌ Error submitting quiz:', error);
        
        const errorMsg = error.response?.data?.message || error.message || 'Gagal submit jawaban';
        console.error('Error details:', errorMsg);

        // Check for specific errors
        if (
          errorMsg.includes('sudah pernah dijawab') || 
          errorMsg.includes('already attempted') ||
          errorMsg.includes('already answered')
        ) {
          console.warn('⚠️ Quiz already answered');
          handleQuizComplete(false);
          return;
        }

        if (errorMsg.includes('tidak ditemukan') || errorMsg.includes('not found')) {
          setError('Quiz atau profile tidak ditemukan');
          handleQuizComplete(false);
          return;
        }

        setError(errorMsg);
        setIsSubmittingQuiz(false);
      }
    },
    [currentQuiz, profileId, user, isSubmittingQuiz]
  );

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('⚠️ Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // ==================== LOAD VIDEO & QUIZZES ====================
  useEffect(() => {
    if (videoId && user) {
      console.log('📥 Loading data for videoId:', videoId);
      loadVideo();
      loadQuizzes();
    }
  }, [videoId, user, loadVideo, loadQuizzes]);

  // ==================== AUTO SAVE PROGRESS ====================
  useEffect(() => {
    if (!playerRef.current || !profileId) return;

    progressSaveIntervalRef.current = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime?.();
      if (currentTime) {
        saveProgress(currentTime, false);
      }
    }, 30000); // Save every 30 seconds

    return () => {
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [profileId, saveProgress]);

  // ==================== ON VIDEO END ====================
  const handleVideoEnd = useCallback(() => {
    console.log('✅ Video ended');
    if (profileId > 0 && video) {
      saveProgress(video.description?.length || 0, true);
    }
  }, [profileId, video, saveProgress]);

  // ==================== GET YOUTUBE VIDEO ID ====================
  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  // ==================== INITIALIZE YOUTUBE PLAYER ====================
  useEffect(() => {
    if (!video || video.platform !== 'youtube' || quizzes.length === 0) return;

    const ytId = getYouTubeVideoId(video.video_url);
    if (!ytId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          start: videoProgress?.timestamp_seconds || 0,
        },
        events: {
          onReady: (event: any) => {
            // Resume from previous progress
            if (videoProgress?.timestamp_seconds > 0) {
              event.target.seekTo(videoProgress.timestamp_seconds);
              console.log(`⏱️ Resumed from ${videoProgress.timestamp_seconds}s`);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              // Playing
              startQuizCheck();
            } else if (event.data === 0) {
              // Ended
              handleVideoEnd();
              stopQuizCheck();
            } else {
              // Paused or other
              stopQuizCheck();
            }
          },
        },
      });
    };

    if (!ytApiLoadedRef.current && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        ytApiLoadedRef.current = true;
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      stopQuizCheck();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video, quizzes, getYouTubeVideoId, videoProgress, handleVideoEnd]);

  // ==================== QUIZ CHECK LOGIC ====================
  const startQuizCheck = () => {
    if (checkIntervalRef.current) return;

    checkIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;

      const currentTime = Math.floor(playerRef.current.getCurrentTime());

      const quizToShow = quizzes.find(
        (q) => q.timestamp_seconds === currentTime && !completedQuizIds.has(q.id)
      );

      if (quizToShow && profileId > 0) {
        console.log('🎯 Quiz triggered at', currentTime, 'seconds');
        playerRef.current.pauseVideo();
        setCurrentQuiz(quizToShow);
        stopQuizCheck();
      }
    }, 500);
  };

  const stopQuizCheck = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  const handleQuizComplete = (isCorrect: boolean) => {
    if (currentQuiz) {
      setCompletedQuizIds((prev) => new Set([...prev, currentQuiz.id]));
    }
    setCurrentQuiz(null);
    setIsSubmittingQuiz(false);
    
    setTimeout(() => {
      playerRef.current?.playVideo();
      startQuizCheck();
    }, 1500);
  };

  const handleQuizClose = () => {
    if (currentQuiz) {
      setCompletedQuizIds((prev) => new Set([...prev, currentQuiz.id]));
    }
    setCurrentQuiz(null);
    setIsSubmittingQuiz(false);
    
    playerRef.current?.playVideo();
    startQuizCheck();
  };

  const triggerTestQuiz = () => {
    const uncompletedQuiz = quizzes.find((q) => !completedQuizIds.has(q.id));
    if (uncompletedQuiz) {
      playerRef.current?.pauseVideo();
      setCurrentQuiz(uncompletedQuiz);
    }
  };

  const getVimeoEmbedUrl = (url: string): string | null => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    return null;
  };

  // ==================== LOADING STATES ====================
  if (authLoading || loadingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🎓</div>
          <div className="animate-bounce text-2xl font-black text-[#FF7A00]" style={{ animationDelay: '0.1s' }}>
            Loading Adventure...
          </div>
        </div>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="text-center">
          <div className="text-8xl mb-6">⚠️</div>
          <h2 className="text-3xl font-black text-[#4A4A4A] mb-2">Error</h2>
          <p className="text-[#8B7355] mb-6 font-bold max-w-md">{error}</p>
          <Button onClick={() => router.back()} className="bg-[#FF7A00] text-white font-black">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">😕</div>
          <h2 className="text-3xl font-black text-[#4A4A4A] mb-2">Video Not Found</h2>
          <p className="text-[#8B7355] font-bold mb-6">Oops! Video tidak ditemukan.</p>
          <Button
            onClick={() => router.back()}
            className="bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-full px-8 py-6 text-lg font-black shadow-lg"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isYouTube = video.platform === 'youtube';
  const vimeoUrl = video.platform === 'vimeo' ? getVimeoEmbedUrl(video.video_url) : null;

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]">
      {/* Quiz Popup */}
      {currentQuiz && profileId > 0 && (
        <QuizPopup
          quiz={currentQuiz}
          profileId={profileId}
          onComplete={handleQuizComplete}
          onClose={handleQuizClose}
          onSubmitAnswer={handleSubmitQuizAnswer}
          isLoading={isSubmittingQuiz}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[#8B7355] hover:text-[#FF7A00] hover:bg-[#FFF5E5] rounded-full font-bold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            <h1 className="text-lg md:text-xl font-black text-[#4A4A4A] truncate max-w-[200px] md:max-w-md">
              {video.title}
            </h1>
          </div>
          
          {quizzes.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#FFF5E5] rounded-full border border-[#FFE0B2]">
                <Brain className="h-4 w-4 text-[#FF7A00]" />
                <span className="text-[#8B7355] font-bold text-sm">
                  Quiz: {completedQuizIds.size}/{quizzes.length}
                </span>
              </div>
              {correctCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-[#4A4A4A] rounded-full border-2 border-[#FF7A00] shadow-sm">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-black text-sm">{correctCount * 10} Poin</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Video Player */}
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="relative bg-black rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[6px] md:border-[8px] border-[#FFE0B2]">
          {isYouTube && quizzes.length > 0 ? (
            <div className="aspect-video">
              <div id="youtube-player" className="w-full h-full" />
            </div>
          ) : isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.video_url)}?start=${videoProgress?.timestamp_seconds || 0}`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : vimeoUrl ? (
            <iframe
              src={vimeoUrl}
              className="w-full aspect-video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : video.platform === 'native' ? (
            <video
              src={video.video_url}
              controls
              className="w-full aspect-video"
              onEnded={handleVideoEnd}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-[#FFF5E5] text-[#8B7355]">
              <div className="text-center p-6">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[#FF7A00]" />
                <p className="mb-4 font-bold text-lg">Video tidak bisa diputar</p>
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-[#FF7A00] text-white rounded-full font-black hover:bg-[#E66E00] transition-colors shadow-lg"
                >
                  Buka di Tab Baru <PlayCircle className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-8 bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border-4 border-white ring-4 ring-[#FF7A00]/10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-black text-[#4A4A4A] mb-3">{video.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                <div className="flex items-center gap-1.5 text-[#8B7355] bg-[#FFF9F0] px-3 py-1.5 rounded-full border border-[#FFE0B2]">
                  <Eye className="h-4 w-4" />
                  <span>{video.view_count || 0} views</span>
                </div>
                {video.category && (
                  <span className="bg-[#FF7A00]/10 text-[#FF7A00] px-3 py-1.5 rounded-full border border-[#FF7A00]/20">
                    {video.category}
                  </span>
                )}
                <span className="bg-[#D94D2B]/10 text-[#D94D2B] px-3 py-1.5 rounded-full border border-[#D94D2B]/20">
                  Usia {video.min_age}-{video.max_age || 18}+
                </span>
              </div>
            </div>
            
            {video.creator && (
              <div className="flex items-center gap-3 bg-[#FFF5E5] p-3 rounded-2xl border border-[#FFE0B2]">
                <div className="h-10 w-10 rounded-full bg-[#FF7A00] flex items-center justify-center text-white font-black">
                  {video.creator.full_name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <p className="text-xs text-[#8B7355] font-bold uppercase">Creator</p>
                  <p className="text-[#4A4A4A] font-black">{video.creator.full_name}</p>
                </div>
              </div>
            )}
          </div>
          
          {video.description && (
            <div className="bg-[#FFF9F0] p-6 rounded-2xl border border-[#FFE0B2] mb-8">
              <p className="text-[#8B7355] leading-relaxed font-medium">{video.description}</p>
            </div>
          )}

          {/* Quiz Section */}
          {!loadingQuizzes && quizzes.length > 0 && (
            <div className="mt-8 pt-8 border-t-4 border-[#FFE0B2] border-dashed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-black text-[#4A4A4A] flex items-center gap-3 mb-2">
                    <Brain className="h-8 w-8 text-[#FF7A00]" />
                    Interactive Quizzes
                    <span className="bg-[#FF7A00] text-white text-xs px-2 py-1 rounded-full">
                      {quizzes.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quizzes.map((q) => (
                      <div key={q.id} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${
                        completedQuizIds.has(q.id) 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {Math.floor(q.timestamp_seconds / 60)}:{String(q.timestamp_seconds % 60).padStart(2, '0')}
                        {completedQuizIds.has(q.id) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                      </div>
                    ))}
                  </div>
                </div>
                
                {profileId > 0 && quizzes.length > completedQuizIds.size && (
                  <Button
                    onClick={triggerTestQuiz}
                    disabled={isSubmittingQuiz}
                    className="bg-[#D94D2B] text-white hover:bg-[#BF360C] rounded-xl font-black disabled:opacity-50"
                  >
                    🎯 Test Quiz
                  </Button>
                )}
              </div>

              <div className="h-4 bg-[#FFF5E5] rounded-full overflow-hidden border border-[#FFE0B2] mb-6">
                <div
                  className="h-full bg-gradient-to-r from-[#FF7A00] to-[#D94D2B] transition-all duration-500"
                  style={{ width: `${quizzes.length > 0 ? (completedQuizIds.size / quizzes.length) * 100 : 0}%` }}
                />
              </div>

              {completedQuizIds.size === quizzes.length && quizzes.length > 0 && (
                <div className="bg-[#E8F5E9] border-2 border-[#4CAF50] rounded-2xl p-6 text-center animate-in zoom-in">
                  <div className="text-4xl mb-2">🎉</div>
                  <h4 className="text-[#2E7D32] font-black text-xl mb-1">
                    Awesome! All quizzes completed!
                  </h4>
                  <p className="text-[#43A047] font-bold">
                    You got {correctCount} out of {quizzes.length} correct! 🌟
                  </p>
                </div>
              )}
            </div>
          )}

          {loadingQuizzes && (
            <div className="mt-8 text-center">
              <div className="animate-bounce text-lg font-black text-[#FF7A00]">Loading quizzes...</div>
            </div>
          )}

          {!loadingQuizzes && quizzes.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-[#8B7355] font-bold text-lg">📺 Video ini belum memiliki quiz</p>
            </div>
          )}

          {!loadingQuizzes && quizzes.length > 0 && profileId === 0 && (
            <div className="mt-6 bg-[#FFF8E1] border-2 border-[#FFC107] rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-[#FF8F00] shrink-0 mt-0.5" />
              <div>
                <p className="text-[#FF8F00] font-bold mb-2">
                  Pilih profil anak untuk mengerjakan quiz!
                </p>
                <p className="text-sm text-[#FF8F00]/80">Kembali ke dashboard untuk memilih profil</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}