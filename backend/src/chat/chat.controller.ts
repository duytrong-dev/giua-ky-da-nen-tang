import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Gửi tin nhắn tới OpenAI AI assistant' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trả về phản hồi từ AI assistant' 
  })
  @ApiResponse({ status: 503, description: 'Không thể kết nối tới OpenAI' })
  async sendMessage(@Body() chatMessageDto: ChatMessageDto) {
    const response = await this.chatService.chat(chatMessageDto.message);
    return { response };
  }
}

