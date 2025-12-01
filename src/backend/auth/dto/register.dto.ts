import { IsEmail, MinLength, IsOptional, IsEnum, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({ 
    example: 'Password123!',
    description: 'Min 8 karakter, harus mengandung huruf besar, huruf kecil, dan angka'
  })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(50, { message: 'Password maksimal 50 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;

  @ApiProperty({ example: 'Nama Lengkap', required: false })
  @IsOptional()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name?: string;

  @ApiProperty({ 
    enum: [Role.PARENT, Role.CREATOR], 
    example: Role.PARENT,
    description: 'Pilih role: parent atau creator',
    required: false,
  })
  @IsOptional()
  @IsEnum([Role.PARENT, Role.CREATOR], { 
    message: 'Role harus parent atau creator' 
  })
  role?: Role.PARENT | Role.CREATOR;
}