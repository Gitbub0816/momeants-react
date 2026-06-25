import { Tabs } from 'expo-router';
import { MomeantsTabBar } from '../../src/components/navigation/MomeantsTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <MomeantsTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="timeline" />
      <Tabs.Screen name="capture" />
      <Tabs.Screen name="circle" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
