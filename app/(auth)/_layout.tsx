import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 👈 Ẩn toàn bộ header trong nhóm (auth)
      }}
    />
  );
}