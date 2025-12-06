import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ example: 'Belajar Perkalian' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Video tentang perkalian untuk anak SD' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsNotEmpty()
  @IsString()
  video_url: string;

  @ApiProperty({ example: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg' })
  @IsOptional()
  @IsString()
  thumbnail_url?: string; // ✅ ADD THIS

  @ApiProperty({ enum: ['youtube', 'vimeo', 'native'], default: 'youtube' })
  @IsOptional()
  @IsEnum(['youtube', 'vimeo', 'native'])
  platform?: 'youtube' | 'vimeo' | 'native';

  @ApiProperty({ example: 'Matematika' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(18)
  min_age?: number;

  @ApiProperty({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(18)
  max_age?: number;
}