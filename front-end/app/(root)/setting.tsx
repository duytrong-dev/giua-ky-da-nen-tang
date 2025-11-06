import { ChangePasswordModal } from '@/components/change-password-modal';
import { ModernHeader } from '@/components/modern-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGetUserById, useUpdateUser } from '@/hooks/use-user-service';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { userService } from '@/services/userService';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Animated, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';

export default function SettingScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { updateUser } = useUpdateUser();
  const { fetchUserById, user: fetchedUser } = useGetUserById();
  const { theme, toggleTheme, isDark } = useTheme();
  const toast = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [image, setImage] = useState(user?.image);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const logoutScaleAnim = useState(new Animated.Value(1))[0];
  const themeScaleAnim = useState(new Animated.Value(1))[0];

  const handleUpdate = async () => {
    if (!user?.id) {
      toast.show('Không tìm thấy thông tin người dùng', 'error');
      return;
    }

    // Validation
    if (!username.trim() || !email.trim()) {
      toast.show('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.show('Email không hợp lệ', 'error');
      return;
    }

    const success = await updateUser(user.id, { email: email.trim(), username: username.trim(), image });
    
    if (success) {
      // Fetch lại user data trực tiếp từ API để cập nhật AsyncStorage
      const updatedUser = await userService.getUserById(user.id);
      
      if (updatedUser) {
        const userData = {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          image: updatedUser.image,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Refresh user trong AuthContext để cập nhật ở tất cả các trang
        await refreshUser();
      }
      
      toast.show('Cập nhật thông tin thành công!', 'success');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setUploading(true);
        const imageUri = result.assets[0].uri;
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
          setImage(cloudinaryUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
    }
  };

  const handleThemeToggle = () => {
    Animated.sequence([
      Animated.timing(themeScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(themeScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };


  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            Animated.sequence([
              Animated.timing(logoutScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(logoutScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
            await logout();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Theme Toggle Button - Top Right */}
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => {
          Animated.sequence([
            Animated.timing(themeScaleAnim, {
              toValue: 0.9,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(themeScaleAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
          handleThemeToggle();
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={[{ transform: [{ scale: themeScaleAnim }] }]}>
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={24}
            color={isDark ? '#FFA500' : '#61DAFB'}
          />
        </Animated.View>
      </TouchableOpacity>

      <ModernHeader
        title="Cài đặt"
        subtitle="Quản lý tài khoản và cài đặt"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Avatar Section */}
        <ThemedView style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
            <Image
              source={image ? { uri: image } : require('@/assets/images/avatar.png')}
              style={styles.avatar}
            />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <Ionicons name="cloud-upload" size={32} color="#fff" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.avatarHint}>Chạm để thay đổi ảnh đại diện</ThemedText>
        </ThemedView>

        {/* Personal Info Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Thông tin cá nhân
          </ThemedText>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Họ và tên"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
            <ThemedText style={styles.updateButtonText}>Cập nhật thông tin</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Change Password Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Bảo mật
          </ThemedText>

          <TouchableOpacity
            style={styles.changePasswordCard}
            onPress={() => setShowPasswordModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.settingIconContainer, { backgroundColor: '#4CAF5020' }]}>
                <Ionicons name="lock-closed-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.settingTextContainer}>
                <ThemedText style={styles.settingTitle}>Đổi mật khẩu</ThemedText>
                <ThemedText style={styles.settingDescription}>Thay đổi mật khẩu tài khoản của bạn</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </ThemedView>

        {/* Account Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Tài khoản
          </ThemedText>

          <Animated.View style={[styles.settingCard, styles.logoutCard, { transform: [{ scale: logoutScaleAnim }] }]}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#ff3b3020' }]}>
                  <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
                </View>
                <View style={styles.settingTextContainer}>
                  <ThemedText style={[styles.settingTitle, { color: '#ff3b30' }]}>Đăng xuất</ThemedText>
                  <ThemedText style={styles.settingDescription}>Đăng xuất khỏi tài khoản</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ThemedView>
      </ScrollView>

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeButton: {
    position: 'absolute',
    top: 64,
    right: 16,
    zIndex: 1000,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#61DAFB',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#61DAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  changePasswordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  updateButton: {
    marginTop: 8,
    backgroundColor: '#61DAFB',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#61DAFB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutCard: {
    backgroundColor: '#fff5f5',
  },
  logoutButton: {
    width: '100%',
  },
});
