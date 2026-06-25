import { Stack } from 'expo-router';
import { colors } from '@momeants/design';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ink900 },
        animation: 'slide_from_right',
      }}
    />
  );
}
