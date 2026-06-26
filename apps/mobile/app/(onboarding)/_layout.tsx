import { Stack } from 'expo-router';
import { colors } from '@momeants/design';
import { OnboardingProvider } from '../../src/context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ink900 },
          animation: 'slide_from_right',
        }}
      />
    </OnboardingProvider>
  );
}
