import api from './api';

export interface QuizOption {
  id: number;
  quiz_id: number;
  option_text: string;
  is_correct: boolean;
}

export interface Quiz {
  id: number;
  video_id: number;
  question_text: string;
  timestamp_seconds: number;
  options: QuizOption[];
  created_at: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  profile_id: number;
  selected_option_id: number;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
}

export interface SubmitQuizDto {
  quizId: number;
  profileId: number;
  selectedOptionId: number;
}

// ==================== HELPER FUNCTION ====================
const parseQuizResponse = (data: any): Quiz => {
  if (!data) throw new Error('Invalid quiz data');
  return {
    id: data.id,
    video_id: data.video_id,
    question_text: data.question_text || '',
    timestamp_seconds: data.timestamp_seconds || 0,
    options: Array.isArray(data.options) ? data.options : [],
    created_at: data.created_at || new Date().toISOString(),
  };
};

export const quizzesService = {
  // ==================== GET BY VIDEO ID ====================
  async getByVideoId(videoId: number): Promise<Quiz[]> {
    try {
      console.log(`📥 Fetching quizzes for video ${videoId}`);
      const response = await api.get(`/videos/${videoId}/quizzes`);

      if (!response.data) {
        console.log('ℹ️ Empty response');
        return [];
      }

      const data = response.data;
      console.log('✅ Response type:', typeof data, 'is array:', Array.isArray(data));

      // Handle array response
      if (Array.isArray(data)) {
        return data.map(parseQuizResponse);
      }

      // Handle { data: [...] } response
      if (data.data && Array.isArray(data.data)) {
        return data.data.map(parseQuizResponse);
      }

      console.warn('⚠️ Unexpected response format:', data);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching quizzes:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);

      // Don't throw, just return empty
      return [];
    }
  },

  // ==================== GET BY ID ====================
  async getById(id: number): Promise<Quiz | null> {
    try {
      console.log(`📥 Fetching quiz ${id}`);
      const response = await api.get(`/quizzes/${id}`);
      const quiz = parseQuizResponse(response.data);
      console.log('✅ Quiz loaded');
      return quiz;
    } catch (error) {
      console.error(`❌ Error fetching quiz ${id}:`, error);
      return null;
    }
  },

  // ==================== CREATE QUIZ ====================
  async create(dto: any): Promise<Quiz | null> {
    try {
      console.log('📝 Creating quiz:', dto);
      const response = await api.post('/quizzes', dto);
      console.log('✅ Quiz created:', response.data.id);
      return parseQuizResponse(response.data);
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      return null;
    }
  },

  // ==================== SUBMIT ANSWER ====================
  async submitAnswer(dto: SubmitQuizDto): Promise<QuizAttempt | null> {
    try {
      console.log('📤 Submitting quiz answer:', dto);
      const response = await api.post('/quiz/submit', dto);
      console.log('✅ Answer submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      return null;
    }
  },

  // ==================== GET ATTEMPTS ====================
  async getAttempts(profileId: number): Promise<QuizAttempt[]> {
    try {
      console.log(`📥 Fetching attempts for profile ${profileId}`);
      const response = await api.get(`/profiles/${profileId}/quiz-attempts`);

      if (!response.data) return [];

      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;

      return [];
    } catch (error) {
      console.error('❌ Error fetching attempts:', error);
      return [];
    }
  },

  // ==================== DELETE QUIZ ====================
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting quiz ${id}`);
      await api.delete(`/quizzes/${id}`);
      console.log('✅ Quiz deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      return false;
    }
  },
};