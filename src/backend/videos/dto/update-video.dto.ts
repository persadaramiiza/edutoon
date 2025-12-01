import { PartialType } from '@nestjs/swagger';
import { CreateVideoDto } from './create-video.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsEnum } from 'class-validator';
import { VideoPlatform } from '../video.entity';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiPropertyOptional({ enum: VideoPlatform })
  @IsOptional()
  @IsEnum(VideoPlatform)
  platform?: VideoPlatform;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;
}