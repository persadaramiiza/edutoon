import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './watch-history.entity';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private readonly watchRepo: Repository<WatchHistory>,
    private readonly profilesService: ProfilesService,
  ) {}

  async saveProgress(options: {
    userId: number;
    profileId: number;
    videoId: number;
    timestampSeconds: number;
    isCompleted?: boolean;
  }) {
    const { userId, profileId, videoId, timestampSeconds, isCompleted } = options;

    // pastikan profil memang milik user yg login
    const profile = await this.profilesService.findOneOwnedByUser(profileId, userId);
    if (!profile) {
      // lempar ForbiddenException di controller biar pesan rapih, atau di sini juga boleh
      throw new Error('Profile not found or not owned by user');
    }

    let record = await this.watchRepo.findOne({
      where: { profile_id: profileId, video_id: videoId },
    });

    if (!record) {
      record = this.watchRepo.create({
        profile_id: profileId,
        video_id: videoId,
        last_position_seconds: timestampSeconds,
        is_completed: !!isCompleted,
      });
    } else {
      record.last_position_seconds = timestampSeconds;
      if (isCompleted !== undefined) {
        record.is_completed = isCompleted;
      }
      record.updated_at = new Date();
    }

    return this.watchRepo.save(record);
  }

  async getProgress(profileId: number, videoId: number, userId: number) {
    const profile = await this.profilesService.findOneOwnedByUser(profileId, userId);
    if (!profile) {
      return null;
    }

    return this.watchRepo.findOne({
      where: { profile_id: profileId, video_id: videoId },
    });
  }
}
