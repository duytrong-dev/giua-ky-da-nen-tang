import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) 
    private userModel: Model<UserDocument>, // Model<UserDocument> là một generic type, nó đại diện cho kiểu của model trong Mongoose.
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return (await this.userModel.findOne({ email }).exec()) as UserDocument | null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    ).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Phân tích email domains và trả về thống kê
   */
  async analyzeEmailDomains(): Promise<{
    totalUsers: number;
    domains: Array<{
      domain: string;
      count: number;
      percentage: number;
    }>;
    mostUsedDomain: string | null;
  }> {
    const users = await this.userModel.find().select('email').exec();
    const domainCount: Record<string, number> = {};

    users.forEach((user) => {
      if (user.email) {
        const domain = user.email.split('@')[1];
        if (domain) {
          domainCount[domain] = (domainCount[domain] || 0) + 1;
        }
      }
    });

    const totalUsers = users.length;
    const domains = Object.entries(domainCount)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100 * 100) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const mostUsedDomain = domains.length > 0 ? domains[0].domain : null;

    return {
      totalUsers,
      domains,
      mostUsedDomain,
    };
  }
}

