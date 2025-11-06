import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Tên người dùng',
    example: 'Nguyễn Văn A' 
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'Email',
    example: 'user@example.com' 
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'password123',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    description: 'URL ảnh đại diện',
    example: 'https://cloudinary.com/image.jpg' 
  })
  @IsOptional()
  @IsString()
  image?: string;
}

