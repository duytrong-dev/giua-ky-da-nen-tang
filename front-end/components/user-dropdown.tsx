import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View, Pressable, Alert } from 'react-native';

interface UserDropdownProps {
  onThemeToggle?: () => void;
}

export function UserDropdown({ onThemeToggle }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeToggle = () => {
    toggleTheme();
    onThemeToggle?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.avatarButton}
        activeOpacity={0.8}
      >
        <Image
          source={user?.image ? { uri: user.image } : require('@/assets/images/avatar.png')}
          style={styles.avatar}
        />
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {isOpen && (
        <Pressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        />
      )}

      <Animated.View
        style={[
          styles.dropdown,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <ThemedView style={styles.dropdownContent}>
          <View style={styles.userInfo}>
            <Image
              source={user?.image ? { uri: user.image } : require('@/assets/images/avatar.png')}
              style={styles.dropdownAvatar}
            />
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>{user?.username}</ThemedText>
              <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsOpen(false);
              router.push('/(root)/setting');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="#666" />
            <ThemedText style={styles.menuItemText}>Cài đặt</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsOpen(false);
              handleThemeToggle();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={isDark ? '#61DAFB' : '#FFA500'}
            />
            <ThemedText style={styles.menuItemText}>
              {isDark ? 'Chế độ tối' : 'Chế độ sáng'}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              setIsOpen(false);
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
            <ThemedText style={[styles.menuItemText, styles.logoutText]}>
              Đăng xuất
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#61DAFB',
  },
  chevron: {
    marginLeft: 4,
    color: '#61DAFB',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 280,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dropdownAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutText: {
    color: '#ff3b30',
  },
});

