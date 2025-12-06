import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Video } from './video.entity';
import { VideoProgress } from './video-progress.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { SaveVideoProgressDto } from './dto/save-video-progress.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(VideoProgress)
    private readonly progressRepo: Repository<VideoProgress>,
    private readonly profilesService: ProfilesService,
    private readonly quizzesService: QuizzesService,
  ) {}

  // ==================== CREATE ====================
  async create(dto: CreateVideoDto, userId: number): Promise<Video> {
    console.log(`✨ Creating video: ${dto.title}`);

    const video = this.videoRepo.create({
      ...dto,
      creator_id: userId,
      status: 'draft',
      view_count: 0,
    });

    const saved = await this.videoRepo.save(video);
    console.log(`✅ Video created with ID: ${saved.id}`);
    return saved;
  }

  // ==================== GET ALL ====================
  async getAll(
    pagination: PaginationDto,
    profileId?: number,
    search?: string,
    category?: string,
  ): Promise<{ data: Video[]; total: number; page: number; limit: number }> {
    console.log(`📥 Fetching videos:`, { profileId, search, category, ...pagination });

    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 10, 100);
    const skip = (page - 1) * limit;

    const query = this.videoRepo.createQueryBuilder('v');

    // Only published videos
    query.where('v.status = :status', { status: 'published' });

    // Filter by age group
    if (profileId) {
      const profile = await this.profilesService.findOne(profileId);
      if (profile) {
        console.log(`🎯 Filtering videos for age: ${profile.age_group}`);
        
        query.andWhere('v.min_age <= :age AND v.max_age >= :age', {
          age: profile.age_group,
        });
      }
    }

    // Search by title/description
    if (search) {
      query.andWhere(
        '(v.title LIKE :search OR v.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by category
    if (category) {
      query.andWhere('v.category = :category', { category });
    }

    // Load creator info
    query.leftJoinAndSelect('v.creator', 'creator');

    // Sort by created date
    query.orderBy('v.created_at', 'DESC');

    const [data, total] = await query
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    console.log(`✅ Found ${total} videos (page: ${page})`);
    return { data, total, page, limit };
  }

  // ==================== GET BY CREATOR ====================
  async getByCreator(userId: number): Promise<Video[]> {
    console.log(`📥 Fetching videos for creator ${userId}`);

    const videos = await this.videoRepo.find({
      where: { creator_id: userId },
      relations: ['creator'],
      order: { created_at: 'DESC' },
    });

    console.log(`✅ Found ${videos.length} videos`);
    return videos;
  }

  // ==================== GET BY ID ====================
  async findById(id: number): Promise<Video> {
    const video = await this.videoRepo.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!video) {
      throw new NotFoundException(`Video dengan ID ${id} tidak ditemukan`);
    }

    console.log(`✅ Video found: ${video.title}`);
    return video;
  }

  // ==================== UPDATE ====================
  async update(id: number, dto: UpdateVideoDto, userId: number): Promise<Video> {
    console.log(`📝 Updating video ${id}`);

    const video = await this.findById(id);

    // Check ownership
    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa mengedit video ini');
    }

    // Can only edit draft videos
    if (video.status !== 'draft') {
      throw new BadRequestException('Hanya draft video yang bisa diedit');
    }

    Object.assign(video, dto);
    const updated = await this.videoRepo.save(video);

    console.log(`✅ Video updated`);
    return updated;
  }

  // ==================== PUBLISH ====================
  async publish(id: number, userId: number): Promise<Video> {
    console.log(`📤 Publishing video ${id}`);

    const video = await this.findById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa publish video ini');
    }

    video.status = 'published';
    video.published_at = new Date();

    const updated = await this.videoRepo.save(video);
    console.log(`✅ Video published`);
    return updated;
  }

  // ==================== ARCHIVE ====================
  async archive(id: number, userId: number): Promise<Video> {
    console.log(`📦 Archiving video ${id}`);

    const video = await this.findById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa archive video ini');
    }

    video.status = 'archived';
    const updated = await this.videoRepo.save(video);

    console.log(`✅ Video archived`);
    return updated;
  }

  // ==================== SAVE PROGRESS ====================
  async saveProgress(
    videoId: number,
    dto: SaveVideoProgressDto,
    userId: number,
  ): Promise<VideoProgress> {
    console.log(`💾 Saving progress: video ${videoId}, profile ${dto.profileId}`);

    // Verify profile ownership
    const profile = await this.profilesService.findOneByUser(dto.profileId, userId);
    if (!profile) {
      throw new ForbiddenException('Profile bukan milik Anda');
    }

    // Verify video exists
    await this.findById(videoId);

    let progress = await this.progressRepo.findOne({
      where: {
        video_id: videoId,
        profile_id: dto.profileId,
      },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        video_id: videoId,
        profile_id: dto.profileId,
      });
    }

    progress.timestamp_seconds = dto.timestampSeconds;
    progress.is_completed = dto.isCompleted || false;
    progress.updated_at = new Date();

    const saved = await this.progressRepo.save(progress);
    console.log(`✅ Progress saved at ${dto.timestampSeconds}s`);
    return saved;
  }

  // ==================== GET PROGRESS ====================
  async getProgress(
    videoId: number,
    profileId: number,
    userId: number,
  ): Promise<VideoProgress | null> {
    console.log(`📊 Getting progress: video ${videoId}, profile ${profileId}`);

    // Verify profile ownership
    const profile = await this.profilesService.findOneByUser(profileId, userId);
    if (!profile) {
      throw new ForbiddenException('Profile bukan milik Anda');
    }

    const progress = await this.progressRepo.findOne({
      where: { video_id: videoId, profile_id: profileId },
    });

    if (progress) {
      console.log(`✅ Progress found at ${progress.timestamp_seconds}s`);
    } else {
      console.log(`ℹ️ No progress found`);
    }

    return progress || null;
  }

  // ==================== GET QUIZZES BY VIDEO ====================
  async getQuizzes(videoId: number): Promise<any[]> {
    console.log(`📥 Fetching quizzes for video ${videoId}`);
    return this.quizzesService.getQuizzesForVideo(videoId);
  }

  // ==================== INCREMENT VIEW ====================
  async incrementView(id: number): Promise<Video> {
    console.log(`👁 Incrementing view for video ${id}`);

    const video = await this.findById(id);
    video.view_count = (video.view_count || 0) + 1;

    const updated = await this.videoRepo.save(video);
    console.log(`✅ View count: ${updated.view_count}`);
    return updated;
  }

  // ==================== DELETE ====================
  async delete(id: number, userId: number): Promise<void> {
    console.log(`🗑️ Deleting video ${id}`);

    const video = await this.findById(id);

    if (video.creator_id !== userId) {
      throw new ForbiddenException('Anda tidak bisa delete video ini');
    }

    await this.videoRepo.remove(video);
    console.log(`✅ Video deleted`);
  }
}