import { NewUser, User } from "@/constants/user";
import { API_ENDPOINTS } from "@/constants/api";
import { apiService } from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

class AuthService {
    /**
     * Đăng ký user mới
     */
    register = async(user: NewUser): Promise<string> => {
        const response = await apiService.post<{ _id: string }>(API_ENDPOINTS.AUTH.REGISTER, user, false);
        return response._id;
    }

    /**
     * Đăng nhập
     */
    login = async({email, password} : {email: string, password: string}): Promise<Omit<User, "password">> => {
        const response = await apiService.post<{ 
            access_token: string;
            user: Omit<User, "password"> & { _id: string };
        }>(API_ENDPOINTS.AUTH.LOGIN, { email, password }, false);
        
        // Lưu token
        await AsyncStorage.setItem('auth_token', response.access_token);
        
        return {
            id: response.user._id,
            username: response.user.username,
            email: response.user.email,
            image: response.user.image,
        };
    }

    /**
     * Đăng xuất
     */
    logout = async (): Promise<void> => {
        await AsyncStorage.removeItem('auth_token');
    }

    /**
     * Đổi mật khẩu
     */
    changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        await apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
            currentPassword,
            newPassword,
        });
    }
}

export const authService = new AuthService();
