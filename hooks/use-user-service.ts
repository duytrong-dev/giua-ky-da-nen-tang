import { NewUser, User } from '@/constants/user';
import { userService } from '@/services/userService';
import { useToast } from '@/store/ToastContext';
import { useState } from 'react';

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const createUser = async (user: NewUser) => {
    setLoading(true);
    try {
      await userService.createUser(user);
      toast.show('Tạo người dùng mới thành công', 'success')
    } catch (err: any) {
      console.log('Error creating user:', err);
      toast.show('Tạo người dùng mới thất bại', 'error')
    } finally {
      setLoading(false);
    }
  }

  return { createUser, loading };
}

export function useGetAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.log('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  return { users, fetchUsers, loading };
}

export function useGetUserById() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserById = async (id: string) => {
    setLoading(true);
    try {
      const data = await userService.getUserById(id);
      setUser(data);
    } catch (err: any) {
      console.log('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, fetchUserById, loading };
}

export function useGetUserByEmail() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserByEmail = async (email: string) => {
    setLoading(true);
    try {
      const data = await userService.getUserByEmail(email);
      setUser(data);
    } catch (err: any) {
      console.log('Error fetching user by email:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, fetchUserByEmail, loading };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const updateUser = async (id: string, data: Partial<NewUser>) => {
    setLoading(true);
    try {
      await userService.updateUser(id, data);
      toast.show('Cập nhật người dùng thành công', 'success')
    } catch (err: any) {
      console.log('Error updating user:', err);
      toast.show('Cập nhật người dùng thất bại', 'error')
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await userService.deleteUser(id);
      toast.show('Xóa người dùng thành công', 'success')
    } catch (err: any) {
      console.log('Error deleting user:', err);
      toast.show('Xóa người dùng thất bại', 'error')
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading };
}