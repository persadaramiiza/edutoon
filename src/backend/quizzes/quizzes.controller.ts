import { Controller, Get, Param, ParseIntPipe, UseGuards, Post, Body } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // GET /api/videos/:videoId/quizzes
  @UseGuards(JwtAuthGuard)
  @Get('api/videos/:videoId/quizzes')
  async getQuizzesForVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    return this.quizzesService.getQuizzesForVideo(videoId);
  }

  // POST /api/quiz/submit
  @UseGuards(JwtAuthGuard)
  @Post('api/quiz/submit')
  async submitQuiz(
    @CurrentUser() user: JwtUser,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitAnswer(dto, user.userId);
  }
}
