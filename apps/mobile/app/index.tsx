import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '@momeants/design';

// Root route: decide where the user lands based on auth state.
export default function Index() {
  const { userId, isOnboarded, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink900, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.auraPurple} />
      </View>
    );
  }

  if (!userId) return <Redirect href="/(auth)/welcome" />;
  if (!isOnboarded) return <Redirect href="/(onboarding)/your-name" />;
  return <Redirect href="/(tabs)/home" />;
}
