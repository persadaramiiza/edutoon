import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({ example: 1, description: 'Quiz ID' })
  @IsNumber()
  @IsNotEmpty()
  quizId: number;

  @ApiProperty({ example: 1, description: 'Profile ID (anak)' })
  @IsNumber()
  @IsNotEmpty()
  profileId: number;

  @ApiProperty({ example: 1, description: 'Selected option ID' })
  @IsNumber()
  @IsNotEmpty()
  selectedOptionId: number;
}