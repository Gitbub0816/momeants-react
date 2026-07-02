import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

// Route registry for expo-router — resolved by Metro at build time
// (require.context is a Metro extension not in Node's require types)
const ctx = (require as any).context('./app');

interface ShieldState {
  error: Error | null;
}

// Last line of defense: if anything in the app tree throws during startup,
// show the error instead of dying behind the splash screen.
class CrashShield extends React.Component<{ children: React.ReactNode }, ShieldState> {
  state: ShieldState = { error: null };

  static getDerivedStateFromError(error: Error): ShieldState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[CrashShield]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#050711', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#F8F4FF', fontSize: 22, marginBottom: 12 }}>
            Something went wrong
          </Text>
          <ScrollView style={{ maxHeight: 300 }}>
            <Text style={{ color: 'rgba(248,244,255,0.6)', fontSize: 13 }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={() => this.setState({ error: null })}
            style={{
              marginTop: 20,
              alignSelf: 'center',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(181,124,255,0.2)',
              borderWidth: 1,
              borderColor: 'rgba(181,124,255,0.4)',
            }}
          >
            <Text style={{ color: '#B57CFF' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <CrashShield>
      <ExpoRoot context={ctx} />
    </CrashShield>
  );
}

registerRootComponent(App);
