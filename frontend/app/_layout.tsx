import { Stack } from 'expo-router';

// Root Stack — Splash, Login, Register, saha (tabs) group eka
// (tabs) folder eke Bottom Tab Bar thiyanawa
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      {/* (tabs) = home, profile, manager-dashboard (hidden tab), … — Tab bar nested wenawa */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
