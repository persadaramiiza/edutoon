import { PartialType } from '@nestjs/swagger';
import { CreateVideoDto } from './create-video.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, IsIn } from 'class-validator';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  video_url?: string;

  @ApiPropertyOptional({ enum: ['youtube', 'vimeo', 'native'] })
  @IsOptional()
  @IsIn(['youtube', 'vimeo', 'native'])
  platform?: 'youtube' | 'vimeo' | 'native';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;
}