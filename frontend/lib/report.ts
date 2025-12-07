import api from './api';

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  is_correct: boolean;
  attempted_at: string;
}

export interface WatchHistoryItem {
  video_id: number;
  profile_id: number;
  last_position_seconds: number;
  is_completed: boolean;
  updated_at: string;
}

export interface RecentVideo {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  category?: string;
}

export interface ContinueWatchingVideo extends RecentVideo {
  last_position_seconds: number;
  is_completed: boolean;
}

export interface ReportData {
  total_watched: number;
  completed_videos: number;
  quiz_attempts: number;
  correct_answers: number;
  average_score: number;
  last_activity: string;
  recent_videos: RecentVideo[];
  continue_watching: ContinueWatchingVideo[];
  quiz_history: QuizAttempt[];
  watch_history: WatchHistoryItem[];
}

export const reportService = {
  async getProfileReport(profileId: number): Promise<ReportData> {
    try {
      // Fetch watch history with profileId query parameter
      const watchHistoryRes = await api.get(`/video/continue-watching?profileId=${profileId}`);
      const watchHistoryRaw = watchHistoryRes.data || [];
      
      // Flatten the structure to match RecentVideo interface
      const watchHistory = watchHistoryRaw.map((item: any) => ({
        id: item.video.id,
        title: item.video.title,
        video_url: item.video.video_url || '',
        thumbnail_url: item.video.thumbnail_url,
        duration_seconds: item.video.duration_seconds,
        category: item.video.category,
        last_position_seconds: item.last_position_seconds,
        is_completed: item.is_completed,
        updated_at: item.updated_at
      }));

      // Fetch recent videos with profileId query parameter
      const recentRes = await api.get(`/video/recent?profileId=${profileId}`);
      const recentVideosRaw = recentRes.data || [];
      
      // Flatten recent videos too if needed (backend returns nested video object)
      const recentVideos = recentVideosRaw.map((item: any) => ({
        id: item.video.id,
        title: item.video.title,
        video_url: item.video.video_url || '',
        thumbnail_url: item.video.thumbnail_url,
        duration_seconds: item.video.duration_seconds,
        category: item.video.category,
        last_position_seconds: item.last_position_seconds,
        is_completed: item.is_completed,
        updated_at: item.updated_at
      }));

      // Fetch quiz attempts
      const quizRes = await api.get(`/profiles/${profileId}/quiz-attempts`);
      const quizAttempts = quizRes.data || [];

      // Calculate stats using recentVideos (which contains ALL history)
      const completedVideos = recentVideos.filter((h: any) => h.is_completed).length;
      const correctAnswers = quizAttempts.filter((q: any) => q.is_correct).length;
      const averageScore = quizAttempts.length > 0 ? (correctAnswers / quizAttempts.length) * 100 : 0;

      // Get last activity
      const lastActivity = recentVideos.length > 0 
        ? new Date(recentVideos[0].updated_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-';

      return {
        total_watched: recentVideos.length,
        completed_videos: completedVideos,
        quiz_attempts: quizAttempts.length,
        correct_answers: correctAnswers,
        average_score: Math.round(averageScore),
        last_activity: lastActivity,
        recent_videos: recentVideos,
        continue_watching: watchHistory, // Already filtered by backend
        quiz_history: quizAttempts,
        watch_history: recentVideos, // Use recentVideos as full history
      };
    } catch (error) {
      console.error('Error fetching report:', error);
      // Return default empty report on error
      return {
        total_watched: 0,
        completed_videos: 0,
        quiz_attempts: 0,
        correct_answers: 0,
        average_score: 0,
        last_activity: '-',
        recent_videos: [],
        continue_watching: [],
        quiz_history: [],
        watch_history: [],
      };
    }
  },

  async getVideoProgress(profileId: number, videoId: number) {
    try {
      const res = await api.get(`/video/${videoId}/progress`);
      return res.data;
    } catch (error) {
      console.error('Error fetching video progress:', error);
      return null;
    }
  },
};
