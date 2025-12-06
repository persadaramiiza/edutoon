import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    required: false,
    description: 'Nama lengkap user',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    example: 'john@example.com',
    required: false,
    description: 'Email user (harus unik)',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'newPassword123',
    required: false,
    description: 'Password baru (minimal 8 karakter)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    example: 'oldPassword123',
    required: false,
    description: 'Password saat ini (diperlukan saat mengubah password)',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}
