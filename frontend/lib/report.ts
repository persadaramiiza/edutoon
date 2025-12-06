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
      // Fetch recent videos (includes both completed and incomplete)
      const recentRes = await api.get(`/video/recent?profileId=${profileId}`);
      const rawHistory = recentRes.data || [];
      
      // Map backend response to frontend interface
      const allHistory = rawHistory.map((item: any) => ({
        id: item.videoId,
        video_id: item.videoId, // Add for compatibility
        profile_id: item.profileId, // Add for compatibility
        title: item.video?.title || 'Video',
        video_url: item.video?.video_url || '',
        thumbnail_url: item.video?.thumbnail_url,
        last_position_seconds: item.last_position_seconds,
        is_completed: item.is_completed,
        updated_at: item.updated_at
      }));

      // Fetch quiz attempts
      const quizRes = await api.get(`/profiles/${profileId}/quiz-attempts`);
      const quizAttempts = quizRes.data || [];

      // Calculate stats using allHistory
      const completedVideos = allHistory.filter((h: any) => h.is_completed).length;
      const correctAnswers = quizAttempts.filter((q: any) => q.is_correct).length;
      const averageScore = quizAttempts.length > 0 ? (correctAnswers / quizAttempts.length) * 100 : 0;

      // Get last activity
      const lastActivity = allHistory.length > 0 
        ? new Date(allHistory[0].updated_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '-';

      return {
        total_watched: allHistory.length,
        completed_videos: completedVideos,
        quiz_attempts: quizAttempts.length,
        correct_answers: correctAnswers,
        average_score: Math.round(averageScore),
        last_activity: lastActivity,
        recent_videos: allHistory,
        continue_watching: allHistory.filter((h: any) => !h.is_completed),
        quiz_history: quizAttempts,
        watch_history: allHistory,
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
