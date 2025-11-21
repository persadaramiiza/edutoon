import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, Post, Body } from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';

@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // GET /api/videos?profileId=1
  @UseGuards(JwtAuthGuard)
  @Get()
  async getVideos(
    @CurrentUser() user: JwtUser,
    @Query('profileId') profileId?: string,
  ) {
    const profileIdNum = profileId ? Number(profileId) : undefined;

    return this.videosService.findAll({
      profileId: profileIdNum,
      currentUserId: user.userId,
    });
  }

  // GET /api/videos/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getVideoById(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findOneById(id);
  }

  // sementara: endpoint buat masukin video dummy (tanpa upload beneran)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createVideo(
    @Body()
    body: {
      title: string;
      description?: string;
      video_url: string;
      thumbnail_url?: string;
      duration_seconds?: number;
      min_age?: number;
    },
  ) {
    return this.videosService.create(body);
  }
}
