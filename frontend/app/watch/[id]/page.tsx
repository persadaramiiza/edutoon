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
import dynamic from 'next/dynamic';

interface SubmitQuizDto {
  quizId: number;
  profileId: number;
  selectedOptionId: number;
}

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number): void;
  destroy(): void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function WatchPage() {
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
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // ✅ NEW

  const playerRef = useRef<YouTubePlayer | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ytApiLoadedRef = useRef(false);
  const playerInitializedRef = useRef(false);

  const videoId = Number(params?.id);
  const profileId = user?.role === 'creator' || user?.role === 'admin' 
    ? 0 
    : Number(searchParams?.get('profile')) || 0;

  // ✅ FIX: Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ==================== GET YOUTUBE VIDEO ID ====================
  const getYouTubeVideoId = useCallback((url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log('✅ Extracted YouTube ID:', match[1]);
        return match[1];
      }
    }

    console.warn('⚠️ Could not extract YouTube ID from:', url);
    return null;
  }, []);

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
      
      // Fetch video and progress in parallel
      const [videoData, progressData] = await Promise.all([
        videosService.getById(videoId),
        profileId > 0 ? videosService.getProgress(videoId, profileId).catch(err => {
          console.warn('⚠️ Failed to load progress:', err);
          return null;
        }) : Promise.resolve(null)
      ]);

      console.log('✅ Video loaded:', videoData.title, 'Platform:', videoData.platform);
      
      if (progressData && progressData.last_position_seconds > 0) {
        setVideoProgress(progressData);
        console.log(`⏱️ Previous progress: ${progressData.last_position_seconds}s`);
      }

      // Set video AFTER progress is set to ensure player init sees the progress
      setVideo(videoData);

      videosService.incrementView(videoId).catch(err => {
        console.warn('⚠️ Failed to increment view:', err);
      });
    } catch (err: any) {
      console.error('❌ Error loading video:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load video');
    } finally {
      setLoadingVideo(false);
    }
  }, [videoId, profileId]);

  // ==================== LOAD QUIZZES ====================
  const loadQuizzes = useCallback(async () => {
    if (!videoId) return;
    
    try {
      setLoadingQuizzes(true);
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

  // ==================== LOAD COMPLETED QUIZZES ====================
  const loadCompletedQuizzes = useCallback(async () => {
    if (!profileId || profileId === 0 || !videoId) {
      console.log('ℹ️ Skip loading quiz attempts (creator or no profile)');
      return;
    }

    try {
      console.log('📥 Loading completed quizzes for profile:', profileId);
      const attempts = await quizzesService.getAttempts(profileId);
      
      const videoAttempts = attempts.filter(attempt => {
        const quiz = quizzes.find(q => q.id === attempt.quiz_id);
        return quiz && quiz.video_id === videoId;
      });

      // Only consider a quiz "completed" if the profile has a correct attempt for it.
      const correctAttemptIds = new Set(
        videoAttempts.filter((a) => a.is_correct).map((a) => a.quiz_id)
      );

      const correctAnswers = videoAttempts.filter((a) => a.is_correct).length;

      console.log('✅ Found', correctAttemptIds.size, 'correctly answered quizzes,', correctAnswers, 'correct attempts');
      setCompletedQuizIds(correctAttemptIds);
      setCorrectCount(correctAnswers);
    } catch (err) {
      console.error('❌ Error loading completed quizzes:', err);
    }
  }, [profileId, videoId, quizzes]);

  // ==================== SAVE PROGRESS ====================
  const saveProgress = useCallback(
    async (currentTime: number, isCompleted: boolean = false) => {
      if (!user || !videoId) return;

      try {
        await videosService.saveProgress(videoId, {
          profileId: profileId,
          timestampSeconds: Math.floor(currentTime),
          isCompleted,
        });
      } catch (error: any) {
        console.warn('⚠️ Failed to save progress:', error.message);
      }
    },
    [profileId, videoId, user]
  );

  // ==================== ON VIDEO END ====================
  const handleVideoEnd = useCallback(() => {
    console.log('✅ Video ended');
    if (video && playerRef.current) {
      try {
        const duration = playerRef.current.getDuration();
        saveProgress(duration, true);
      } catch (err) {
        console.warn('⚠️ Could not get video duration:', err);
      }
    }
  }, [video, saveProgress]);

  // ==================== QUIZ CHECK LOGIC & PROGRESS SAVER ====================
  const startQuizCheck = useCallback(() => {
    if (checkIntervalRef.current) return;
    
    // ✅ Skip quiz for creator
    const isCreator = user?.role === 'creator' || user?.role === 'admin';

    console.log('🎯 Starting quiz check & progress saver');
    checkIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;

      const currentTime = Math.floor(playerRef.current.getCurrentTime());
      
      // Save progress every 5 seconds
      if (currentTime % 5 === 0) {
        saveProgress(currentTime);
      }

      // If creator, skip quiz logic
      if (isCreator) return;

      if (quizzes.length === 0) return;

      // Find all quizzes that match this exact second
      const candidates = quizzes.filter((q) => q.timestamp_seconds === currentTime);
      if (candidates.length === 0) return;

      // Choose a quiz to show: prefer not-yet-attempted ones
      const notAttempted = candidates.filter((q) => !completedQuizIds.has(q.id));
      let chosen: Quiz | null = null;

      if (notAttempted.length > 0) {
        const idx = Math.floor(Math.random() * notAttempted.length);
        chosen = notAttempted[idx];
      } else {
        // all attempted — pick random among candidates
        const idx = Math.floor(Math.random() * candidates.length);
        chosen = candidates[idx];
      }

      if (chosen && profileId > 0) {
        console.log('🎯 Quiz triggered at', currentTime, 'seconds — selected quiz', chosen.id);
        playerRef.current.pauseVideo();

        // Sanitize options: remove is_correct before sending to UI
        const sanitized: Quiz = {
          ...chosen,
          options: chosen.options?.map((o) => ({
            id: o.id,
            option_text: o.option_text,
            is_correct: false, // hide correctness on client
            quizId: o.quizId,
          })) || [],
        };

        setCurrentQuiz(sanitized);
        stopQuizCheck();
      }
    }, 1000);
  }, [quizzes, completedQuizIds, profileId, user?.role, saveProgress]);

  const stopQuizCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // ==================== INITIALIZE YOUTUBE PLAYER ====================
  useEffect(() => {
    // ✅ FIX: Only run on client side
    if (!isMounted || !video || video.platform !== 'youtube' || playerInitializedRef.current) {
      return;
    }

    const ytId = getYouTubeVideoId(video.video_url);
    if (!ytId) {
      console.error("❌ Invalid YouTube URL:", video.video_url);
      setPlayerReady(true);
      return;
    }

    console.log('🎬 Initializing YouTube player for:', ytId);

    const initPlayer = () => {
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkAndInit = () => {
        const container = document.getElementById('youtube-player');
        
        if (!container) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`⏳ Waiting for container... (attempt ${attempts}/${maxAttempts})`);
            setTimeout(checkAndInit, 100);
          } else {
            console.error('❌ Container not found after max attempts');
            setPlayerReady(true);
          }
          return;
        }

        console.log('✅ Container found, creating player');
        playerInitializedRef.current = true;

        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (err) {
            console.warn('⚠️ Error destroying old player:', err);
          }
          playerRef.current = null;
        }

        try {
          playerRef.current = new window.YT.Player('youtube-player', {
            videoId: ytId,
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              fs: 1,
              playsinline: 1,
              start: videoProgress?.last_position_seconds || 0,
            },
            events: {
              onReady: (event: any) => {
                console.log('✅ YouTube player ready');
                setPlayerReady(true);
                
                if (videoProgress?.last_position_seconds && videoProgress.last_position_seconds > 0) {
                  setTimeout(() => {
                    event.target.seekTo(videoProgress.last_position_seconds);
                    console.log(`⏱️ Resumed from ${videoProgress.last_position_seconds}s`);
                  }, 500);
                }
              },
              onStateChange: (event: any) => {
                console.log('🎮 Player state:', event.data);
                if (event.data === 1) {
                  startQuizCheck();
                } else if (event.data === 0) {
                  handleVideoEnd();
                  stopQuizCheck();
                } else if (event.data === 2) {
                  stopQuizCheck();
                }
              },
              onError: (event: any) => {
                console.error('❌ YouTube player error:', event.data);
                setPlayerReady(true);
              },
            },
          });
        } catch (err) {
          console.error('❌ Failed to create player:', err);
          setPlayerReady(true);
          playerInitializedRef.current = false;
        }
      };

      setTimeout(checkAndInit, 300);
    };

    if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
      console.log('📦 Loading YouTube IFrame API');
      
      if (!ytApiLoadedRef.current) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
        
        ytApiLoadedRef.current = true;
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube API loaded');
        initPlayer();
      };
    } else {
      console.log('✅ YouTube API already available');
      initPlayer();
    }

    return () => {
      console.log('🧹 Cleanup');
      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          saveProgress(currentTime);
        } catch (err) {
          console.warn('⚠️ Failed to save progress on cleanup:', err);
        }
      }
      stopQuizCheck();
    };
  }, [isMounted, video, videoProgress, getYouTubeVideoId, startQuizCheck, stopQuizCheck, handleVideoEnd, saveProgress]);

  // ==================== SUBMIT QUIZ ====================
  const handleQuizSubmit = async (selectedOptionId: number) => {
    if (user?.role === 'creator' || user?.role === 'admin') {
      alert('Creator tidak bisa mengerjakan quiz');
      return;
    }

    if (!currentQuiz || profileId === 0) {
      console.error('❌ Cannot submit: missing quiz or profile');
      throw new Error('Data tidak lengkap');
    }

    console.log('📤 Submitting quiz:', {
      quizId: currentQuiz.id,
      profileId: profileId,
      selectedOptionId: selectedOptionId,
    });

    try {
      const response = await api.post('/quizzes/submit', {
        quizId: currentQuiz.id,
        profileId: profileId,
        selectedOptionId: selectedOptionId,
      });

      console.log('✅ Quiz submitted successfully:', response.data);

      // update local state about attempts and score, but DO NOT close/resume here
      const points = Number(response.data.points_earned || 0);
      const isCorrect = !!response.data.is_correct;

      if (points > 0) {
        // points are multiples of 10; increase correctCount accordingly
        setCorrectCount((prev) => prev + points / 10);
      }

      // Only mark quiz as completed (so it won't be prioritized next time)
      // when there's a correct attempt for that quiz.
      if (isCorrect) {
        setCompletedQuizIds((prev) => new Set([...prev, currentQuiz.id]));
      }

      // Return result to caller (QuizPopup) so it can control closing/resume
      return response.data;
    } catch (error: any) {
      const errData = error?.response?.data;
      const errMsg = errData && Object.keys(errData).length ? JSON.stringify(errData) : error.message || String(error);
      console.error('❌ Error submitting quiz:', errMsg);
      // bubble up so QuizPopup can show error
      throw error;
    }
  };

  const handleQuizClose = () => {
    console.log('🔴 Quiz closed without submitting');
    setCurrentQuiz(null);
    if (playerRef.current) {
      setTimeout(() => {
        playerRef.current?.playVideo();
        startQuizCheck();
      }, 300);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('⚠️ Not authenticated');
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (videoId && user && !authLoading) {
      loadVideo();
      loadQuizzes();
    }
  }, [videoId, user, authLoading, loadVideo, loadQuizzes]);

  useEffect(() => {
    if (quizzes.length > 0 && profileId > 0) {
      loadCompletedQuizzes();
    }
  }, [quizzes, profileId, loadCompletedQuizzes]);

  // ✅ FIX: Don't render until mounted
  if (!isMounted) {
    return null;
  }

  // ==================== NAVIGATION ====================
  const handleBack = () => {
    if (profileId) {
      router.push(`/dashboard/${profileId}`);
    } else {
      router.push('/dashboard');
    }
  };

  // ==================== RENDER ====================
  if (authLoading || loadingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎬</div>
          <div className="animate-bounce text-2xl font-black text-[#FF7A00]">
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
          <Button onClick={handleBack} className="bg-[#FF7A00] text-white font-black">
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
            onClick={handleBack}
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
  const youtubeId = isYouTube ? getYouTubeVideoId(video.video_url) : null;
  const vimeoUrl = video.platform === 'vimeo' ? video.video_url.match(/vimeo\.com\/(\d+)/)?.[1] : null;

  return (
    <div className="min-h-screen bg-[#FFF9F0] font-sans text-[#4A4A4A]" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#FFE0B2] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-[#8B7355] hover:text-[#FF7A00] hover:bg-[#FFF5E5] rounded-full font-bold"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            <h1 className="text-lg md:text-xl font-black text-[#4A4A4A] truncate max-w-[200px] md:max-w-md">
              {video.title}
            </h1>
          </div>
          
          {quizzes.length > 0 && user?.role === 'parent' && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#FFF5E5] rounded-full border border-[#FFE0B2]">
                <Brain className="h-4 w-4 text-[#FF7A00]" />
                <span className="text-[#8B7355] font-bold text-sm">
                  Quiz: {completedQuizIds.size}/{quizzes.length}
                </span>
              </div>
              {correctCount > 0 && (
                <div className="bg-[#FF7A00] text-white px-4 py-2 rounded-full font-black text-sm shadow-lg flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {correctCount * 10} Poin
                </div>
              )}
            </div>
          )}

          {(user?.role === 'creator' || user?.role === 'admin') && (
            <div className="bg-[#D94D2B] text-white px-4 py-2 rounded-full font-black text-sm shadow-lg">
              🎨 Creator Mode
            </div>
          )}
        </div>
      </header>

      {/* Video Player */}
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="relative bg-black rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[6px] md:border-[8px] border-[#FFE0B2]">
          {isYouTube && youtubeId ? (
            <div className="aspect-video relative bg-black" suppressHydrationWarning>
              <div 
                id="youtube-player" 
                className="absolute inset-0 w-full h-full"
                suppressHydrationWarning
              />
              
              {!playerReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="text-white text-center">
                    <div className="text-5xl mb-3 animate-spin">⏳</div>
                    <p className="font-bold text-lg">Loading YouTube Player...</p>
                  </div>
                </div>
              )}
            </div>
          ) : vimeoUrl ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoUrl}`}
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
                <p className="mb-2 font-bold text-lg">Video tidak bisa diputar</p>
                <p className="text-sm mb-4">Platform: {video.platform}</p>
                <p className="text-xs text-[#8B7355] mb-4 font-mono break-all max-w-md">
                  {video.video_url}
                </p>
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
                <span className="flex items-center gap-1 text-[#8B7355]">
                  <Eye className="h-4 w-4" /> {video.view_count} views
                </span>
                {video.category && (
                  <span className="bg-[#FFF5E5] text-[#FF7A00] px-3 py-1 rounded-full border border-[#FFE0B2]">
                    {video.category}
                  </span>
                )}
                <span className="bg-[#E3F2FD] text-[#1976D2] px-3 py-1 rounded-full border border-[#BBDEFB]">
                  Usia {video.min_age}-{video.max_age || 18} tahun
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
              <h3 className="font-black text-[#4A4A4A] mb-2 flex items-center gap-2">
                <span className="text-xl">📝</span> Deskripsi
              </h3>
              <p className="text-[#8B7355] leading-relaxed font-bold">{video.description}</p>
            </div>
          )}

          {/* Quiz Info */}
          {quizzes.length > 0 && user?.role === 'parent' && (
            <div className="bg-gradient-to-br from-[#FFF5E5] to-[#FFE0B2] p-6 rounded-2xl border-2 border-[#FF7A00]/20">
              <h3 className="font-black text-[#4A4A4A] mb-4 flex items-center gap-2 text-lg">
                <Brain className="h-6 w-6 text-[#FF7A00]" />
                Quiz Interaktif ({quizzes.length})
              </h3>
              <div className="grid gap-3">
                {quizzes.map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#FFE0B2]"
                  >
                    {completedQuizIds.has(quiz.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-[#8B7355] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#4A4A4A] text-sm truncate">
                        Quiz #{index + 1}
                      </p>
                      <p className="text-xs text-[#8B7355]">
                        Muncul di {Math.floor(quiz.timestamp_seconds / 60)}:{String(quiz.timestamp_seconds % 60).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Quiz Popup */}
      {currentQuiz && user?.role === 'parent' && (
        <QuizPopup
          quiz={currentQuiz}
          onSubmit={handleQuizSubmit}
          onClose={handleQuizClose}
          profileId={profileId}
        />
      )}
    </div>
  );
}

// ✅ Export with dynamic loading to prevent SSR
export default dynamic(() => Promise.resolve(WatchPage), {
  ssr: false
});