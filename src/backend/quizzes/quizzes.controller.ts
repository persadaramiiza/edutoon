import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';

@ApiTags('Quizzes')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // Get quizzes untuk video tertentu
  @Get('videos/:videoId/quizzes')
  @ApiOperation({ summary: 'Get all quizzes for a video' })
  async getQuizzesForVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    console.log(`📥 Fetching quizzes for video ${videoId}`);
    return this.quizzesService.getQuizzesForVideo(videoId);
  }

  // Get randomized quizzes for a video (optionally excluding quizzes profile already attempted)
  @Get('videos/:videoId/quizzes/random/:profileId')
  @ApiOperation({ summary: 'Get randomized quizzes for a video for a given profile' })
  @ApiQuery({ name: 'count', required: false })
  async getRandomQuizzesForVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('count') count?: string,
  ) {
    const n = count ? Math.max(1, Number(count)) : 1;
    console.log(`📥 Fetching ${n} randomized quiz(es) for video ${videoId} and profile ${profileId}`);
    return this.quizzesService.getRandomQuizzesForVideo(videoId, profileId, n);
  }

  // Get quiz by ID
  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  async getQuiz(@Param('id', ParseIntPipe) id: number) {
    console.log(`📥 Fetching quiz ${id}`);
    return this.quizzesService.findById(id);
  }

  // Submit quiz answer - CRITICAL ENDPOINT
  @Post('quiz/submit')
  @ApiOperation({ summary: 'Submit quiz answer and get result' })
  async submitQuizAnswer(
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    console.log('📤 Quiz submission received:', dto);
    console.log('👤 User:', user.email, '(ID:', user.userId, ')');
    try {
      return await this.quizzesService.submitAnswer(dto, user.userId);
    } catch (err: any) {
      // If service throws a Conflict (some older code or constraint),
      // convert into a friendly summary so frontend can continue UX (no hard 409 stop).
      if (err instanceof ConflictException) {
        console.warn('⚠️ Conflict on submitQuizAnswer, returning summary instead of 409', err.message);
        // Try to get attempt summary
        const summary = await this.quizzesService.checkAttempt(dto.quizId, dto.profileId, user.userId);
        return {
          is_correct: false,
          previously_correct: true,
          points_earned: 0,
          ...summary,
        } as any;
      }
      throw err;
    }
  }

  // Create new quiz (creator only)
  @Post('quizzes')
  @ApiOperation({ summary: 'Create a new quiz (creator only)' })
  async createQuiz(
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    console.log('📤 Create quiz request:', dto);
    if (user.role !== 'creator' && user.role !== 'admin') {
      throw new ForbiddenException('Hanya creator yang dapat menambahkan quiz');
    }

    return this.quizzesService.create(dto, user.userId);
  }

  // Get quiz attempts by profile
  @Get('profiles/:profileId/quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts by profile' })
  async getAttemptsByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`📥 Fetching quiz attempts for profile ${profileId}`);
    return this.quizzesService.getAttemptsByProfile(profileId, user.userId);
  }

  // Check if quiz already attempted
  @Get('quizzes/:quizId/attempt/:profileId')
  @ApiOperation({ summary: 'Check if quiz was already attempted by profile' })
  async checkAttempt(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`📥 Checking attempt for quiz ${quizId}, profile ${profileId}`);
    return this.quizzesService.checkAttempt(quizId, profileId, user.userId);
  }

  // Provide a hint (an incorrect option id) or reveal correct option when requested
  @Get('quizzes/:quizId/hint')
  @ApiOperation({ summary: 'Get a hint for a quiz (incorrect option id) or reveal the correct option' })
  async getHint(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Query('reveal') reveal?: string,
  ) {
    const doReveal = reveal === '1' || reveal === 'true';
    console.log(`📥 Hint request for quiz ${quizId}, reveal=${doReveal}`);
    const res = await this.quizzesService.getHintOption(quizId, doReveal);
    if (!res) {
      return { message: 'No hint available' };
    }
    return res;
  }
}