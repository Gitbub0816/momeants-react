import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@momeants/design';
import { spacing, radii } from '@momeants/design';
import { fontSize, fontFamily } from '@momeants/design';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>✦</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.detail} numberOfLines={3}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.reset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: { color: colors.auraPurple, fontSize: 32 },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.section,
    fontFamily: fontFamily.serif,
    textAlign: 'center',
  },
  detail: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sans,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(181,124,255,0.15)',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.35)',
  },
  buttonText: {
    color: colors.auraPurple,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.sansMedium,
  },
});
