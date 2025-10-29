import { NewUser, User } from "@/constants/user";
import { comparePassword } from "@/lib/crypto";
import { userService } from "@/services/userService";

class AuthService {
    /**
     * Đăng ký user mới
     */
    register = async(user: NewUser): Promise<string> => {
        const existingUser = await userService.getUserByEmail(user.email)
        if (existingUser) throw new Error("Email đã được sử dụng")

        return userService.createUser(user)
    }

    /**
     * Đăng nhập
     */
    login = async({email, password} : {email: string, password: string}): Promise<Omit<User, "password">> => {
        const user = await userService.getUserByEmail(email)
        if (!user) throw new Error("Email không tồn tại")
        
        const isValid = await comparePassword(password, user.password)
        if (!isValid) throw new Error("Sai mật khẩu")
          
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const authService = new AuthService();
