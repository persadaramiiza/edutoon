import { IsNumber, IsNotEmpty, IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateQuizOptionDto {
  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsNotEmpty()
  option_text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_correct: boolean;
}

export class CreateQuizDto {
  @ApiProperty({ example: 1, description: 'Video ID' })
  @IsNumber()
  @IsNotEmpty()
  videoId: number;

  @ApiProperty({ example: 30, description: 'Timestamp in seconds when quiz appears' })
  @IsNumber()
  @IsNotEmpty()
  timestamp_seconds: number;

  @ApiProperty({ example: 'Apa ibukota Indonesia?' })
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @ApiProperty({ 
    type: [CreateQuizOptionDto],
    example: [
      { option_text: 'Jakarta', is_correct: true },
      { option_text: 'Bandung', is_correct: false },
      { option_text: 'Surabaya', is_correct: false },
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  options: CreateQuizOptionDto[];
}