import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';

@ApiTags('Videos')
@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create video baru (Creator/Admin only)' })
  async createVideo(
    @Body() dto: CreateVideoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.create(dto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar semua video (published)' })
  @ApiQuery({ name: 'profileId', required: false })
  async getVideos(
    @CurrentUser() user: JwtUser,
    @Query('profileId') profileId?: string,
  ) {
    return this.videosService.findAll({
      profileId: profileId ? Number(profileId) : undefined,
      currentUserId: user.sub,
    });
  }

  @Get('my-videos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Daftar video milik creator' })
  async getMyVideos(@CurrentUser() user: JwtUser) {
    return this.videosService.findByCreator(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail video' })
  async getVideoById(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update video' })
  async updateVideo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.update(id, dto, user.sub);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish video' })
  async publishVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.publish(id, user.sub);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive video' })
  async archiveVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.archive(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus video' })
  async deleteVideo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.videosService.remove(id, user.sub);
  }
}