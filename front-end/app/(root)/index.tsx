import { ModernHeader } from '@/components/modern-header';
import { UserDropdown } from '@/components/user-dropdown';
import { PopupForm } from '@/components/popup-form';
import SkeletonUserList from '@/components/skeleton-user-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDeleteUser, useGetAllUsers } from '@/hooks/use-user-service';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { useToast } from '@/store/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Alert, StyleSheet, ScrollView, TouchableOpacity, Animated, View, ActivityIndicator, TextInput } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const { users, fetchUsers, loading } = useGetAllUsers();
  const { isDark } = useTheme();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isDeleteUser, setIsDeleteUser] = useState(false);
  const { deleteUser } = useDeleteUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Xóa Người Dùng',
      'Bạn có chắc muốn xóa người dùng không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await deleteUser(id);
              // Refresh danh sách users sau khi xóa thành công
              await fetchUsers();
            } catch (error) {
              // Error đã được xử lý trong useDeleteUser hook
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [isPopupVisible]);

  // Refresh users khi quay lại trang home (từ setting hoặc các trang khác)
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleAddUser = () => {
    setPopupVisible(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.id !== user?.id &&
      (u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statsData: Array<{
    label: string;
    value: number | string;
    icon: string;
    color: string;
    onPress?: () => void;
  }> = [
    { label: 'Tổng người dùng', value: users.length, icon: 'people', color: '#61DAFB' },
  ];

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.headerContainer, isDark && styles.headerContainerDark]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerTextContainer}>
                <ThemedText type="title" style={styles.headerTitle}>
                  Xin chào,
                </ThemedText>
                <ThemedText style={styles.headerUsername}>{user?.username || 'User'}!</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Quản lý người dùng của bạn</ThemedText>
              </View>
            </View>
            <View style={styles.headerRight}>
              <UserDropdown />
            </View>
          </View>
          <View style={styles.searchContainer}>
            <View style={[styles.searchWrapper, isDark && styles.searchWrapperDark]}>
              <Ionicons name="search" size={20} color={isDark ? '#9BA1A6' : '#666'} style={styles.searchIcon} />
              <TextInput
                placeholder="Tìm kiếm theo tên hoặc email..."
                placeholderTextColor={isDark ? '#9BA1A6' : '#999'}
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={[styles.searchInput, isDark && styles.searchInputDark]}
              />
            </View>
          </View>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <TouchableOpacity
                key={index}
                onPress={stat.onPress}
                activeOpacity={stat.onPress ? 0.7 : 1}
                disabled={!stat.onPress}
                style={styles.statCardWrapper}
              >
                <ThemedView style={[styles.statCard, stat.onPress && styles.statCardPressable]}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                    <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  </View>
                  <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </View>

          {/* User List */}
          <ThemedText type="title" style={styles.sectionTitle}>
            Danh sách người dùng
          </ThemedText>

          {loading ? (
            <SkeletonUserList />
          ) : filteredUsers.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#999" />
              <ThemedText style={styles.emptyText}>
                {searchTerm ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.userListContainer}>
              {filteredUsers.map((u) => (
                <Animated.View key={u.id} style={styles.userCardWrapper}>
                  <Link href={`/users/${u.id}`}>
                    <Link.Trigger>
                      <TouchableOpacity
                        style={[styles.userCard, isDark && styles.userCardDark]}
                        onPress={() => router.push(`/users/${u.id}`)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.userCardContent}>
                          <Image
                            source={u.image ? { uri: u.image } : require('@/assets/images/avatar.png')}
                            style={styles.userCardAvatar}
                          />
                          <View style={styles.userCardInfo}>
                            <ThemedText style={styles.userCardUsername}>{u.username}</ThemedText>
                            <ThemedText style={styles.userCardEmail}>{u.email}</ThemedText>
                          </View>
                        </View>
                        <View style={styles.userCardActions}>
                          <TouchableOpacity
                            style={styles.userCardActionButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              router.push(`/users/${u.id}`);
                            }}
                          >
                            <Ionicons name="create-outline" size={20} color="#61DAFB" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.userCardActionButton, styles.userCardDeleteButton]}
                            onPress={async(e) => {
                              e.stopPropagation();
                              await handleDelete(u.id);
                            }}
                          >
                            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Link.Trigger>
                    <Link.Preview />
                    <Link.Menu>
                      <Link.MenuAction
                        title="Cập nhật"
                        icon="cube"
                        onPress={() => router.push(`/users/${u.id}`)}
                      />
                      <Link.MenuAction
                        title="Xóa"
                        icon="trash"
                        destructive
                        onPress={() => handleDelete(u.id)}
                      />
                    </Link.Menu>
                  </Link>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>

        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={styles.fab} onPress={handleAddUser} activeOpacity={0.8}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </ThemedView>

      <PopupForm visible={isPopupVisible} onClose={() => setPopupVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCardWrapper: {
    flex: 1,
    minHeight: 140,
  },
  statCard: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  statCardPressable: {
    opacity: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  userListContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userCardWrapper: {
    width: '48%',
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  userCard: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardDark: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  userCardContent: {
    alignItems: 'center',
    marginBottom: 12,
    flex: 1,
    justifyContent: 'center',
  },
  userCardAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#61DAFB',
  },
  userCardInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userCardUsername: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  userCardEmail: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  userCardActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  userCardActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCardDeleteButton: {
    backgroundColor: '#ffe5e5',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginRight: 12,
    borderWidth: 3,
    borderColor: '#61DAFB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#61DAFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#61DAFB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 16,
    minWidth: 0,
  },
  headerTextContainer: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerUsername: {
    fontSize: 22,
    fontWeight: '700',
    color: '#61DAFB',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchContainer: {
    marginTop: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchWrapperDark: {
    backgroundColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchInputDark: {
    color: '#fff',
  },
});
