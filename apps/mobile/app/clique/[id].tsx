import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DEMO_CLIQUES } from '../../src/demo/cliques';
import { colors, spacing, radii, fontSize, fontFamily } from '@momeants/design';

export default function CliqueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clique = DEMO_CLIQUES.find((c) => c.id === id);
  const router = useRouter();

  if (!clique) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Clique not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: clique.name,
          headerStyle: { backgroundColor: colors.ink900 },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Back',
        }}
      />
      <LinearGradient colors={[colors.ink900, '#151B31', colors.ink900]} style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Header */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroEmoji}>{clique.emoji ?? '👥'}</Text>
              <Text style={styles.heroName}>{clique.name}</Text>
              <Text style={styles.heroType}>{clique.type.replace('_', ' ')}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{clique.momentCount}</Text>
                  <Text style={styles.statLabel}>Moments</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{clique.memberCount}</Text>
                  <Text style={styles.statLabel}>People</Text>
                </View>
                {clique.activeSparks ? (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: colors.auraPurple }]}>{clique.activeSparks}</Text>
                      <Text style={styles.statLabel}>Active Sparks</Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {/* Members */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members</Text>
              <View style={styles.membersList}>
                {clique.members.map((m) => (
                  <View key={m.id} style={styles.memberRow}>
                    {m.avatarUri ? (
                      <Image source={{ uri: m.avatarUri }} style={styles.memberAvatar} contentFit="cover" />
                    ) : (
                      <View style={styles.memberAvatarFallback}>
                        <Text style={styles.memberInitial}>{m.displayName[0]}</Text>
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{m.displayName}</Text>
                      {m.relationship ? <Text style={styles.memberRel}>{m.relationship}</Text> : null}
                    </View>
                    {m.isOwner && (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerText}>Owner</Text>
                      </View>
                    )}
                    {m.hasNewMoment && !m.isOwner && (
                      <View style={styles.newDot} />
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push('/capture');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Capture a moment for this clique"
                >
                  <Text style={styles.actionIcon}>📸</Text>
                  <Text style={styles.actionLabel}>Add Moment</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/messages/convo-family');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Message this clique"
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionLabel}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Start a Spark"
                >
                  <Text style={styles.actionIcon}>⚡</Text>
                  <Text style={styles.actionLabel}>Start Spark</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink900 },
  errorText: { color: colors.textMuted, fontFamily: fontFamily.sans },
  heroHeader: { alignItems: 'center', gap: spacing.sm },
  heroEmoji: { fontSize: 52 },
  heroName: { color: colors.textPrimary, fontFamily: fontFamily.serif, fontSize: fontSize.title, textAlign: 'center' },
  heroType: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.caption, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  statItem: { alignItems: 'center', gap: 2 },
  statNum: { color: colors.textPrimary, fontFamily: fontFamily.serif, fontSize: fontSize.title },
  statLabel: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.10)' },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
  membersList: { gap: spacing.sm },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    minHeight: 56,
  },
  memberAvatar: { width: 40, height: 40, borderRadius: 20 },
  memberAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(181,124,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: { color: colors.auraPurple, fontSize: fontSize.body, fontFamily: fontFamily.serif },
  memberInfo: { flex: 1 },
  memberName: { color: colors.textPrimary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.body },
  memberRel: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
  ownerBadge: {
    backgroundColor: 'rgba(181,124,255,0.15)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.30)',
  },
  ownerText: { color: colors.auraPurple, fontSize: fontSize.micro, fontFamily: fontFamily.sansMedium },
  newDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.auraPurple },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: colors.textSecondary, fontFamily: fontFamily.sans, fontSize: fontSize.micro },
});
