import { useTheme } from '@/store/ThemeContext';

export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
