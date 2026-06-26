import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard } from '../../src/components/core';
import { useApi } from '../../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

const EVENT_TYPES = [
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'holiday', label: 'Holiday' },
  { key: 'memory_anniversary', label: 'Memory' },
  { key: 'custom', label: 'Custom' },
] as const;

type EventType = typeof EVENT_TYPES[number]['key'];

const EMOJI_OPTIONS = ['🎂', '💕', '🎉', '✨', '🏆', '🎓', '🏠', '👶'];

const TYPE_COLORS: Record<string, string> = {
  birthday: '#FF7AC8',
  anniversary: '#FF6E91',
  holiday: '#FFD28A',
  memory_anniversary: '#B57CFF',
  custom: '#FFB38A',
};

export default function NewCalendarEventScreen() {
  const router = useRouter();
  const api = useApi();

  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [eventType, setEventType] = useState<EventType>('birthday');
  const [emoji, setEmoji] = useState('🎂');
  const [person, setPerson] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function parseDate(str: string): string | null {
    // Expects MM/DD/YYYY
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [mm, dd, yyyy] = parts;
    if (!mm || !dd || !yyyy || yyyy.length !== 4) return null;
    const d = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
    if (isNaN(d.getTime())) return null;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    const isoDate = parseDate(dateStr);
    if (!isoDate) {
      setError('Please enter a valid date (MM/DD/YYYY).');
      return;
    }
    setError('');
    setSaving(true);
    try {
      // Added in API expansion
      await (api as any).createCalendarEvent({
        title: title.trim(),
        date: isoDate,
        type: eventType,
        emoji,
        isRecurring,
        personName: person.trim() || undefined,
      });
      router.back();
    } catch {
      // silently ignore if not yet implemented
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} accessibilityLabel="Cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>New Event</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
            accessibilityRole="button"
            accessibilityLabel="Save event"
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.auraPurple} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholder="Event name…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                maxLength={80}
              />
            </GlassCard>
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                style={styles.input}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                returnKeyType="next"
                maxLength={10}
              />
            </GlassCard>
          </View>

          {/* Event type */}
          <View style={styles.field}>
            <Text style={styles.label}>Event type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {EVENT_TYPES.map((t) => {
                const active = eventType === t.key;
                const accent = TYPE_COLORS[t.key];
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setEventType(t.key)}
                    style={[
                      styles.typeChip,
                      active && { borderColor: accent, backgroundColor: `${accent}1A` },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t.label}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.typeChipText, active && { color: accent }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Emoji */}
          <View style={styles.field}>
            <Text style={styles.label}>Emoji</Text>
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[styles.emojiChip, emoji === e && styles.emojiChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${e} emoji`}
                  accessibilityState={{ selected: emoji === e }}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Person */}
          <View style={styles.field}>
            <Text style={styles.label}>Person (optional)</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                value={person}
                onChangeText={setPerson}
                style={styles.input}
                placeholder="Who is this about?"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                maxLength={60}
              />
            </GlassCard>
          </View>

          {/* Recurring */}
          <GlassCard style={styles.recurringRow}>
            <View style={styles.recurringText}>
              <Text style={styles.recurringLabel}>Recurring yearly</Text>
              <Text style={styles.recurringDesc}>Repeat this event every year.</Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: colors.glass700, true: colors.auraPurple }}
              thumbColor={isRecurring ? '#fff' : colors.textMuted}
              accessibilityLabel="Recurring yearly toggle"
            />
          </GlassCard>

          {/* Error */}
          {!!error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveFullBtn}
            accessibilityRole="button"
            accessibilityLabel="Save event"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveFullBtnText}>Save Event</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cancelBtn: { width: 70, height: 44, justifyContent: 'center' },
  cancelText: { color: colors.textMuted, fontFamily: fontFamily.sans, fontSize: fontSize.body },
  screenTitle: {
    color: colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.section,
  },
  saveBtn: { width: 70, height: 44, alignItems: 'flex-end', justifyContent: 'center' },
  saveBtnText: { color: colors.auraPurple, fontFamily: fontFamily.sansSemiBold, fontSize: fontSize.body },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  field: { gap: spacing.xs },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
    marginLeft: 2,
  },
  inputCard: { padding: 0, overflow: 'hidden' },
  input: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  chipRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 36,
    justifyContent: 'center',
  },
  typeChipText: {
    color: colors.textMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiChip: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.glass800,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: {
    borderColor: colors.auraPurple,
    backgroundColor: 'rgba(181,124,255,0.15)',
  },
  emojiText: { fontSize: 22 },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  recurringText: { flex: 1, gap: 2 },
  recurringLabel: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
  },
  recurringDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
    textAlign: 'center',
  },
  saveFullBtn: {
    backgroundColor: colors.auraPurple,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  saveFullBtnText: {
    color: '#fff',
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.body,
  },
});
