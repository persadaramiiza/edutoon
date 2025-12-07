import api from './api';

export interface QuizOption {
  id: number;
  option_text: string;
  is_correct: boolean;
  quizId: number;
}

export interface Quiz {
  id: number;
  video_id: number;
  timestamp_seconds: number;
  question_text: string;
  options: QuizOption[];
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  profile_id: number;
  is_correct: boolean;
  attempted_at: string;
}

export interface CreateQuizOptionDto {
  option_text: string;
  is_correct: boolean;
}

export interface CreateQuizDto {
  videoId: number;
  timestamp_seconds: number;
  question_text: string;
  options: CreateQuizOptionDto[];
}

export const quizzesService = {
  // Get all quizzes for a video
  async getByVideoId(videoId: number): Promise<Quiz[]> {
    console.log('📥 Fetching quizzes for video:', videoId);
    const response = await api.get(`/videos/${videoId}/quizzes`);
    return response.data;
  },

  // Get quiz by ID
  async getById(id: number): Promise<Quiz> {
    console.log('📥 Fetching quiz:', id);
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Create new quiz
  async create(data: CreateQuizDto): Promise<Quiz> {
    console.log('📝 Creating quiz:', data);
    // Changed to /quizzes to avoid routing conflict with /videos/:id
    const response = await api.post(`/quizzes`, data);
    return response.data;
  },

  // Delete quiz
  async delete(id: number): Promise<void> {
    console.log('🗑 Deleting quiz:', id);
    await api.delete(`/quizzes/${id}`);
  },

  // Get quiz attempts by profile
  async getAttempts(profileId: number): Promise<QuizAttempt[]> {
    console.log('📥 Fetching quiz attempts for profile:', profileId);
    const response = await api.get(`/profiles/${profileId}/quiz-attempts`);
    return response.data;
  },

  // Check if quiz already attempted
  async checkAttempt(quizId: number, profileId: number): Promise<any | null> {
    console.log('🔍 Checking quiz attempt:', { quizId, profileId });
    try {
      const response = await api.get(`/quizzes/${quizId}/attempt/${profileId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};