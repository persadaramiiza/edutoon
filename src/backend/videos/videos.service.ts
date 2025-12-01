import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoPlatform, VideoStatus } from './video.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { PaginationDto, createPaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video)
    private readonly videosRepo: Repository<Video>,
    private readonly profilesService: ProfilesService,
  ) {}

  // Extract video ID dari URL
  private extractVideoId(url: string, platform: VideoPlatform): string | undefined {
    switch (platform) {
      case VideoPlatform.YOUTUBE:
        const ytRegex =
          /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const ytMatch = url.match(ytRegex);
        return ytMatch ? ytMatch[1] : undefined;

      case VideoPlatform.VIMEO:
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        return vimeoMatch ? vimeoMatch[1] : undefined;

      default:
        return undefined;
    }
  }

  // Auto-detect platform dari URL
  private detectPlatform(url: string): VideoPlatform {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return VideoPlatform.YOUTUBE;
    } else if (url.includes('vimeo.com')) {
      return VideoPlatform.VIMEO;
    }
    return VideoPlatform.NATIVE;
  }

  // Generate thumbnail URL otomatis
  private generateThumbnailUrl(
    videoId: string | undefined,
    platform: VideoPlatform,
  ): string | undefined {
    if (!videoId) return undefined;
    
    switch (platform) {
      case VideoPlatform.YOUTUBE:
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      default:
        return undefined;
    }
  }

  // List video, optional filter by profile with pagination
  async findAll(options?: { 
    profileId?: number; 
    currentUserId?: number;
    pagination?: PaginationDto;
  }) {
    const qb = this.videosRepo.createQueryBuilder('v');

    // Hanya tampilkan video PUBLISHED
    qb.where('v.status = :status', { status: VideoStatus.PUBLISHED });

    if (options?.profileId && options?.currentUserId) {
      const profile = await this.profilesService.findOne(options.profileId);

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      if (profile.userId !== options.currentUserId) {
        throw new ForbiddenException('Profile does not belong to this user');
      }

      qb.andWhere('v.min_age <= :age', { age: profile.age_group });
    }

    qb.orderBy('v.created_at', 'DESC');

    // Apply pagination
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [videos, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return createPaginatedResult(videos, total, page, limit);
  }

  async findOneById(id: number) {
    const video = await this.videosRepo.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Increment view count
    await this.videosRepo.increment({ id }, 'view_count', 1);

    return video;
  }

  async create(dto: CreateVideoDto, creatorId?: number) {
    // Auto-detect platform jika tidak diisi
    const platform = dto.platform || this.detectPlatform(dto.video_url);

    // Extract video ID
    const videoId = this.extractVideoId(dto.video_url, platform);

    // Auto-generate thumbnail jika tidak diisi
    const thumbnailUrl = dto.thumbnail_url || this.generateThumbnailUrl(videoId, platform);

    const video = this.videosRepo.create({
      title: dto.title,
      description: dto.description,
      video_url: dto.video_url,
      video_id: videoId,
      thumbnail_url: thumbnailUrl,
      platform: platform,
      duration_seconds: dto.duration_seconds,
      min_age: dto.min_age ?? 0,
      max_age: dto.max_age,
      category: dto.category,
      creator_id: creatorId,
      status: VideoStatus.DRAFT,
    });

    return this.videosRepo.save(video);
  }

  async update(id: number, dto: UpdateVideoDto, userId: number) {
    const video = await this.findOneById(id);

    // Cek ownership - video harus milik user ini
    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah video ini');
    }

    // Update platform & video_id jika URL berubah
    if (dto.video_url) {
      const platform = dto.platform || this.detectPlatform(dto.video_url);
      const videoId = this.extractVideoId(dto.video_url, platform);

      video.platform = platform;
      video.video_id = videoId;

      // Update thumbnail jika tidak diisi
      if (!dto.thumbnail_url) {
        video.thumbnail_url = this.generateThumbnailUrl(videoId, platform);
      }
    }

    Object.assign(video, dto);
    return this.videosRepo.save(video);
  }

  async publish(id: number, userId: number) {
    const video = await this.findOneById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mempublish video ini');
    }

    video.status = VideoStatus.PUBLISHED;
    return this.videosRepo.save(video);
  }

  async archive(id: number, userId: number) {
    const video = await this.findOneById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengarsipkan video ini');
    }

    video.status = VideoStatus.ARCHIVED;
    return this.videosRepo.save(video);
  }

  async remove(id: number, userId: number) {
    const video = await this.findOneById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus video ini');
    }

    // Soft delete
    await this.videosRepo.softRemove(video);
    return { message: 'Video berhasil dihapus' };
  }

  async findByCreator(creatorId: number) {
    return this.videosRepo.find({
      where: { creator_id: creatorId },
      order: { created_at: 'DESC' },
    });
  }
}