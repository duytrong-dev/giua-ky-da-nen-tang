import { NewUser, User } from "@/constants/user";
import { authService } from "@/services/authService";
import { useToast } from '@/store/ToastContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
    user: Omit<User, "password"> | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (user: NewUser) => Promise<void>;
    logout: () => Promise<void>;
    updateCurrentUser: (userUpdate: User) => Promise<void>;
}

const AuthContextValue = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {

    const toast = useToast();
    const router = useRouter();

    const [user, setUser] = useState<Omit<User, "password"> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Load user từ AsyncStorage khi app mở
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) setUser(JSON.parse(storedUser));
            } catch (err: any) {
                setError("Lỗi loading user");
                console.log("Lỗi loading user:", err);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const updateCurrentUser = async(userUpdate: User) => {
        setUser(userUpdate);
        console.log(userUpdate)
        await AsyncStorage.setItem("user", JSON.stringify(userUpdate)); // Use userUpdate here
    }
  
    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        try { 
            const loggedInUser = await authService.login({ email, password })
            setUser(loggedInUser)
            await AsyncStorage.setItem("user", JSON.stringify(loggedInUser))
            toast.show('Đăng nhập thành công', 'success')
            router.replace('/')
        } catch (err: any) {
            setError("Đăng nhập thất bại")
            console.log("Lỗi đăng nhập:", err)
            toast.show("Đăng nhập thất bại", 'error')
        } finally {
            setLoading(false)
        }
    }
  
    const register = async (newUser: Omit<User, "id">) => {
        setLoading(true)
        setError(null)
        try {
            await authService.register(newUser)
            toast.show('Đăng ký thành công', 'success')
            router.replace('/(auth)/login')
        } catch (err: any) {
            setError("Đăng ký thất bại")
            console.log("Lỗi đăng ký:", err)
            toast.show("Đăng ký thất bại", 'error')
        } finally {
            setLoading(false)
        }
    }
  
    const logout = async () => {
        setUser(null)
        await AsyncStorage.removeItem("user")
    }

    const contextValue = useMemo<AuthContextType>(() => {
        return {
            user, 
            loading,
            error,
            login,
            register,
            logout,
            updateCurrentUser
        }
    }, [user, loading, error]);
  
    return <AuthContextValue.Provider value={ contextValue }>{children}</AuthContextValue.Provider>
}


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContextValue)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}