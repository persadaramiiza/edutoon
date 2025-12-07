import {
  Controller,
  Get,
  Post,
  Delete,
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
@Controller('api/quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // Create new quiz
  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
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

  // NOTE: Get quizzes for video moved to VideosController

  // NOTE: Get quizzes for video moved to VideosController
  // GET /api/videos/:videoId/quizzes is handled by VideosController

  // NOTE: Get randomized quizzes moved to VideosController
  // GET /api/videos/:videoId/quizzes/random/:profileId is handled by VideosController

  // Get quiz by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  async getQuiz(@Param('id', ParseIntPipe) id: number) {
    console.log(`📥 Fetching quiz ${id}`);
    return this.quizzesService.findById(id);
  }

  // Delete quiz
  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz' })
  async deleteQuiz(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`🗑 Deleting quiz ${id}`);
    if (user.role !== 'creator' && user.role !== 'admin') {
      throw new ForbiddenException('Hanya creator yang dapat menghapus quiz');
    }
    return this.quizzesService.delete(id, user.userId);
  }

  // Submit quiz answer - CRITICAL ENDPOINT
  @Post('submit')
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
  @Post('videos/:videoId/quizzes')
  @ApiOperation({ summary: 'Create a new quiz (creator only)' })
  async createQuizForVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    console.log('📤 Create quiz request:', dto);
    if (user.role !== 'creator' && user.role !== 'admin') {
      throw new ForbiddenException('Hanya creator yang dapat menambahkan quiz');
    }
    
    // Ensure videoId in DTO matches URL param
    dto.videoId = videoId;

    return this.quizzesService.create(dto, user.userId);
  }

  // Get quiz attempts by profile - MOVED to ProfilesController
  /*
  @Get('profiles/:profileId/quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts by profile' })
  async getAttemptsByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`📥 Fetching quiz attempts for profile ${profileId}`);
    return this.quizzesService.getAttemptsByProfile(profileId, user.userId);
  }
  */

  // Check if quiz already attempted
  @Get(':quizId/attempt/:profileId')
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
  @Get(':quizId/hint')
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