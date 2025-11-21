import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizOption } from './quiz-option.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepo: Repository<Quiz>,
    @InjectRepository(QuizOption)
    private readonly optionsRepo: Repository<QuizOption>,
    @InjectRepository(QuizAttempt)
    private readonly attemptsRepo: Repository<QuizAttempt>,
    private readonly profilesService: ProfilesService,
  ) {}

  async getQuizzesForVideo(videoId: number) {
    const quizzes = await this.quizzesRepo.find({
      where: { videoId },
      relations: ['options'],
      order: {
        timestamp_seconds: 'ASC',
      },
    });

    return quizzes;
  }

  async submitAnswer(dto: SubmitQuizDto, currentUserId: number) {
    const profile = await this.profilesService.findOneOwnedByUser(dto.profileId, currentUserId);
    if (!profile) {
      throw new ForbiddenException('Profile not found or not owned by this user');
    }

    const option = await this.optionsRepo.findOne({
      where: { id: dto.optionId },
      relations: ['quiz'],
    });

    if (!option || option.quiz.id !== dto.quizId) {
      throw new NotFoundException('Quiz/option not found');
    }

    const isCorrect = option.is_correct;

    await this.attemptsRepo.save({
      profile_id: dto.profileId,
      quiz_id: dto.quizId,
      is_correct: isCorrect,
    });

    return { correct: isCorrect };
  }
}
