import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const user = await this.usersService.create(registerDto);
    const userDoc = user as any;
    const userObj = userDoc.toObject ? userDoc.toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    const userDoc = user as any;
    const payload = { email: user.email, sub: userDoc._id?.toString() || userDoc.id };
    const userObj = userDoc.toObject ? userDoc.toObject() : user;
    const { password, ...userWithoutPassword } = userObj;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // Lấy user với password để verify (findByEmail sẽ trả về user với password)
    const userDoc = await this.usersService.findOne(userId);
    if (!userDoc) {
      throw new UnauthorizedException('User không tồn tại');
    }

    const user = await this.usersService.findByEmail(userDoc.email);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    // Verify mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Hash mật khẩu mới và cập nhật
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Đổi mật khẩu thành công' };
  }
}

