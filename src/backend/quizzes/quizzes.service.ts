import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizOption } from './quiz-option.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(QuizOption)
    private readonly optionRepo: Repository<QuizOption>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepo: Repository<QuizAttempt>,
    private readonly profilesService: ProfilesService,
  ) {}

  // Get quizzes untuk video tertentu
  async getQuizzesForVideo(videoId: number): Promise<Quiz[]> {
    return this.quizRepo.find({
      where: { videoId },
      relations: ['options'],
      order: { timestamp_seconds: 'ASC' },
    });
  }

  // Get quiz by ID
  async findById(id: number): Promise<Quiz> {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz tidak ditemukan');
    }

    return quiz;
  }

  // Create quiz (untuk creator)
  async createQuiz(dto: CreateQuizDto, creatorId: number): Promise<Quiz> {
    // Validate minimum 2 options
    if (dto.options.length < 2) {
      throw new BadRequestException('Quiz harus memiliki minimal 2 pilihan jawaban');
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = dto.options.some((o) => o.is_correct);
    if (!hasCorrectAnswer) {
      throw new BadRequestException('Quiz harus memiliki minimal 1 jawaban benar');
    }

    // Create quiz
    const quiz = this.quizRepo.create({
      videoId: dto.videoId,
      timestamp_seconds: dto.timestamp_seconds,
      question_text: dto.question_text,
    });

    const savedQuiz = await this.quizRepo.save(quiz);

    // Create options
    const options = dto.options.map((opt) =>
      this.optionRepo.create({
        quizId: savedQuiz.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
      }),
    );

    await this.optionRepo.save(options);

    // Return quiz with options
    return this.findById(savedQuiz.id);
  }

  // Delete quiz
  async deleteQuiz(quizId: number): Promise<{ message: string }> {
    const quiz = await this.findById(quizId);
    
    // Delete options first
    await this.optionRepo.delete({ quizId: quiz.id });
    
    // Delete quiz
    await this.quizRepo.remove(quiz);
    
    return { message: 'Quiz berhasil dihapus' };
  }

  // Submit jawaban quiz
  async submitAnswer(dto: SubmitQuizDto, userId: number): Promise<QuizAttempt> {
    // Verify profile ownership
    await this.profilesService.findOneByUser(dto.profileId, userId);

    // Get quiz with options
    const quiz = await this.findById(dto.quizId);

    // Check if already attempted
    const existingAttempt = await this.attemptRepo.findOne({
      where: { quiz_id: dto.quizId, profile_id: dto.profileId },
    });

    if (existingAttempt) {
      throw new BadRequestException('Quiz ini sudah pernah dijawab');
    }

    // Find selected option
    const selectedOption = quiz.options.find((o) => o.id === dto.selectedOptionId);
    if (!selectedOption) {
      throw new BadRequestException('Pilihan jawaban tidak valid');
    }

    // Check if correct
    const isCorrect = selectedOption.is_correct;

    // Create attempt
    const attempt = this.attemptRepo.create({
      quiz_id: dto.quizId,
      profile_id: dto.profileId,
      is_correct: isCorrect,
    });

    return this.attemptRepo.save(attempt);
  }

  // Get attempts by profile
  async getAttemptsByProfile(profileId: number, userId: number): Promise<QuizAttempt[]> {
    // Verify profile ownership
    await this.profilesService.findOneByUser(profileId, userId);

    return this.attemptRepo.find({
      where: { profile_id: profileId },
      order: { attempted_at: 'DESC' },
    });
  }

  // Check if quiz already attempted
  async checkAttempt(quizId: number, profileId: number, userId: number): Promise<QuizAttempt | null> {
    await this.profilesService.findOneByUser(profileId, userId);

    return this.attemptRepo.findOne({
      where: { quiz_id: quizId, profile_id: profileId },
    });
  }
}