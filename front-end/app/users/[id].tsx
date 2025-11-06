import { ModernHeader } from '@/components/modern-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDeleteUser, useGetUserById, useUpdateUser } from '@/hooks/use-user-service';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator, Animated, TextInput } from 'react-native';

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const { user, loading, fetchUserById } = useGetUserById();
  const { deleteUser } = useDeleteUser();
  const { updateUser, loading: updating } = useUpdateUser();
  const { isDark } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const saveScaleAnim = useState(new Animated.Value(1))[0];
  const deleteScaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (id) {
      fetchUserById(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setImage(user.image);
      setNewPassword('');
    }
  }, [user]);

  const handleDelete = async () => {
    Alert.alert(
      'Xóa Người Dùng',
      'Bạn có chắc muốn xóa người dùng này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            Animated.sequence([
              Animated.timing(deleteScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(deleteScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
            
            await deleteUser(id as string);
            toast.show('Đã xóa người dùng thành công', 'success');
            router.back();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
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
          toast.show('Đã tải ảnh thành công', 'success');
        } catch (error: any) {
          const errorMessage = error?.message || 'Không thể tải ảnh';
          console.error('Error uploading image:', error);
          toast.show(errorMessage, 'error');
        } finally {
          setUploading(false);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Không thể chọn ảnh';
      console.error('Error picking image:', error);
      toast.show(errorMessage, 'error');
      setUploading(false);
    }
  };

  const handleSave = async () => {
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

    // Validate password if provided
    if (newPassword.trim() && newPassword.length < 6) {
      toast.show('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    Animated.sequence([
      Animated.timing(saveScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const updateData: any = {
      username: username.trim(),
      email: email.trim(),
      image,
    };
    
    // Only update password if new password is provided
    if (newPassword.trim()) {
      updateData.password = newPassword.trim();
    }
    
    const success = await updateUser(user.id, updateData);
    
    if (success) {
      // Reset password field if updated
      if (newPassword.trim()) {
        setNewPassword('');
      }
      // Refresh user data
      await fetchUserById(user.id);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ModernHeader
          title="Chi tiết người dùng"
          subtitle="Thông tin cá nhân"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#61DAFB" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ModernHeader
          title="Chi tiết người dùng"
          subtitle="Thông tin cá nhân"
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#999" />
          <ThemedText style={styles.emptyText}>Không tìm thấy người dùng</ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.headerContainer, isDark && styles.headerContainerDark]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#333'} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Chi tiết người dùng</ThemedText>
          <View style={styles.placeholder} />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <ThemedView style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
              <Image
                source={image ? { uri: image } : user.image ? { uri: user.image } : require('@/assets/images/avatar.png')}
                style={styles.avatar}
              />
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.avatarHint}>Chạm để thay đổi ảnh đại diện</ThemedText>
          </ThemedView>

          {/* User Info Card */}
          <ThemedView style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <ThemedText type="title" style={styles.sectionTitle}>Thông tin cá nhân</ThemedText>
            
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="person-outline" size={20} color={isDark ? '#9BA1A6' : '#666'} style={styles.inputIcon} />
              <TextInput
                placeholder="Tên người dùng"
                placeholderTextColor={isDark ? '#9BA1A6' : '#999'}
                value={username}
                onChangeText={setUsername}
                style={[styles.input, isDark && styles.inputDark]}
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="mail-outline" size={20} color={isDark ? '#9BA1A6' : '#666'} style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor={isDark ? '#9BA1A6' : '#999'}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, isDark && styles.inputDark]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9BA1A6' : '#666'} style={styles.inputIcon} />
              <TextInput
                placeholder="Mật khẩu mới (để trống nếu không đổi)"
                placeholderTextColor={isDark ? '#9BA1A6' : '#999'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, isDark && styles.inputDark]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={isDark ? '#9BA1A6' : '#666'}
                />
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Animated.View style={[{ transform: [{ scale: saveScaleAnim }] }]}>
              <TouchableOpacity
                style={[styles.saveButton, updating && styles.saveButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <ThemedText style={styles.saveButtonText}>Lưu thay đổi</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <ThemedText style={styles.deleteButtonText}>Xóa người dùng</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContainerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#2a2a2a',
  },
  backButtonHeader: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#61DAFB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#61DAFB',
  },
  avatarBadge: {
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
  avatarHint: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
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
    marginBottom: 24,
  },
  infoCardDark: {
    backgroundColor: '#1e1e1e',
    shadowOpacity: 0.3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoItemLast: {
    marginBottom: 0,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
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
  inputWrapperDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
  },
  inputIcon: {
    marginRight: 8,
  },
  passwordIcon: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputDark: {
    color: '#fff',
  },
  actionsContainer: {
    gap: 12,
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
