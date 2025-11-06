import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@ApiTags('cloudinary')
@ApiBearerAuth('JWT-auth')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload ảnh lên Cloudinary từ file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Upload thành công, trả về URL ảnh' })
  @ApiResponse({ status: 400, description: 'Không có file hoặc file không hợp lệ' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    return { url: imageUrl };
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Upload ảnh lên Cloudinary từ URL' })
  @ApiResponse({ status: 200, description: 'Upload thành công, trả về URL ảnh' })
  @ApiResponse({ status: 400, description: 'URL không hợp lệ' })
  async uploadImageFromUrl(@Body() body: { url: string }) {
    const imageUrl = await this.cloudinaryService.uploadImageFromUrl(body.url);
    return { url: imageUrl };
  }
}

