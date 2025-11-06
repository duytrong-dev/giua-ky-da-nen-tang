// API Configuration
// For Android Emulator: use 'http://10.0.2.2:3000'
// For iOS Simulator: use 'http://localhost:3000'
// For Physical Device: use your computer's IP address (e.g., 'http://192.168.1.100:3000')
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    COUNT: `${API_BASE_URL}/users/count`,
  },
  CLOUDINARY: {
    UPLOAD: `${API_BASE_URL}/cloudinary/upload`,
    UPLOAD_URL: `${API_BASE_URL}/cloudinary/upload-url`,
  },
  CHAT: {
    MESSAGE: `${API_BASE_URL}/chat/message`,
  },
};

