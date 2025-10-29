import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { PopupForm } from '@/components/popup-form';
import SkeletonUserList from '@/components/skeleton-user-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDeleteUser, useGetAllUsers } from '@/hooks/use-user-service';
import { useAuth } from '@/store/AuthContext';
import { Entypo } from '@expo/vector-icons'; // Import the icon library
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth(); // Assuming logout is available in useAuth
  const { users, fetchUsers, loading } = useGetAllUsers();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isPopupVisibleUpdate, setPopupVisibleUpdate] = useState(false);
  const [isDeleteUser, setIsDeleteUser] = useState(false);
  const { deleteUser } = useDeleteUser();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Xóa Người Dùng",
      "Bạn có chắc muốn xóa người dùng không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: async () => {
          await deleteUser(id)
          setIsDeleteUser(false)
        }, style: "destructive" }
      ],
      { cancelable: true }
    );
    router.replace('/')
  }
  
  useEffect(() => {
    fetchUsers();
  }, [isPopupVisible, isDeleteUser]);

  const handleAddUser = () => {
    setPopupVisible(true);
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#61DAFB', dark: '#61DAFB' }}
        headerImage={
          <ThemedView style={styles.headerImageContainer}>
            <Image
              source={(user && user.image) ? { uri: user.image } : require('@/assets/images/avatar.png')}
              style={styles.headerImage}
            />
            <ThemedText style={styles.userGreeting}>
              Chào mừng, {user?.username}!
            </ThemedText>
            <ThemedText style={styles.titleGreeting}>
              Trở lại với admin dashboard{' '}<HelloWave/>
            </ThemedText>

            {/* Logout Button */}
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Entypo name="log-out" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>
        }
      >
        <ThemedView style={styles.userListContainer}>
          {loading ? (
            <SkeletonUserList />
          ) : (
            users
              .filter((users) => users.id !== user?.id)
              .map((users) => (
                <ThemedView key={users.id} style={styles.userItem}>
                  <Link href={`/users/${users.id}`}>
                    <Link.Trigger>
                        <TouchableOpacity style={styles.trigger} onPress={() => router.push(`/users/${users.id}`)}>
                          <Image
                            source={users.image ? { uri: users.image } : require('@/assets/images/avatar.png')}
                            style={styles.avatar}
                          />
                          <ThemedView style={styles.userInfo}>
                            <ThemedText style={styles.username}>{users.username}</ThemedText>
                            <ThemedText style={styles.email}>{users.email}</ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                    </Link.Trigger>
                    <Link.Preview />
                    <Link.Menu>
                      <Link.MenuAction title="Cập nhật" icon="cube" onPress={() => router.push(`/users/${users.id}`)} />
                      <Link.MenuAction
                        title="Xóa"
                        icon="trash"
                        destructive
                        onPress={() => handleDelete(users.id)}
                      />
                    </Link.Menu>
                  </Link>
                </ThemedView>
              ))
          )}
        </ThemedView>
      </ParallaxScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <ThemedText style={styles.addButtonText}>+</ThemedText>
      </TouchableOpacity>

      {/* Popup Form */}
      <PopupForm visible={isPopupVisible} onClose={() => setPopupVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row'
  },
  headerImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#61DAFB',
  },
  userGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    bottom: '30%',
    left: '10%',
  },
  titleGreeting: {
    fontSize: 16,
    color: '#fff',
    position: 'absolute',
    bottom: '20%',
    left: '10%',
  },
  userListContainer: {
    padding: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(97, 218, 251, 0.1)',
    marginBottom: 10,
    borderRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    marginRight: 10,
  },
  headerImage: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    backgroundColor: '#fff',
    zIndex: 100,
    position: 'absolute',
    top: '25%',
    left: '10%',
  },
  userInfo: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#61DAFB',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: '30%',
    right: '10%',
  },
});