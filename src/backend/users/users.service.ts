import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findOne(id: number): Promise<any> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async updateProfile(id: number, dto: UpdateUserDto): Promise<any> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Update full_name jika disediakan
    if (dto.full_name) {
      user.full_name = dto.full_name;
    }

    // Update email jika disediakan dan belum digunakan user lain
    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.usersRepo.findOne({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new BadRequestException('Email sudah digunakan');
      }

      user.email = dto.email;
    }

    // Update password jika disediakan
    if (dto.password) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password harus disediakan untuk mengubah password');
      }

      // Verifikasi password lama
      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password_hash,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Password saat ini tidak sesuai');
      }

      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(dto.password, salt);
    }

    const updatedUser = await this.usersRepo.save(user);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
    };
  }
}
