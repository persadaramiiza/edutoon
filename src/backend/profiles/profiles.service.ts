import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
  ) {}

  async create(dto: CreateProfileDto, userId: number): Promise<Profile> {
    const profile = this.profilesRepo.create({
      name: dto.name,
      avatar_url: dto.avatar_url,
      age_group: dto.age_group,
      userId: userId,
    });

    return this.profilesRepo.save(profile);
  }

  async findAllByUser(userId: number): Promise<Profile[]> {
    return this.profilesRepo.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Profile | null> {
    return this.profilesRepo.findOne({ where: { id } });
  }

  async findOneByUser(id: number, userId: number): Promise<Profile> {
    const profile = await this.profilesRepo.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profile tidak ditemukan');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('Profile bukan milik Anda');
    }

    return profile;
  }

  async update(id: number, dto: UpdateProfileDto, userId: number): Promise<Profile> {
    const profile = await this.findOneByUser(id, userId);

    Object.assign(profile, dto);
    return this.profilesRepo.save(profile);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const profile = await this.findOneByUser(id, userId);

    // Soft delete
    await this.profilesRepo.softRemove(profile);
    return { message: 'Profile berhasil dihapus' };
  }
}