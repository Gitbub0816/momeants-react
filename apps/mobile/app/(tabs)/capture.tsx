import { Redirect } from 'expo-router';

// The capture tab opens the full-screen capture modal
export default function CaptureTab() {
  return <Redirect href="/capture" />;
}
