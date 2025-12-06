import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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
    
    return this.quizzesService.submitAnswer(dto, user.userId);
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
}