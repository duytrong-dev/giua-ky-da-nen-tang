import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, Text } from 'react-native';

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

const validatePassword = (password: string): string => {
  if (!password) {
    return 'Mật khẩu là bắt buộc';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return '';
};

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

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

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    await login(email, password);
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
            <ThemedText type="title" style={styles.title}>Đăng nhập</ThemedText>
          </View>

        <View style={styles.form}>
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
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
            onPress={handleLogin}
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.buttonText}>Đăng nhập</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText>Bạn chưa có tài khoản?</ThemedText>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <ThemedText type="link" style={styles.link}>Đăng ký</ThemedText>
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
    shadowColor: '#000',
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
  title: {
    fontSize: 24,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
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
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginRight: 8,
  },
  passwordIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#0a84ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginLeft: 6,
    color: '#0a84ff',
    fontWeight: '600',
  },
});
