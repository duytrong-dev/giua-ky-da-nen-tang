import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for front-end
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Global Exception Filter - Xử lý lỗi tập trung
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // chỉ giữ lại những thuộc tính được khai báo trong DTO.
    transform: true, // tự động chuyển đổi (transform) dữ liệu nhận được từ request về đúng kiểu dữ liệu được định nghĩa trong DTO.
    forbidNonWhitelisted: true, // từ chối request nếu có thuộc tính không được phép
    transformOptions: {
      enableImplicitConversion: true, // tự động chuyển đổi kiểu dữ liệu
    },
  }));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API documentation cho hệ thống quản lý người dùng với NestJS, MongoDB, Cloudinary và OpenAI')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('cloudinary', 'Image upload endpoints')
    .addTag('chat', 'OpenAI chat endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token khi refresh trang
    },
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
