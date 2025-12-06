import { IsNotEmpty, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveVideoProgressDto {
  @ApiProperty({ example: 1, description: 'Profile ID' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  profileId: number;

  @ApiProperty({ example: 150, description: 'Current timestamp in seconds' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  timestampSeconds: number;

  @ApiProperty({ example: false, description: 'Is video completed' })
  @IsBoolean()
  isCompleted?: boolean;
}