import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/store/AuthContext';

const HomeIcon = ({ color }: { color: string }) => (
  <IconSymbol size={28} name="house.fill" color={color} />
);

const SettingIcon = ({ color }: { color: string }) => (
  <IconSymbol size={28} name="gear" color={color} />
);

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login"/>;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#61DAFB',
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Cài đặt',
          tabBarIcon: SettingIcon,
        }}
      />
    </Tabs>
  );
}
