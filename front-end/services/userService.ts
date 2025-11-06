import { NewUser, User } from "@/constants/user";
import { API_ENDPOINTS } from "@/constants/api";
import { apiService } from "./apiService";

/**
 * Service class để xử lý các API liên quan đến User
 */
class UserService {
    /**
     * Tạo mới người dùng
     * @param user - Thông tin người dùng mới
     * @returns ID của người dùng vừa tạo
     */
    createUser = async (user: NewUser): Promise<string> => {
        const response = await apiService.post<{ _id: string }>(API_ENDPOINTS.USERS.BASE, user);
        return response._id;
    }

    /**
     * Lấy tất cả người dùng
     * @returns Danh sách tất cả người dùng
     */
    getAllUsers = async (): Promise<User[]> => {
        const users = await apiService.get<(User & { _id: string })[]>(API_ENDPOINTS.USERS.BASE);
        
        return users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            image: user.image,
        })) as User[];
    }

    /**
     * Lấy thông tin người dùng theo ID
     * @param id - ID của người dùng
     * @returns Thông tin người dùng hoặc null nếu không tìm thấy
     */
    getUserById = async (id: string): Promise<User | null> => {
        try {
            const user = await apiService.get<User & { _id: string }>(API_ENDPOINTS.USERS.BY_ID(id));
            return {
                id: user._id || id,
                username: user.username,
                email: user.email,
                image: user.image,
            } as User;
        } catch (error) {
            throw error; // Re-throw để hook có thể xử lý
        }
    }

    /**
     * Lấy thông tin người dùng theo email (thông qua profile endpoint)
     * @param email - Email của người dùng
     * @returns Thông tin người dùng hoặc null nếu không tìm thấy
     */
    getUserByEmail = async (email: string): Promise<User | null> => {
        try {
            const user = await apiService.get<User & { _id: string }>(API_ENDPOINTS.AUTH.PROFILE);
            if (user.email === email) {
                return {
                    id: user._id || '',
                    username: user.username,
                    email: user.email,
                    image: user.image,
                } as User;
            }
            return null;
        } catch (error) {
            throw error; // Re-throw để hook có thể xử lý
        }
    }

    /**
     * Cập nhật thông tin người dùng theo ID
     * @param id - ID của người dùng
     * @param data - Dữ liệu cần cập nhật
     */
    updateUser = async (id: string, data: Partial<NewUser>): Promise<void> => {
        await apiService.patch(API_ENDPOINTS.USERS.BY_ID(id), data);
    }

    /**
     * Xóa người dùng theo ID
     * @param id - ID của người dùng cần xóa
     */
    deleteUser = async (id: string): Promise<void> => {
        await apiService.delete(API_ENDPOINTS.USERS.BY_ID(id));
    }
}

export const userService = new UserService();
