import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { CircleMember } from '@momeants/types';
import { colors, fontFamily, fontSize, spacing } from '@momeants/design';
import { CircleAvatar } from './CircleAvatar';

interface Props {
  members: CircleMember[];
  onMemberPress?: (member: CircleMember) => void;
}

export function CloseCircleStrip({ members, onMemberPress }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {members.map((member) => (
        <TouchableOpacity
          key={member.id}
          onPress={() => onMemberPress?.(member)}
          style={styles.item}
          accessibilityRole="button"
          accessibilityLabel={member.displayName}
        >
          <CircleAvatar
            name={member.displayName}
            avatarUri={member.avatarUri}
            size={56}
            hasGlow={member.hasNewMoment}
          />
          <Text style={styles.name} numberOfLines={1}>
            {member.displayName.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: spacing.md, flexDirection: 'row' },
  item: { alignItems: 'center', gap: 6, minWidth: 56 },
  name: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.micro,
    textAlign: 'center',
  },
});
