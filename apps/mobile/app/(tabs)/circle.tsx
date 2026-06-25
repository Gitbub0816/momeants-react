import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import type { CircleMember, CircleMoment } from '@momeants/types';
import { ScreenShell } from '../../src/components/core';
import { CircleAvatar, CircleMomentCard } from '../../src/components/circle';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';

export default function CircleScreen() {
  const api = useApi();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [circleMoments, setCircleMoments] = useState<CircleMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listCircleMembers(), api.listCircleMoments()]).then(([m, cm]) => {
      setMembers(m);
      setCircleMoments(cm);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <ScreenShell>
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.auraPurple} />
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Circle</Text>
        <Text style={styles.subtitle}>The people who matter most.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <CircleAvatar
                name={member.displayName}
                avatarUri={member.avatarUri}
                size={64}
                hasGlow={member.hasNewMoment}
              />
              <Text style={styles.memberName} numberOfLines={1}>
                {member.displayName.split(' ')[0]}
              </Text>
              {member.relationship ? (
                <Text style={styles.memberRelation} numberOfLines={1}>{member.relationship}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>

        {circleMoments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>From your circle</Text>
            <View style={styles.momentsList}>
              {circleMoments.map((cm) => (
                <CircleMomentCard key={cm.momentId} circleMoment={cm} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: spacing.md, paddingHorizontal: spacing.lg, gap: spacing.xl },
  title: { color: colors.textPrimary, fontFamily: 'PlayfairDisplay_700Bold', fontSize: fontSize.display },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body, marginTop: -spacing.md },
  membersRow: { gap: spacing.lg, paddingVertical: spacing.sm },
  memberItem: { alignItems: 'center', gap: 6, width: 72 },
  memberName: { color: colors.textSecondary, fontFamily: fontFamily.sansMedium, fontSize: fontSize.caption, textAlign: 'center' },
  memberRelation: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.micro, textAlign: 'center' },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.textSecondary, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.section },
  momentsList: { gap: spacing.md },
  tabBarSpacer: { height: 120 },
});
