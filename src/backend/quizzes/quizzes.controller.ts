import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
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

  @Get('videos/:videoId/quizzes')
  @ApiOperation({ summary: 'Get all quizzes for a video' })
  async getQuizzesForVideo(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.quizzesService.getQuizzesForVideo(videoId);
  }
  @Post('quizzes')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create new quiz (Creator only)' })
  async createQuiz(
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.quizzesService.createQuiz(dto, user.sub);
  }

  @Delete('quizzes/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete quiz (Creator only)' })
  async deleteQuiz(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.deleteQuiz(id);
  }
  @Get('quizzes/:id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findById(id);
  }

  @Post('quiz/submit')
  @ApiOperation({ summary: 'Submit quiz answer' })
  async submitQuiz(
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.quizzesService.submitAnswer(dto, user.sub);
  }

  @Get('quizzes/:quizId/attempt/:profileId')
  @ApiOperation({ summary: 'Check if quiz already attempted' })
  async checkAttempt(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.quizzesService.checkAttempt(quizId, profileId, user.sub);
  }

  @Get('profiles/:profileId/quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts by profile' })
  async getAttemptsByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.quizzesService.getAttemptsByProfile(profileId, user.sub);
  }
  
}