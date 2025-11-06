import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ 
    description: 'Tin nhắn gửi tới AI assistant',
    example: 'Hệ thống hiện tại có bao nhiêu user?' 
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}

