import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/store/AuthContext';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';

// Hide the native header for this route (we manage our own headers in-screen)
export const options = {
  headerShown: false,
};

const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return 'Email là bắt buộc';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email không hợp lệ';
  }
  return '';
};

const validateUsername = (username: string): string => {
  if (!username.trim()) {
    return 'Họ và tên là bắt buộc';
  }
  if (username.trim().length < 3) {
    return 'Họ và tên phải có ít nhất 3 ký tự';
  }
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) {
    return 'Mật khẩu là bắt buộc';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return '';
};

export default function RegisterScreen() {

  const router = useRouter();
  
  const { register, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; email?: boolean; password?: boolean }>({});

  // Animation cho logo React
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 5000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

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

  const validateForm = (): boolean => {
    const newErrors: { username?: string; email?: string; password?: string } = {};
    
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    await register({ username, email, password, image: image || undefined });
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (touched.username) {
      setErrors(prev => ({ ...prev, username: validateUsername(text) }));
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(text) }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(text) }));
    }
  };

  const handleUsernameBlur = () => {
    setTouched(prev => ({ ...prev, username: true }));
    setErrors(prev => ({ ...prev, username: validateUsername(username) }));
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoWrapper, animatedStyle]}>
              <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Tạo tài khoản mới</ThemedText>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="camera" size={32} color="#666" />
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                <View style={styles.editIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.subtitle}>Chạm vào avatar để thêm ảnh đại diện</ThemedText>
          </View>

          <View style={styles.form}>
          <View>
            <View style={[
              styles.inputContainer,
              errors.username ? styles.inputContainerError : null
            ]}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={errors.username ? "#ff3b30" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput 
                placeholder="Họ và tên" 
                value={username} 
                onChangeText={handleUsernameChange}
                onBlur={handleUsernameBlur}
                style={styles.input}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          <View>
            <View style={[
              styles.inputContainer,
              errors.email ? styles.inputContainerError : null
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={errors.email ? "#ff3b30" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput 
                placeholder="Email" 
                value={email} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                style={styles.input}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View>
            <View style={[
              styles.inputContainer,
              errors.password ? styles.inputContainerError : null
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={errors.password ? "#ff3b30" : "#666"} 
                style={styles.inputIcon} 
              />
              <TextInput 
                placeholder="Mật khẩu" 
                value={password} 
                secureTextEntry={!showPassword} 
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.passwordIcon}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <Pressable 
              onPress={handleRegister}
              style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <ThemedText style={styles.buttonText}>Đăng ký</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <ThemedText>Đã có tài khoản?</ThemedText>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <ThemedText type="link" style={styles.link}>Đăng nhập</ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  keyboardView: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    width: 80,
    height: 80,
  },
  logo: {
    width: 80,
    height: 80,
  },
  inner: { 
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: { 
    fontSize: 24,
    marginTop: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 12
  },
  inputContainerError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  input: { 
    flex: 1,
    padding: 12,
    fontSize: 16
  },
  inputIcon: {
    marginRight: 8
  },
  passwordIcon: {
    padding: 8
  },
  button: { 
    backgroundColor: '#0a84ff', 
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  buttonPressed: { 
    opacity: 0.9 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8
  },
  buttonIcon: {
    marginLeft: 4
  },
  footer: { 
    flexDirection: 'row',
    marginTop: 16,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: { 
    marginLeft: 6,
    color: '#0a84ff',
    fontWeight: '600'
  },
});
