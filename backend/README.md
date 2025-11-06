# Backend API - NestJS + MongoDB

Backend API cho ứng dụng quản lý người dùng với tích hợp OpenAI và Cloudinary.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình các biến môi trường trong `.env`:
- `PORT`: Port cho server (mặc định: 3000)
- `MONGODB_URI`: URI kết nối MongoDB (mặc định: mongodb://localhost:27017/giua-ky)
- `JWT_SECRET`: Secret key cho JWT (nên thay đổi trong production)
- `CLOUDINARY_CLOUD_NAME`: Cloud name của Cloudinary
- `CLOUDINARY_API_KEY`: API key của Cloudinary
- `CLOUDINARY_API_SECRET`: API secret của Cloudinary
- `OPENAI_API_KEY`: API key của OpenAI

4. Chạy server:
```bash
npm run start:dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Lấy thông tin user hiện tại (cần JWT token)

### Users
- `GET /users` - Lấy tất cả users (cần JWT token)
- `GET /users/count` - Lấy số lượng users (cần JWT token)
- `GET /users/:id` - Lấy user theo ID (cần JWT token)
- `POST /users` - Tạo user mới (cần JWT token)
- `PATCH /users/:id` - Cập nhật user (cần JWT token)
- `DELETE /users/:id` - Xóa user (cần JWT token)

### Cloudinary
- `POST /cloudinary/upload` - Upload ảnh từ file (cần JWT token)
- `POST /cloudinary/upload-url` - Upload ảnh từ URL (cần JWT token)

### Chat
- `POST /chat/message` - Gửi tin nhắn tới OpenAI (cần JWT token)

## Cấu trúc dự án

```
src/
├── auth/          # Authentication module (JWT)
├── users/         # Users module (CRUD)
├── cloudinary/    # Cloudinary service cho upload ảnh
├── chat/          # OpenAI chat module
└── main.ts        # Entry point
```

## Authentication

API sử dụng JWT Bearer token. Thêm header sau vào các request cần authentication:
```
Authorization: Bearer <your-token>
```

Token được trả về khi đăng nhập thành công tại `/auth/login`.
