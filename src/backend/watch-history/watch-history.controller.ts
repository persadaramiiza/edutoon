import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt-user.interface';

@Controller('api/video')
export class WatchHistoryController {
    constructor(private readonly watchHistoryService: WatchHistoryService) { }

    // dipanggil frontend setiap ~10 detik
    // Body: { profileId, videoId, timestampSeconds, isCompleted? }
    @UseGuards(JwtAuthGuard)
    @Post('progress')
    async saveProgress(
        @CurrentUser() user: JwtUser,
        @Body() dto: SaveProgressDto,
    ) {
        const record = await this.watchHistoryService.saveProgress({
            userId: user.sub,
            profileId: dto.profileId,
            videoId: dto.videoId,
            timestampSeconds: dto.timestampSeconds,
            isCompleted: dto.isCompleted,
        });

        return {
            profileId: record.profile_id,
            videoId: record.video_id,
            last_position_seconds: record.last_position_seconds,
            is_completed: record.is_completed,
            updated_at: record.updated_at,
        };
    }

    // GET /api/video/1/progress?profileId=2
    @UseGuards(JwtAuthGuard)
    @Get(':videoId/progress')
    async getProgress(
        @CurrentUser() user: JwtUser,
        @Param('videoId', ParseIntPipe) videoId: number,
        @Query('profileId') profileIdStr: string,
    ) {
        const profileId = Number(profileIdStr);
        const record = await this.watchHistoryService.getProgress(profileId, videoId, user.userId);

        if (!record) {
            return {
                profileId,
                videoId,
                last_position_seconds: 0,
                is_completed: false,
            };
        }

        return {
            profileId: record.profile_id,
            videoId: record.video_id,
            last_position_seconds: record.last_position_seconds,
            is_completed: record.is_completed,
        };
    }
    @UseGuards(JwtAuthGuard)
    @Get('continue-watching')
    async getContinueWatching(
        @CurrentUser() user: JwtUser,
        @Query('profileId') profileIdStr: string,
    ) {
        const profileId = Number(profileIdStr);
        const list = await this.watchHistoryService.getContinueWatching(
            profileId,
            user.userId,
        );
        return list;
    }
    @UseGuards(JwtAuthGuard)
    @Get('recent')
    async getRecent(
        @CurrentUser() user: JwtUser,
        @Query('profileId') profileIdStr: string,
    ) {
        const profileId = Number(profileIdStr);
        return this.watchHistoryService.getRecentVideos(profileId, user.userId);
    }
}
