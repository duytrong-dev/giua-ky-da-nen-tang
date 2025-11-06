import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@/constants/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(url: string, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(includeAuth),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      }
      throw error;
    }
  }

  async post<T>(url: string, data?: any, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        
        // Xử lý error từ ValidationPipe (có thể là array hoặc object)
        let errorMsg = 'Request failed';
        
        if (Array.isArray(error.message)) {
          errorMsg = error.message.join(', ');
        } else if (typeof error.message === 'string') {
          errorMsg = error.message;
        } else if (error.error) {
          errorMsg = typeof error.error === 'string' ? error.error : 'Request failed';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      }
      throw error;
    }
  }

  async patch<T>(url: string, data: any, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: await this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        
        // Xử lý error từ ValidationPipe (có thể là array hoặc object)
        let errorMsg = 'Request failed';
        
        if (Array.isArray(error.message)) {
          errorMsg = error.message.join(', ');
        } else if (typeof error.message === 'string') {
          errorMsg = error.message;
        } else if (error.error) {
          errorMsg = typeof error.error === 'string' ? error.error : 'Request failed';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      }
      throw error;
    }
  }

  async delete<T>(url: string, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getHeaders(includeAuth),
      });

      if (!response.ok) {
        // Xử lý lỗi: thử parse JSON, nếu không được thì dùng statusText
        let errorMessage = response.statusText;
        try {
          const errorText = await response.text();
          if (errorText) {
            const error = JSON.parse(errorText);
            errorMessage = error.message || error.error || errorMessage;
          }
        } catch {
          // Nếu không parse được JSON, dùng statusText
        }
        throw new Error(errorMessage || 'Request failed');
      }

      // Response thành công: kiểm tra xem có body không
      const contentType = response.headers.get('content-type');
      
      // Nếu không có content-type hoặc không phải JSON, trả về empty object
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      // Thử đọc và parse JSON
      try {
        const text = await response.text();
        // Nếu text rỗng, trả về empty object
        if (!text || text.trim() === '') {
          return {} as T;
        }
        return JSON.parse(text) as T;
      } catch (parseError) {
        // Nếu parse lỗi (thường là do response rỗng), trả về empty object
        // Đây là trường hợp hợp lệ khi DELETE thành công và không trả về body
        return {} as T;
      }
    } catch (error: any) {
      // Nếu là lỗi JSON parse từ response thành công, không throw
      // vì đã xử lý ở trên (trả về empty object)
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      }
      throw error;
    }
  }

  async uploadFile(url: string, file: any, includeAuth = true): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'image.jpg',
      } as any);

      const headers: HeadersInit = {};
      if (includeAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || 'Upload failed');
      }

      return response.json();
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();

