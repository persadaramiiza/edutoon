'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { videosService, Video } from '@/lib/videos';
import { quizzesService, Quiz } from '@/lib/quizzes';
import QuizPopup from '@/components/QuizPopup';

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerOptions {
  videoId: string;
  playerVars?: {
    autoplay?: number;
    rel?: number;
    modestbranding?: number;
  };
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
  };
}

interface YouTubePlayer {
  getCurrentTime: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  destroy: () => void;
}

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<number>>(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [loadingVideo, setLoadingVideo] = useState(true);
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ytApiLoadedRef = useRef(false);

  const videoId = Number(params.id);
  const profileId = Number(searchParams.get('profile')) || 0;

  // Load video
  const loadVideo = useCallback(async () => {
    try {
      const data = await videosService.getById(videoId);
      setVideo(data);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideo(false);
    }
  }, [videoId]);

  // Load quizzes
  const loadQuizzes = useCallback(async () => {
    try {
      const data = await quizzesService.getByVideoId(videoId);
      setQuizzes(data);
      console.log('Loaded quizzes:', data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  }, [videoId]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (videoId && user) {
      loadVideo();
      loadQuizzes();
    }
  }, [videoId, user, loadVideo, loadQuizzes]);

  // Get YouTube video ID from URL
  const getYouTubeVideoId = useCallback((url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  // Initialize YouTube Player
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
        },
        events: {
          onStateChange: (event) => {
            if (event.data === 1) {
              // Playing - start checking for quiz timestamps
              startQuizCheck();
            } else {
              // Paused/Stopped - stop checking
              stopQuizCheck();
            }
          },
        },
      });
    };

    // Load YouTube IFrame API if not loaded
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
  }, [video, quizzes, getYouTubeVideoId]);

  const startQuizCheck = () => {
    if (checkIntervalRef.current) return;

    checkIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;

      const currentTime = Math.floor(playerRef.current.getCurrentTime());

      // Find quiz at this timestamp that hasn't been completed
      const quizToShow = quizzes.find(
        (q) => q.timestamp_seconds === currentTime && !completedQuizIds.has(q.id)
      );

      if (quizToShow && profileId > 0) {
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
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    }
    setCurrentQuiz(null);
    
    // Resume video after a short delay
    setTimeout(() => {
      playerRef.current?.playVideo();
      startQuizCheck();
    }, 500);
  };

  const handleQuizClose = () => {
    if (currentQuiz) {
      setCompletedQuizIds((prev) => new Set([...prev, currentQuiz.id]));
    }
    setCurrentQuiz(null);
    
    // Resume video
    playerRef.current?.playVideo();
    startQuizCheck();
  };

  // Manual quiz trigger for testing
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

  if (isLoading || loadingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl">Video tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const isYouTube = video.platform === 'youtube';
  const vimeoUrl = video.platform === 'vimeo' ? getVimeoEmbedUrl(video.video_url) : null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Quiz Popup */}
      {currentQuiz && profileId > 0 && (
        <QuizPopup
          quiz={currentQuiz}
          profileId={profileId}
          onComplete={handleQuizComplete}
          onClose={handleQuizClose}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition"
            >
              ← Kembali
            </button>
            <h1 className="text-white font-medium truncate">{video.title}</h1>
          </div>
          
          {/* Score Display */}
          {quizzes.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">
                Quiz: {completedQuizIds.size}/{quizzes.length}
              </span>
              {correctCount > 0 && (
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  ⭐ {correctCount * 10} Poin
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Video Player */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          {isYouTube && quizzes.length > 0 ? (
            // YouTube with Quiz support - use YouTube API
            <div className="aspect-video">
              <div id="youtube-player" className="w-full h-full" />
            </div>
          ) : isYouTube ? (
            // YouTube without Quiz - use simple iframe
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.video_url)}`}
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
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-white">
              <div className="text-center">
                <p className="mb-4">Video tidak dapat diputar di sini</p>
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Buka di Tab Baru
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-3">{video.title}</h2>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
            <span>👁 {video.view_count} views</span>
            {video.category && (
              <span className="bg-gray-700 px-2 py-1 rounded">{video.category}</span>
            )}
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
              Usia {video.min_age}-{video.max_age || 18} tahun
            </span>
          </div>
          
          {video.description && (
            <p className="text-gray-300 leading-relaxed">{video.description}</p>
          )}

          {video.creator && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400">
                Dibuat oleh: <span className="text-white font-medium">{video.creator.full_name}</span>
              </p>
            </div>
          )}

          {/* Quiz Section */}
          {quizzes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    🎯 Quiz Interaktif
                    <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded">
                      {quizzes.length} soal
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Quiz akan muncul pada menit ke:{' '}
                    {quizzes.map((q, i) => (
                      <span key={q.id} className={completedQuizIds.has(q.id) ? 'line-through text-gray-600' : ''}>
                        {Math.floor(q.timestamp_seconds / 60)}:{String(q.timestamp_seconds % 60).padStart(2, '0')}
                        {i < quizzes.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
                
                {/* Test Quiz Button */}
                {profileId > 0 && quizzes.length > completedQuizIds.size && (
                  <button
                    onClick={triggerTestQuiz}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    🎯 Test Quiz
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${(completedQuizIds.size / quizzes.length) * 100}%` }}
                />
              </div>

              {/* Completion Message */}
              {completedQuizIds.size === quizzes.length && (
                <div className="mt-4 bg-green-600/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <span className="text-2xl">🎉</span>
                  <p className="text-green-400 font-medium mt-1">
                    Selamat! Semua quiz sudah diselesaikan!
                  </p>
                  <p className="text-green-300 text-sm">
                    Kamu menjawab {correctCount} dari {quizzes.length} soal dengan benar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Profile Warning */}
          {quizzes.length > 0 && !profileId && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                ⚠️ Pilih profil anak terlebih dahulu untuk mengerjakan quiz dan mengumpulkan poin!
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-2 text-yellow-300 text-sm underline hover:text-yellow-200"
              >
                Kembali ke Dashboard →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
