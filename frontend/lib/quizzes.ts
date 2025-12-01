import api from './api';

export interface QuizOption {
  id: number;
  quizId: number;
  option_text: string;
  is_correct?: boolean;
}

export interface Quiz {
  id: number;
  videoId: number;
  question_text: string;
  timestamp_seconds: number;
  options: QuizOption[];
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  profile_id: number;
  is_correct: boolean;
  attempted_at: string;
}

export interface SubmitQuizDto {
  quizId: number;
  profileId: number;
  selectedOptionId: number;
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
  // Get quizzes by video ID
  getByVideoId: async (videoId: number): Promise<Quiz[]> => {
    const response = await api.get(`/videos/${videoId}/quizzes`);
    return response.data;
  },

  // Get quiz by ID
  getById: async (quizId: number): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // Submit quiz answer
  submitAnswer: async (dto: SubmitQuizDto): Promise<QuizAttempt> => {
    const response = await api.post('/quiz/submit', dto);
    return response.data;
  },

  // Get quiz attempts by profile
  getAttemptsByProfile: async (profileId: number): Promise<QuizAttempt[]> => {
    const response = await api.get(`/profiles/${profileId}/quiz-attempts`);
    return response.data;
  },

  // Check if quiz already attempted
  checkAttempt: async (quizId: number, profileId: number): Promise<QuizAttempt | null> => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempt/${profileId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Create quiz (creator only)
  create: async (dto: CreateQuizDto): Promise<Quiz> => {
    const response = await api.post('/quizzes', dto);
    return response.data;
  },

  // Delete quiz (creator only)
  delete: async (quizId: number): Promise<void> => {
    await api.delete(`/quizzes/${quizId}`);
  },
};
