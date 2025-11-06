import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'dxppwztkj',
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'user-avatars',
        },
        (error, result) => {
          if (error) {
            reject(new HttpException(
              `Upload failed: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new HttpException(
              'Upload failed: No result returned',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadImageFromUrl(url: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: 'user-avatars',
      });
      return result.secure_url;
    } catch (error) {
      throw new HttpException(
        `Failed to upload image from URL: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new HttpException(
        `Failed to delete image: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

