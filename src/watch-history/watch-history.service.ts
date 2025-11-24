import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from './watch-history.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { Video } from '../videos/video.entity';

@Injectable()
export class WatchHistoryService {
    constructor(
        @InjectRepository(WatchHistory)
        private readonly watchRepo: Repository<WatchHistory>,
        @InjectRepository(Video)
        private readonly videoRepo: Repository<Video>,
        private readonly profilesService: ProfilesService,
    ) { }

    async saveProgress(options: {
        userId: number;
        profileId: number;
        videoId: number;
        timestampSeconds: number;
        isCompleted?: boolean;
    }) {
        const { userId, profileId, videoId, timestampSeconds } = options;

        const profile = await this.profilesService.findOneOwnedByUser(profileId, userId);
        if (!profile) {
            throw new ForbiddenException('Profile not found or not owned by user');
        }

        const video = await this.videoRepo.findOne({ where: { id: videoId } });
        if (!video) {
            throw new NotFoundException('Video not found');
        }


        const marginSeconds = 5;
        let autoCompleted = false;

        if (
            typeof video.duration_seconds === 'number' &&
            video.duration_seconds > 0 &&
            timestampSeconds >= video.duration_seconds - marginSeconds
        ) {
            autoCompleted = true;
        }

        let record = await this.watchRepo.findOne({
            where: { profile_id: profileId, video_id: videoId },
        });

        if (!record) {
            record = this.watchRepo.create({
                profile_id: profileId,
                video_id: videoId,
                last_position_seconds: timestampSeconds,
                is_completed: autoCompleted,
            });
        } else {
            // jangan turunin posisi kalau user rewind – bisa pilih:
            // a) selalu update, atau
            // b) simpan progress maksimum
            // Di sini kita pakai maksimum:
            record.last_position_seconds = Math.max(
                record.last_position_seconds,
                timestampSeconds,
            );

            // sekali completed, jangan dibikin false lagi
            record.is_completed = record.is_completed || autoCompleted;
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

    async getContinueWatching(profileId: number, userId: number) {
        const profile = await this.profilesService.findOneOwnedByUser(profileId, userId);
        if (!profile) {
            throw new ForbiddenException('Profile not found or not owned by user');
        }

        const qb = this.watchRepo
            .createQueryBuilder('wh')
            .innerJoinAndSelect('wh.video', 'v')
            .where('wh.profile_id = :profileId', { profileId })
            .andWhere('wh.is_completed = false')
            .andWhere('wh.last_position_seconds > 0')
            .orderBy('wh.updated_at', 'DESC');

        const rows = await qb.getMany();

        return rows.map((row) => {
            const duration = row.video.duration_seconds || 0;

            let percent = 0;
            if (duration > 0) {
                percent = (row.last_position_seconds / duration) * 100;
            }

            // batas maksimum 100%
            percent = Math.min(percent, 100);

            // bulatkan ke 2 angka desimal
            percent = Math.round(percent * 100) / 100;

            return {
                profileId: row.profile_id,
                videoId: row.video_id,
                last_position_seconds: row.last_position_seconds,
                is_completed: row.is_completed,
                updated_at: row.updated_at,

                progress_percent: percent,

                video: {
                    id: row.video.id,
                    title: row.video.title,
                    description: row.video.description,
                    thumbnail_url: row.video.thumbnail_url,
                    duration_seconds: duration,
                    min_age: row.video.min_age,
                },
            };
        });
    }

    async getRecentVideos(profileId: number, userID: number) {
        const profile = await this.profilesService.findOneOwnedByUser(profileId, userID);
        if (!profile) {
            throw new ForbiddenException('Profile not found of not owned by user');
        }

        const rows = await this.watchRepo
            .createQueryBuilder('wh')
            .innerJoinAndSelect('wh.video', 'v')
            .where('wh.profile_id = :profileId', { profileId })
            .orderBy('wh.updated_at', 'DESC')
            .getMany();

        return rows.map((row) => {
            const duration = row.video.duration_seconds || 0;

            let percent = 0;
            if (duration > 0) {
                percent = Math.min((row.last_position_seconds / duration) * 100, 100);
            }
            percent = Math.round(percent * 100) / 100;

            return {
                profileId: row.profile_id,
                videoId: row.video_id,
                progress_percent: percent,
                last_position_seconds: row.last_position_seconds,
                is_completed: row.is_completed,
                updated_at: row.updated_at,
                video: {
                    id: row.video.id,
                    title: row.video.title,
                    description: row.video.description,
                    thumbnail_url: row.video.thumbnail_url,
                    duration_seconds: row.video.duration_seconds,
                    min_age: row.video.min_age,
                },
            };
        });
    }
}   