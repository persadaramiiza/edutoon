import { Video } from './videos';
import { Quiz } from './quizzes';

// Mock Video Data
export const mockVideo: Video = {
  id: 1,
  title: 'Test Video - Belajar Alphabet',
  description: 'Video pembelajaran yang menyenangkan untuk mengenal huruf A-Z. Ayo belajar mengenal huruf dan suaranya!',
  video_url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
  platform: 'youtube',
  category: 'Bahasa',
  min_age: 3,
  max_age: 6,
  view_count: 1234,
  status: 'published',
  creator_id: 1,
  creator: {
    id: 1,
    full_name: 'Teacher Ali',
    email: 'teacher@edutoon.com',
  },
};

// Mock Quizzes Data
export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    video_id: 1,
    question_text: 'Apa huruf pertama dalam alphabet?',
    timestamp_seconds: 10,
    status: 'published',
    options: [
      { 
        id: 1, 
        quiz_id: 1, 
        option_text: 'A', 
        is_correct: true, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 2, 
        quiz_id: 1, 
        option_text: 'B', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 3, 
        quiz_id: 1, 
        option_text: 'C', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 4, 
        quiz_id: 1, 
        option_text: 'D', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    video_id: 1,
    question_text: 'Apa huruf setelah B?',
    timestamp_seconds: 25,
    status: 'published',
    options: [
      { 
        id: 5, 
        quiz_id: 2, 
        option_text: 'A', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 6, 
        quiz_id: 2, 
        option_text: 'B', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 7, 
        quiz_id: 2, 
        option_text: 'C', 
        is_correct: true, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 8, 
        quiz_id: 2, 
        option_text: 'D', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    video_id: 1,
    question_text: 'Apa huruf setelah Z?',
    timestamp_seconds: 40,
    status: 'published',
    options: [
      { 
        id: 9, 
        quiz_id: 3, 
        option_text: 'Tidak ada', 
        is_correct: true, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 10, 
        quiz_id: 3, 
        option_text: 'AA', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 11, 
        quiz_id: 3, 
        option_text: 'BA', 
        is_correct: false, 
        created_at: new Date().toISOString() 
      },
    ],
    created_at: new Date().toISOString(),
  },
];

// Helper function untuk get mock data
export const getMockData = {
  getVideo: async (videoId: number): Promise<Video> => {
    console.log('📦 Getting mock video:', videoId);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockVideo);
      }, 500);
    });
  },

  getQuizzes: async (videoId: number): Promise<Quiz[]> => {
    console.log('📦 Getting mock quizzes for video:', videoId);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockQuizzes);
      }, 500);
    });
  },

  submitQuiz: async (dto: any): Promise<any> => {
    console.log('📦 Mock submit quiz:', dto);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the quiz and option
        const quiz = mockQuizzes.find(q => q.id === dto.quizId);
        const option = quiz?.options.find(o => o.id === dto.selectedOptionId);
        
        resolve({
          id: Math.random(),
          quiz_id: dto.quizId,
          profile_id: dto.profileId,
          is_correct: option?.is_correct || false,
          attempted_at: new Date().toISOString(),
          points_earned: option?.is_correct ? 10 : 0,
        });
      }, 800);
    });
  },

  saveProgress: async (dto: any): Promise<void> => {
    console.log('📦 Mock save progress:', dto);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },
};
