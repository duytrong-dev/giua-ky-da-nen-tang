import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private async getSystemContext(): Promise<string> {
    const userCount = await this.usersService.count();
    const emailAnalysis = await this.usersService.analyzeEmailDomains();
    
    // Tạo danh sách domain với tỉ lệ
    const domainList = emailAnalysis.domains
      .slice(0, 10) // Top 10 domains
      .map((d) => `- ${d.domain}: ${d.count} người dùng (${d.percentage}%)`)
      .join('\n');

    return `Bạn là một trợ lý AI thông minh cho hệ thống quản lý người dùng. 
            Hệ thống hiện tại có ${userCount} người dùng.
            
            Thống kê email domains:
            ${emailAnalysis.totalUsers > 0 ? `Domain được sử dụng nhiều nhất: ${emailAnalysis.mostUsedDomain || 'Chưa có dữ liệu'}
            
            Top email domains:
            ${domainList || 'Chưa có dữ liệu'}
            ` : 'Chưa có dữ liệu người dùng'}
            
            Bạn có thể trả lời các câu hỏi về:
            - Số lượng người dùng
            - Phân tích email domains (loại email nào được dùng nhiều, tỉ lệ các loại email)
            - Các chức năng của hệ thống
            
            Khi người dùng hỏi về email domains, hãy trả lời chi tiết và có thể kèm theo số liệu thống kê.
            Hãy trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp.`;
  }

  async chat(message: string): Promise<string> {
    try {
      // Kiểm tra nếu câu hỏi liên quan đến email domains
      const lowerMessage = message.toLowerCase();
      const isEmailQuestion = 
        lowerMessage.includes('email') || 
        lowerMessage.includes('domain') || 
        lowerMessage.includes('tỉ lệ') ||
        lowerMessage.includes('phân tích') ||
        lowerMessage.includes('loại email') ||
        lowerMessage.includes('được sử dụng nhiều');

      let systemContext = await this.getSystemContext();

      // Nếu là câu hỏi về email, thêm thông tin chi tiết hơn
      if (isEmailQuestion) {
        const emailAnalysis = await this.usersService.analyzeEmailDomains();
        const detailedInfo = 
          `
            Thông tin chi tiết về email domains:
            - Tổng số người dùng: ${emailAnalysis.totalUsers}
            - Domain phổ biến nhất: ${emailAnalysis.mostUsedDomain || 'Chưa có dữ liệu'}
            Chi tiết từng domain:
            ${emailAnalysis.domains.map((d, index) => 
              `${index + 1}. ${d.domain}: ${d.count} người dùng (${d.percentage}%)`
            ).join('\n')}
          `.trim();
        
        systemContext += '\n\n' + detailedInfo;
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemContext,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new HttpException(
        'Không thể kết nối tới OpenAI. Vui lòng kiểm tra API key.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

