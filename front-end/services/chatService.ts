import { API_ENDPOINTS } from "@/constants/api";
import { apiService } from "./apiService";

class ChatService {
  /**
   * Gửi tin nhắn tới OpenAI
   */
  sendMessage = async (message: string): Promise<string> => {
    const response = await apiService.post<{ response: string }>(
      API_ENDPOINTS.CHAT.MESSAGE,
      { message }
    );
    return response.response;
  };
}

export const chatService = new ChatService();

