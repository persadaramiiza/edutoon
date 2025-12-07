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
import { Video } from '../videos/video.entity';
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
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
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

    // Load previous attempts for this profile & quiz (if any)
    console.log(`⏰ Loading previous attempts for quiz ${dto.quizId}, profile ${dto.profileId}`);
    const previousAttempts = await this.attemptRepo.find({
      where: { quiz_id: dto.quizId, profile_id: dto.profileId },
    });
    const previouslyCorrect = previousAttempts.some((a) => a.is_correct === true);

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

    // Points logic:
    // - If the profile has never answered correctly before and current answer is correct -> award points (10)
    // - If profile already answered correctly before -> no additional points
    // - Otherwise (wrong answer) -> 0 points
    let pointsEarned = 0;
    if (!previouslyCorrect && isCorrect) {
      pointsEarned = 10;
    }

    console.log(`📊 Answer result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Create attempt record (allow multiple attempts; we keep a history)
    console.log(`💾 Creating attempt record...`);
    const attempt = this.attemptRepo.create({
      quiz_id: dto.quizId,
      profile_id: dto.profileId,
      is_correct: isCorrect,
      attempted_at: new Date(),
    });

    const savedAttempt = await this.attemptRepo.save(attempt);
    console.log(`✅ Attempt saved with ID: ${savedAttempt.id}`);

    // Recompute attempts after saving
    const allAttempts = await this.attemptRepo.find({ where: { quiz_id: dto.quizId, profile_id: dto.profileId } });
    const currentAttempts = allAttempts.length;
    const maxAttempts = 3;
    const everAnsweredCorrectly = allAttempts.some((a) => a.is_correct === true);

    // Return result
    const result = {
      id: savedAttempt.id,
      quiz_id: savedAttempt.quiz_id,
      profile_id: savedAttempt.profile_id,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      attempted_at: savedAttempt.attempted_at,
      previously_correct: previouslyCorrect,
      current_attempts: currentAttempts,
      max_attempts: maxAttempts,
      ever_answered_correctly: everAnsweredCorrectly,
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

  // Return randomized quizzes for a video. If profileId is provided, prefer quizzes
  // that the profile hasn't attempted yet. Returns up to `count` quizzes.
  async getRandomQuizzesForVideo(
    videoId: number,
    profileId?: number,
    count = 1,
  ): Promise<any[]> {
    console.log(`🎲 Fetching randomized quizzes for video ${videoId}`);

    const quizzes = await this.quizRepo.find({
      where: { videoId },
      relations: ['options'],
    });

    if (!quizzes || quizzes.length === 0) {
      console.log('ℹ️ No quizzes found for video');
      return [];
    }

    // Determine which quizzes the profile already attempted
    let attemptedQuizIds = new Set<number>();
    if (profileId) {
      const attempts = await this.attemptRepo.find({
        where: { profile_id: profileId },
      });
      attempts.forEach((a) => attemptedQuizIds.add(a.quiz_id));
    }

    // Partition quizzes into not-yet-attempted and attempted
    const notAttempted = quizzes.filter((q) => !attemptedQuizIds.has(q.id));
    const attempted = quizzes.filter((q) => attemptedQuizIds.has(q.id));

    // Shuffle helper
    const shuffle = <T,>(arr: T[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    let pool: Quiz[] = [];
    if (notAttempted.length > 0) {
      pool = shuffle(notAttempted).slice(0, count);
    }

    // If not enough new quizzes, fill from attempted ones (shuffled)
    if (pool.length < count && attempted.length > 0) {
      const need = count - pool.length;
      pool = pool.concat(shuffle(attempted).slice(0, need));
    }

    // Map to DTO-like objects and strip `is_correct` from options
    const mapped: any[] = pool.map((q) => ({
      id: q.id,
      videoId: q.videoId,
      timestamp_seconds: q.timestamp_seconds,
      question_text: q.question_text,
      options: q.options?.map((o) => ({ id: o.id, option_text: o.option_text })) || [],
    }));

    console.log(`✅ Returning ${mapped.length} randomized quizzes`);
    return mapped;
  }

  // Provide a hint for a quiz. If `reveal` is true, return the correct option id.
  // Otherwise return a random incorrect option id (to be eliminated in UI).
  async getHintOption(quizId: number, reveal = false): Promise<{ optionId: number } | null> {
    const options = await this.optionRepo.find({ where: { quizId } });
    if (!options || options.length === 0) return null;

    if (reveal) {
      const correct = options.find((o) => o.is_correct);
      return correct ? { optionId: correct.id } : null;
    }

    const incorrect = options.filter((o) => !o.is_correct);
    if (incorrect.length === 0) return null;
    const idx = Math.floor(Math.random() * incorrect.length);
    return { optionId: incorrect[idx].id };
  }

  // Create a new quiz (and its options). Only the video owner (creator) can create quizzes for that video.
  async create(dto: any, userId: number): Promise<Quiz> {
    console.log(`✨ Creating quiz for video ${dto.videoId} by user ${userId}`);

    // Basic validation
    if (!dto || !dto.videoId || !dto.timestamp_seconds || !dto.question_text || !Array.isArray(dto.options)) {
      throw new BadRequestException('Payload quiz tidak valid');
    }

    // Verify video exists and ownership
    const video = await this.videoRepo.findOne({ where: { id: dto.videoId } });
    if (!video) {
      throw new NotFoundException('Video tidak ditemukan');
    }
    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa menambahkan quiz untuk video ini');
    }

    // Create quiz
    const quiz = this.quizRepo.create({
      videoId: dto.videoId,
      timestamp_seconds: dto.timestamp_seconds,
      question_text: dto.question_text,
    });
    const savedQuiz = await this.quizRepo.save(quiz);

    // Create options
    const optionEntities: QuizOption[] = dto.options.map((o: any) =>
      this.optionRepo.create({
        quizId: savedQuiz.id,
        option_text: o.option_text,
        is_correct: !!o.is_correct,
      }),
    );

    await this.optionRepo.save(optionEntities);

    // Return full quiz with options
    return this.findById(savedQuiz.id);
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

    const attempts = await this.attemptRepo.find({
      where: { quiz_id: quizId, profile_id: profileId },
      order: { attempted_at: 'ASC' },
    });

    if (attempts && attempts.length > 0) {
      console.log(`✅ Found ${attempts.length} previous attempt(s)`);
    } else {
      console.log(`ℹ️ No previous attempt found`);
    }

    const currentAttempts = attempts.length;
    const everAnsweredCorrectly = attempts.some((a) => a.is_correct === true);
    const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

    // Return a small summary object so frontend can initialize UI state
    return {
      current_attempts: currentAttempts,
      ever_answered_correctly: everAnsweredCorrectly,
      last_attempt: lastAttempt,
    } as any;
  }

  // Delete quiz
  async delete(id: number, userId: number): Promise<void> {
    console.log(`🗑 Deleting quiz ${id} by user ${userId}`);
    
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['video'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz tidak ditemukan');
    }

    // Check ownership
    if (quiz.video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa menghapus quiz ini');
    }

    // Delete options first (cascade should handle this but just in case)
    await this.optionRepo.delete({ quizId: id });
    
    // Delete attempts
    await this.attemptRepo.delete({ quiz_id: id });
    
    // Delete quiz
    await this.quizRepo.delete(id);
    
    console.log(`✅ Quiz ${id} deleted successfully`);
  }
}