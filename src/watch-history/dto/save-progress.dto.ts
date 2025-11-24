import { IsInt, IsPositive, Min, IsOptional, IsBoolean } from 'class-validator';

export class SaveProgressDto {
    @IsInt()
    @IsPositive()
    profileId: number;

    @IsInt()
    @IsPositive()
    videoId: number;

    @IsInt()
    @Min(0)
    timestampSeconds: number;

    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}
