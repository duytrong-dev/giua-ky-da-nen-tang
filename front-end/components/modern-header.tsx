import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/store/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';

interface ModernHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  rightComponent?: React.ReactNode;
}

export function ModernHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  showSearch = false,
  rightComponent,
}: ModernHeaderProps) {
  const { isDark } = useTheme();

  return (
    <ThemedView style={[styles.header, isDark && styles.headerDark]}>
      <View style={styles.headerTop}>
        <View style={styles.titleContainer}>
          {typeof title === 'string' ? (
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
          ) : (
            title
          )}
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
        {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#999"
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerDark: {
    backgroundColor: '#151718',
    borderBottomColor: '#2a2a2a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  rightComponent: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

