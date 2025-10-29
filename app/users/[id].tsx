import ParallaxScrollView from '@/components/parallax-scroll-view';
import { PopupUpdateForm } from '@/components/popup-update-form';
import { ThemedView } from '@/components/themed-view';
import { User } from '@/constants/user';
import { useDeleteUser, useGetUserById } from '@/hooks/use-user-service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const { user, loading, fetchUserById } = useGetUserById();
  const { deleteUser } = useDeleteUser();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserById(id as string);
  }, [id]);

  if (loading) return <Text>Loading...</Text>;

  const handleDelete = async () => {
    Alert.alert(
      "Xóa Người Dùng",
      "Bạn có chắc muốn xóa người dùng không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: async () => {
          await deleteUser(id as string)
          router.replace('/')
        }, style: "destructive" }
      ],
      { cancelable: true }
    );
  }

  const handleUpdate = async() => {
    setPopupVisible(true);
  }

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
        </ThemedView>
      }
    >
      <ThemedView style={styles.userDetailsContainer}>
        {user ? (
          <>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.detail}>Email: {user.email}</Text>
            <View style={styles.detailPass}>
              <Text style={styles.password}>Mật khẩu</Text>
              <Text style={styles.password}>{user.password}</Text>
            </View>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Cập nhật</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
            
          </>
        ) : (
          <Text style={styles.detail}>User not found</Text>
        )}
      </ThemedView>
    </ParallaxScrollView>

    <PopupUpdateForm visible={isPopupVisible} onClose={() => setPopupVisible(false)} user={user as User}/>
    </>
  )
}

const styles = StyleSheet.create({
  userDetailsContainer: {
    padding: 10,
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailPass: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center', // Center the label and content
    display: 'flex',
    flexDirection: 'column'
  },
  password: {
    fontSize: 16,
    textAlign: 'center', // Center the password
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: '#61DAFB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%'
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%'
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#61DAFB',
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    zIndex: 1000,
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: [{ translateX: -60 }],
  },
});