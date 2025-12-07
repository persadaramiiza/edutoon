import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { SaveVideoProgressDto } from './dto/save-video-progress.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '../auth/role.enum';
import { QuizzesService } from '../quizzes/quizzes.service';
import { CreateQuizDto } from '../quizzes/dto/create-quiz.dto';

@ApiTags('Videos')
@Controller('api/videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly quizzesService: QuizzesService,
  ) {}

   // ==================== CREATE VIDEO ====================
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create video baru' })
  async createVideo(@Body() dto: CreateVideoDto, @CurrentUser() user: JwtUser) {
    return this.videosService.create(dto, user.userId);
  }

  // ==================== CREATE QUIZ FOR VIDEO (Moved to QuizzesController) ====================
  /*
  @Post(':videoId/quizzes')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create quiz untuk video' })
  async createQuiz(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: JwtUser,
  ) {
    // Ensure videoId in DTO matches URL param
    dto.videoId = videoId;
    return this.quizzesService.create(dto, user.userId);
  }
  */

  // ==================== GET QUIZZES FOR VIDEO ====================
  @Get(':videoId/quizzes')
  @ApiOperation({ summary: 'Get all quizzes for a video' })
  async getQuizzesForVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    console.log(`📥 Fetching quizzes for video ${videoId}`);
    return this.quizzesService.getQuizzesForVideo(videoId);
  }

  // ==================== GET RANDOMIZED QUIZZES FOR VIDEO ====================
  @Get(':videoId/quizzes/random/:profileId')
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

  // ==================== GET ALL VIDEOS ====================
  @Get()
  @ApiOperation({ summary: 'Get semua published videos' })
  async getVideos(
    @CurrentUser() user: JwtUser,
    @Query() pagination: PaginationDto,
    @Query('profileId') profileId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.videosService.getAll(
      pagination,
      profileId ? Number(profileId) : undefined,
      search,
      category,
    );
  }

  // ==================== GET MY VIDEOS ====================
  @Get('my-videos')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get videos milik creator' })
  async getMyVideos(@CurrentUser() user: JwtUser) {
    return this.videosService.getByCreator(user.userId);
  }

  // ==================== GET QUIZZES BY VIDEO (Legacy/Duplicate - Removed) ====================
  /*
  @Get(':videoId/quizzes')
  @ApiOperation({ summary: 'Get quizzes untuk video' })
  async getVideoQuizzes(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.videosService.getQuizzes(videoId);
  }
  */

  // ==================== GET VIDEO PROGRESS ====================
  @Get(':id/progress/:profileId')
  @ApiOperation({ summary: 'Get video progress' })
  async getProgress(
    @Param('id', ParseIntPipe) videoId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.getProgress(videoId, profileId, user.userId);
  }

  // ==================== GET VIDEO BY ID (LAST) ====================
  @Get(':id')
  @ApiOperation({ summary: 'Get video detail by ID' })
  async getVideoById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.findById(id);
  }

  // ==================== UPDATE VIDEO ====================
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update video' })
  async updateVideo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.update(id, dto, user.userId);
  }

  // ==================== PUBLISH VIDEO ====================
  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Publish video' })
  async publishVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.publish(id, user.userId);
  }

  // ==================== ARCHIVE VIDEO ====================
  @Patch(':id/archive')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Archive video' })
  async archiveVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.archive(id, user.userId);
  }

  // ==================== SAVE VIDEO PROGRESS ====================
  @Post(':id/progress')
  @ApiOperation({ summary: 'Save video progress' })
  async saveProgress(
    @Param('id', ParseIntPipe) videoId: number,
    @Body() dto: SaveVideoProgressDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.saveProgress(videoId, dto, user.userId);
  }

  // ✅ FIX: INCREMENT VIEW - gunakan POST bukan GET
  @Post(':id/view')
  @ApiOperation({ summary: 'Increment video view count' })
  async incrementView(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    console.log(`👁 Incrementing view for video ${id}`);
    return this.videosService.incrementView(id);
  }

  // ==================== DELETE VIDEO ====================
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete video' })
  async deleteVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.delete(id, user.userId);
  }
}