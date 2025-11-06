import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email đăng nhập',
    example: 'user@example.com' 
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Mật khẩu',
    example: 'password123' 
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

