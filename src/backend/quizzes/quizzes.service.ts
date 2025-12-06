import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizOption } from './quiz-option.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name);

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
    console.log(`🔍 Fetching quizzes for video ${videoId}`);
    
    const quizzes = await this.quizRepo.find({
      where: { videoId: videoId },
      relations: ['options'],
      order: { timestamp_seconds: 'ASC' },
    });

    console.log(`✅ Found ${quizzes.length} quizzes for video ${videoId}`);
    return quizzes;
  }

  // Get quiz by ID
  async findById(id: number): Promise<Quiz> {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz dengan ID ${id} tidak ditemukan`);
    }

    return quiz;
  }

  // Submit quiz answer - CRITICAL METHOD
  async submitAnswer(dto: SubmitQuizDto, userId: number): Promise<any> {
    console.log('🎯 Processing quiz submission...');
    
    // Validasi input
    if (!dto.quizId || !dto.profileId || !dto.selectedOptionId) {
      throw new BadRequestException('quizId, profileId, dan selectedOptionId harus diisi');
    }

    // Check profile ownership
    console.log(`🔐 Verifying profile ${dto.profileId} belongs to user ${userId}`);
    const profile = await this.profilesService.findOneByUser(dto.profileId, userId);
    if (!profile) {
      throw new ForbiddenException('Profile tidak ditemukan atau bukan milik Anda');
    }

    // Get quiz
    console.log(`📚 Fetching quiz ${dto.quizId}`);
    const quiz = await this.findById(dto.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz tidak ditemukan');
    }

    // Check if already attempted
    console.log(`⏰ Checking if already attempted...`);
    const existingAttempt = await this.attemptRepo.findOne({
      where: {
        quiz_id: dto.quizId,
        profile_id: dto.profileId,
      },
    });

    if (existingAttempt) {
      console.warn(`⚠️ Quiz sudah pernah dijawab oleh profile ${dto.profileId}`);
      throw new ConflictException('Quiz sudah pernah dijawab');
    }

    // Get selected option
    console.log(`🔍 Finding selected option ${dto.selectedOptionId}`);
    const selectedOption = await this.optionRepo.findOne({
      where: { id: dto.selectedOptionId },
    });

    if (!selectedOption) {
      throw new NotFoundException('Opsi jawaban tidak ditemukan');
    }

    // Check if option belongs to this quiz
    if (selectedOption.quizId !== dto.quizId) {
      throw new BadRequestException('Opsi tidak sesuai dengan quiz');
    }

    // Determine if correct
    const isCorrect = selectedOption.is_correct;
    const pointsEarned = isCorrect ? 10 : 0;

    console.log(`📊 Answer result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Create attempt record
    console.log(`💾 Creating attempt record...`);
    const attempt = this.attemptRepo.create({
      quiz_id: dto.quizId,
      profile_id: dto.profileId,
      is_correct: isCorrect,
      attempted_at: new Date(),
    });

    const savedAttempt = await this.attemptRepo.save(attempt);
    console.log(`✅ Attempt saved with ID: ${savedAttempt.id}`);

    // Return result
    const result = {
      id: savedAttempt.id,
      quiz_id: savedAttempt.quiz_id,
      profile_id: savedAttempt.profile_id,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      attempted_at: savedAttempt.attempted_at,
    };

    console.log(`🎉 Submission complete:`, result);
    return result;
  }

  // Get attempts by profile
  async getAttemptsByProfile(profileId: number, userId: number): Promise<QuizAttempt[]> {
    console.log(`📊 Fetching attempts for profile ${profileId}`);
    
    // Verify profile ownership
    const profile = await this.profilesService.findOneByUser(profileId, userId);
    if (!profile) {
      throw new ForbiddenException('Profile tidak ditemukan atau bukan milik Anda');
    }

    const attempts = await this.attemptRepo.find({
      where: { profile_id: profileId },
      order: { attempted_at: 'DESC' },
    });

    console.log(`✅ Found ${attempts.length} attempts`);
    return attempts;
  }

  // Check if already attempted
  async checkAttempt(
    quizId: number,
    profileId: number,
    userId: number,
  ): Promise<QuizAttempt | null> {
    console.log(`🔍 Checking attempt for quiz ${quizId}, profile ${profileId}`);
    
    // Verify profile ownership
    const profile = await this.profilesService.findOneByUser(profileId, userId);
    if (!profile) {
      throw new ForbiddenException('Profile tidak ditemukan atau bukan milik Anda');
    }

    const attempt = await this.attemptRepo.findOne({
      where: {
        quiz_id: quizId,
        profile_id: profileId,
      },
    });

    if (attempt) {
      console.log(`✅ Found previous attempt`);
    } else {
      console.log(`ℹ️ No previous attempt found`);
    }

    return attempt || null;
  }
}