import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCreateUser } from '@/hooks/use-user-service';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';

interface PopupFormProps {
  visible: boolean;
  onClose: () => void;
}

export function PopupForm({ visible, onClose }: PopupFormProps) {
  const toast = useToast();
  const { isDark } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  const { createUser, loading } = useCreateUser();

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        if (focusedInput) {
          // Nhảy form lên khi keyboard hiện
          Animated.timing(translateY, {
            toValue: 60,
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Trả form về vị trí ban đầu khi keyboard ẩn
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [focusedInput]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.show('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (password.length < 6) {
      toast.show('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.show('Email không hợp lệ', 'error');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const newUser = {
        username: username.trim(),
        email: email.trim(),
        password,
        image: imageUrl,
      };
      
      // Hook đã xử lý toast, chỉ cần check success
      const userId = await createUser(newUser);
      
      if (userId) {
        setUsername('');
        setEmail('');
        setPassword('');
        setImage(null);
        onClose();
      }
    } catch (error: any) {
      // Error đã được xử lý trong hook
      console.error('Error in handleSave:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modal,
              isDark && styles.modalDark,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Thêm người dùng mới
              </ThemedText>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Avatar */}
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={pickImage}
                disabled={uploading}
              >
                <Image
                  source={
                    image
                      ? { uri: image }
                      : require('@/assets/images/avatar.png')
                  }
                  style={styles.avatar}
                />
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Tên người dùng</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Nhập tên người dùng"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={username}
                  onChangeText={setUsername}
                  editable={!loading && !uploading}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Nhập email"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading && !uploading}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Mật khẩu</ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, isDark && styles.inputDark]}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading && !uploading}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={isDark ? '#999' : '#666'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={loading || uploading}
                >
                  <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, (loading || uploading) && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={loading || uploading}
                >
                  {loading || uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>Tạo</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 120,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalDark: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flexGrow: 0,
  },
  content: {
    padding: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#61DAFB',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#61DAFB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#3a3a3a',
    color: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#61DAFB',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
