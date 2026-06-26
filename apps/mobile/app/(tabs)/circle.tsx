import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { Clique } from '@momeants/types';
import { ScreenShell, EmptyState, Skeleton } from '../../src/components/core';
import { CliqueCard } from '../../src/components/clique/CliqueCard';
import { DEMO_CLIQUES } from '../../src/demo/cliques';
import { colors, fontFamily, fontSize, spacing, radii, gradients } from '@momeants/design';
import { LinearGradient } from 'expo-linear-gradient';

export default function CliquesScreen() {
  const router = useRouter();
  const [cliques, setCliques] = useState<Clique[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function loadCliques() {
    // Simulate async data load
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCliques(DEMO_CLIQUES);
        resolve();
      }, 350);
    });
  }

  useEffect(() => {
    loadCliques().finally(() => setLoading(false));
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadCliques();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Cliques</Text>
        </View>
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={130} borderRadius={20} style={{ marginBottom: spacing.sm }} />
          ))}
        </View>
      </ScreenShell>
    );
  }

  if (cliques.length === 0) {
    return (
      <ScreenShell edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Cliques</Text>
        </View>
        <EmptyState
          icon="🫂"
          title="No cliques yet"
          body="Create a clique for your closest people — family, friends, a couple."
          actionLabel="Create a clique"
          onAction={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/clique/new');
          }}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.auraPurple}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Cliques</Text>
            <Text style={styles.subtitle}>{cliques.length} groups</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/clique/new');
            }}
            style={styles.newBtn}
            accessibilityRole="button"
            accessibilityLabel="Create new clique"
            accessibilityHint="Double tap to create a new clique group"
          >
            <LinearGradient
              colors={gradients.aura}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newBtnGradient}
            >
              <Text style={styles.newBtnText}>+ New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Clique cards */}
        <View style={styles.cardList}>
          {cliques.map((clique) => (
            <CliqueCard
              key={clique.id}
              clique={clique}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/clique/${clique.id}`);
              }}
            />
          ))}
        </View>

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.md, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.display,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    marginTop: 2,
  },
  newBtn: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  newBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBtnText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
  skeletonList: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  cardList: { gap: spacing.md },
  tabBarSpacer: { height: 120 },
});
