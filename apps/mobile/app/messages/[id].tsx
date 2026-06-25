import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { Message, Conversation } from '@momeants/types';
import { useApi } from '../../src/context/ApiContext';
import { colors } from '@momeants/design/src/colors';
import { spacing, radii } from '@momeants/design/src/spacing';
import { fontSize, fontFamily } from '@momeants/design/src/typography';

function Bubble({ msg }: { msg: Message }) {
  const isMe = msg.isFromMe;

  if (msg.type === 'reaction') {
    return (
      <View style={[styles.bubbleWrap, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
        <Text style={styles.reactionBubble}>{msg.reactionEmoji}</Text>
      </View>
    );
  }

  if (msg.type === 'moment') {
    return (
      <View style={[styles.bubbleWrap, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
        <View style={[styles.momentCard, isMe && styles.momentCardMe]}>
          <Text style={styles.momentCardIcon}>📸</Text>
          <Text style={styles.momentCardText}>{msg.text ?? 'Shared a memory'}</Text>
        </View>
      </View>
    );
  }

  if (msg.type === 'spark') {
    return (
      <View style={[styles.bubbleWrap, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
        <LinearGradient
          colors={['rgba(181,124,255,0.25)', 'rgba(120,167,255,0.15)']}
          style={styles.sparkCard}
        >
          <Text style={styles.sparkIcon}>⚡</Text>
          <Text style={styles.sparkText}>{msg.text}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleWrap, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
      {!isMe && msg.senderAvatarUri && (
        <Image source={{ uri: msg.senderAvatarUri }} style={styles.bubbleAvatar} contentFit="cover" />
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.text}</Text>
      </View>
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useApi();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.getConversation(id).then((c) => {
      if (c) {
        setConv(c);
        setMessages(c.messages ?? []);
      }
    });
  }, [id]);

  const title = conv?.cliqueName
    ?? conv?.participantNames.filter((_, i) => conv.participantIds[i] !== 'me').join(', ')
    ?? 'Message';

  const send = async () => {
    if (!text.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = await api.sendMessage(id, text.trim());
    setMessages((prev) => [...prev, msg]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerStyle: { backgroundColor: colors.ink900 },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Back',
        }}
      />
      <LinearGradient colors={[colors.ink900, '#151B31']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <Bubble msg={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />

          <SafeAreaView edges={['bottom']} style={styles.inputBar}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Message…"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
                accessibilityLabel="Message input"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                onPress={send}
                disabled={!text.trim()}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Text style={styles.sendIcon}>↑</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginVertical: 2,
  },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, marginBottom: 2 },
  bubble: {
    maxWidth: '72%',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMe: {
    backgroundColor: 'rgba(181,124,255,0.28)',
    borderBottomRightRadius: 6,
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderBottomLeftRadius: 6,
  },
  bubbleText: { color: colors.textSecondary, fontFamily: fontFamily.sans, fontSize: fontSize.md, lineHeight: 22 },
  bubbleTextMe: { color: colors.textPrimary },
  reactionBubble: { fontSize: 28 },
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  momentCardMe: { backgroundColor: 'rgba(181,124,255,0.15)' },
  momentCardIcon: { fontSize: 20 },
  momentCardText: { color: colors.textSecondary, fontFamily: fontFamily.sans, fontSize: fontSize.sm },
  sparkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(181,124,255,0.30)',
    maxWidth: '80%',
  },
  sparkIcon: { fontSize: 18 },
  sparkText: { color: colors.auraPurple, fontFamily: fontFamily.sansMedium, fontSize: fontSize.sm, flex: 1 },
  inputBar: { backgroundColor: 'transparent' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    color: colors.textPrimary,
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.auraPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendIcon: { color: '#fff', fontSize: 20, fontFamily: fontFamily.sansMedium },
});
