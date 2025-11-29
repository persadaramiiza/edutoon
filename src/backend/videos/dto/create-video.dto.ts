import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VideoPlatform } from '../video.entity';

export class CreateVideoDto {
  @ApiProperty({ example: 'Belajar Matematika Dasar' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Video pembelajaran untuk anak', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=abc123' })
  @IsNotEmpty()
  @IsUrl()
  video_url: string;

  @ApiProperty({ enum: VideoPlatform, required: false })
  @IsOptional()
  @IsEnum(VideoPlatform)
  platform?: VideoPlatform;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @ApiProperty({ example: 300, required: false })
  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(18)
  min_age?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(18)
  max_age?: number;

  @ApiProperty({ example: 'matematika', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}