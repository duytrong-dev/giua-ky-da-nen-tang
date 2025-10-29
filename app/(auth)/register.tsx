import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function RegisterScreen() {

  const router = useRouter();
  const { register, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    await register({ username, email, password });
  };

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('@/assets/images/login-background.png')}
      style={styles.background}
    >
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Animated.Image source={require('@/assets/images/logo.png')} style={[styles.logo, { transform: [{ rotate: spin }] }]} />
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Tạo tài khoản mới</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Họ và tên" 
              value={username} 
              onChangeText={setUsername} 
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Email" 
              value={email} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              onChangeText={setEmail} 
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput 
              placeholder="Mật khẩu" 
              value={password} 
              secureTextEntry={!showPassword} 
              onChangeText={setPassword} 
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
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <ThemedText type="link" style={styles.link}>Đăng nhập</ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
  },
  inner: { 
    gap: 20,
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
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { 
    fontSize: 24,
    marginTop: 0,
    textAlign: 'center',
    color: '#61DAFB'
  },
  form: {
    gap: 16
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
  input: { 
    flex: 1,
    padding: 12,
    fontSize: 16
  },
  inputFocused: {
    borderColor: '#61DAFB',
  },
  inputIcon: {
    marginRight: 8
  },
  passwordIcon: {
    padding: 8
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
    flexDirection: 'column',
    paddingVertical: 24,
    gap: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  link: { 
    marginLeft: 6,
    color: '#61DAFB',
    fontWeight: '400',
    textDecorationLine: 'underline'
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#61DAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
    display: 'flex',
    flexDirection: 'row',
  },
  buttonPressed: {
    backgroundColor: '#084f7d',
    opacity: 0.9
  },
});
