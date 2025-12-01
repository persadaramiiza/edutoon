import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from './quiz.entity';
import { QuizOption } from './quiz-option.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizOption, QuizAttempt]), ProfilesModule],
  providers: [QuizzesService],
  controllers: [QuizzesController],
})
export class QuizzesModule {}
