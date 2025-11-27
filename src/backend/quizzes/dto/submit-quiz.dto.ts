import { IsInt, IsPositive } from 'class-validator';

export class SubmitQuizDto {
  @IsInt()
  @IsPositive()
  quizId: number;

  @IsInt()
  @IsPositive()
  optionId: number;

  @IsInt()
  @IsPositive()
  profileId: number; // profil anak yang lagi aktif
}
