import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepo: Repository<Video>,
    private readonly profilesService: ProfilesService,
  ) {}

  // List video, optional filter by profile
  async findAll(options?: { profileId?: number; currentUserId?: number }) {
    const qb = this.videosRepo.createQueryBuilder('v');

    if (options?.profileId && options?.currentUserId) {
      const profile = await this.profilesService.findOne(options.profileId);

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      if (profile.userId !== options.currentUserId) {
        throw new ForbiddenException('Profile does not belong to this user');
      }

      qb.where('v.min_age <= :age', { age: profile.age_group });
    }

    qb.orderBy('v.created_at', 'DESC');
    return qb.getMany();
  }

  async findOneById(id: number) {
    const video = await this.videosRepo.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  // Nanti untuk admin/creator
  async create(data: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    min_age?: number;
  }) {
    const video = this.videosRepo.create({
      title: data.title,
      description: data.description,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      duration_seconds: data.duration_seconds,
      min_age: data.min_age ?? 0,
    });
    return this.videosRepo.save(video);
  }
}
