import { View } from 'react-native';
import { colors } from '@momeants/design';

// Placeholder tab route: the tab bar intercepts the capture press and pushes
// the /capture modal directly, so this screen is never actually shown.
// Do NOT put a <Redirect> here — redirecting from a tab route loops forever.
export default function CaptureTab() {
  return <View style={{ flex: 1, backgroundColor: colors.ink900 }} />;
}
