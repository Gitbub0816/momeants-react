import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell, GlassCard } from '../src/components/core';
import { CircleAvatar } from '../src/components/circle';
import { useApi } from '../src/context/ApiContext';
import { colors, fontFamily, fontSize, spacing, radii } from '@momeants/design';

// Known people from mock data
const MOCK_PEOPLE = [
  { id: 'p1', displayName: 'Ava Chen', username: 'avachen', avatarUri: 'https://i.pravatar.cc/100?img=47' },
  { id: 'p2', displayName: 'Marcus Williams', username: 'marcusw', avatarUri: 'https://i.pravatar.cc/100?img=3' },
  { id: 'p3', displayName: 'Sofia Park', username: 'sofiapark', avatarUri: 'https://i.pravatar.cc/100?img=5' },
  { id: 'p4', displayName: 'James Rivera', username: 'jrivera', avatarUri: 'https://i.pravatar.cc/100?img=12' },
  { id: 'p5', displayName: 'Lily Zhang', username: 'lilyzhang', avatarUri: 'https://i.pravatar.cc/100?img=9' },
  { id: 'disc_user_1', displayName: 'Jordan Lee', username: 'jordanlee', avatarUri: 'https://i.pravatar.cc/100?img=15' },
  { id: 'disc_user_2', displayName: 'Maya Patel', username: 'mayapatel', avatarUri: 'https://i.pravatar.cc/100?img=25' },
  { id: 'disc_user_3', displayName: 'Owen Torres', username: 'owentorres', avatarUri: 'https://i.pravatar.cc/100?img=33' },
];

type PersonResult = typeof MOCK_PEOPLE[number];

export default function SearchScreen() {
  const router = useRouter();
  const api = useApi();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PersonResult[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Autofocus input
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = MOCK_PEOPLE.filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.username.toLowerCase().includes(lower)
    );
    setResults(filtered);
  }, []);

  function onChangeText(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 300);
  }

  async function handleAdd(person: PersonResult) {
    if (addedIds.has(person.id) || addingId) return;
    setAddingId(person.id);
    try {
      // Added in API expansion
      await (api as any).addToCircle(person.id);
    } catch {
      // silently ignore if not yet implemented
    } finally {
      setAddedIds((prev) => new Set([...prev, person.id]));
      setAddingId(null);
    }
  }

  const showEmpty = !query.trim();
  const showNoResults = query.trim() && results.length === 0;

  return (
    <ScreenShell>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={onChangeText}
            style={styles.input}
            placeholder="Search people…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {showEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>Search for people you know</Text>
            <Text style={styles.emptyDesc}>Find friends and add them to your circle.</Text>
          </View>
        )}

        {showNoResults && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>○</Text>
            <Text style={styles.emptyTitle}>No one found for '{query}'</Text>
            <Text style={styles.emptyDesc}>Try a different name or username.</Text>
          </View>
        )}

        {results.map((person) => {
          const added = addedIds.has(person.id);
          const adding = addingId === person.id;
          return (
            <GlassCard key={person.id} style={styles.row}>
              <CircleAvatar name={person.displayName} avatarUri={person.avatarUri} size={44} />
              <View style={styles.rowText}>
                <Text style={styles.displayName}>{person.displayName}</Text>
                <Text style={styles.username}>@{person.username}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAdd(person)}
                disabled={added || !!adding}
                style={[styles.addBtn, added && styles.addBtnAdded]}
                accessibilityRole="button"
                accessibilityLabel={added ? 'Added to circle' : `Add ${person.displayName} to circle`}
              >
                {adding ? (
                  <ActivityIndicator size="small" color={colors.auraPurple} />
                ) : (
                  <Text style={[styles.addBtnText, added && styles.addBtnTextAdded]}>
                    {added ? 'Added ✓' : 'Add to circle'}
                  </Text>
                )}
              </TouchableOpacity>
            </GlassCard>
          );
        })}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: colors.textSecondary, fontSize: 24 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass800,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    height: 44,
  },
  searchIcon: { color: colors.textMuted, fontSize: 18 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    height: 44,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 48, color: colors.textMuted },
  emptyTitle: {
    color: colors.textSecondary,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSize.section,
    textAlign: 'center',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.body,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  displayName: {
    color: colors.textPrimary,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.body,
  },
  username: {
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.caption,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.auraPurple,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  addBtnAdded: {
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  addBtnText: {
    color: colors.auraPurple,
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.caption,
  },
  addBtnTextAdded: {
    color: colors.textMuted,
  },
});
