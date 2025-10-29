import { NewUser, User } from "@/constants/user";
import { hashPassword } from "@/lib/crypto";
import { db } from "@/lib/firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

class UserService {
    private readonly userCollection = collection(db, "users");
    /**
     * Tạo mới người dùng 
     */   
    createUser = async (user: NewUser): Promise<string> => {
        const passwordHash: string = await hashPassword(user.password)
        const newUser: NewUser = {
            ...user,
            password: passwordHash
        }
        const docRef = await addDoc(this.userCollection, newUser)
        return docRef.id
    }

    /**
     * Lấy tất cả user
     */
    getAllUsers = async (): Promise<User[]> => {
        const snapshot = await getDocs(this.userCollection)
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as User[]
    }

    /**
     * Lấy user theo ID
     */
    getUserById = async (id: string): Promise<User | null> => {
        const docRef = doc(db, "users", id)
        const snapshot = await getDoc(docRef)
        if (!snapshot.exists()) return null
        return { id: snapshot.id, ...snapshot.data() } as User
    }

    /**
     * Lấy user theo email
     */
    getUserByEmail = async (email: string): Promise<User | null> => {
        const q = query(this.userCollection, where("email", "==", email))
        const snapshot = await getDocs(q)
        if (snapshot.empty) return null
        const docSnap = snapshot.docs[0]
        return { id: docSnap.id, ...docSnap.data() } as User
    }

    /**
     * Cập nhật thông tin user theo ID
     */
    updateUser = async (id: string, data: Partial<NewUser>): Promise<void> => {
      const docRef = doc(db, "users", id)
      await updateDoc(docRef, data)
    }

    /**
     * Xóa user theo ID
     */
    deleteUser = async (id: string): Promise<void> => {
      const docRef = doc(db, "users", id)
      await deleteDoc(docRef)
    }
}

export const userService = new UserService()
