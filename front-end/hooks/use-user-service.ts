import { NewUser, User } from '@/constants/user';
import { userService } from '@/services/userService';
import { useToast } from '@/store/ToastContext';
import { useState } from 'react';

/**
 * Hook để tạo mới người dùng
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const createUser = async (user: NewUser): Promise<string | null> => {
    setLoading(true);
    try {
      const userId = await userService.createUser(user);
      toast.show('Tạo người dùng mới thành công', 'success');
      return userId;
    } catch (err: any) {
      const errorMessage = err?.message || 'Tạo người dùng mới thất bại';
      console.error('Error creating user:', err);
      toast.show(errorMessage, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
}

/**
 * Hook để lấy tất cả người dùng
 */
export function useGetAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể tải danh sách người dùng';
      console.error('Error fetching users:', err);
      toast.show(errorMessage, 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { users, fetchUsers, loading };
}

/**
 * Hook để lấy thông tin người dùng theo ID
 */
export function useGetUserById() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchUserById = async (id: string): Promise<User | null> => {
    setLoading(true);
    try {
      const data = await userService.getUserById(id);
      setUser(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể tải thông tin người dùng';
      console.error('Error fetching user:', err);
      toast.show(errorMessage, 'error');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { user, fetchUserById, loading };
}

/**
 * Hook để lấy thông tin người dùng theo email
 */
export function useGetUserByEmail() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchUserByEmail = async (email: string): Promise<User | null> => {
    setLoading(true);
    try {
      const data = await userService.getUserByEmail(email);
      setUser(data);
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Không thể tải thông tin người dùng';
      console.error('Error fetching user by email:', err);
      toast.show(errorMessage, 'error');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { user, fetchUserByEmail, loading };
}

/**
 * Hook để cập nhật thông tin người dùng
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const updateUser = async (id: string, data: Partial<NewUser>): Promise<boolean> => {
    setLoading(true);
    try {
      await userService.updateUser(id, data);
      toast.show('Cập nhật người dùng thành công', 'success');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Cập nhật người dùng thất bại';
      console.error('Error updating user:', err);
      toast.show(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading };
}

/**
 * Hook để xóa người dùng
 */
export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const deleteUser = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await userService.deleteUser(id);
      toast.show('Xóa người dùng thành công', 'success');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Xóa người dùng thất bại';
      console.error('Error deleting user:', err);
      toast.show(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading };
}
