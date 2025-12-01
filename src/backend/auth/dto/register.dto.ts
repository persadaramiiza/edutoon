import { IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nama Lengkap', required: false })
  @IsOptional()
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