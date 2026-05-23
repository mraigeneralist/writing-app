import { Stack } from 'expo-router';

import { palette } from '@/theme';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.bg },
        headerShadowVisible: false,
        headerTintColor: palette.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: palette.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="articles" options={{ headerShown: false }} />
      <Stack.Screen
        name="idea-capture"
        options={{ presentation: 'modal', title: 'New idea' }}
      />
      <Stack.Screen name="note/[id]" options={{ title: '' }} />
      <Stack.Screen name="danger" options={{ title: 'Danger Mode' }} />
    </Stack>
  );
}
