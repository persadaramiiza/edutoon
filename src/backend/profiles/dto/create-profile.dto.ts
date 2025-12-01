import { IsNotEmpty, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'Anak 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ example: 6, description: 'Usia anak (0-18)' })
  @IsNumber()
  @Min(0)
  @Max(18)
  age_group: number;
}