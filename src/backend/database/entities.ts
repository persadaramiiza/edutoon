import { Profile } from '../profiles/profile.entity';
import { QuizAttempt } from '../quizzes/quiz-attempt.entity';
import { QuizOption } from '../quizzes/quiz-option.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { User } from '../users/user.entity';
import { VideoProgress } from '../videos/video-progress.entity';
import { Video } from '../videos/video.entity';
import { WatchHistory } from '../watch-history/watch-history.entity';

export const databaseEntities = [
  User,
  Profile,
  Video,
  VideoProgress,
  Quiz,
  QuizOption,
  QuizAttempt,
  WatchHistory,
];
