import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { palette } from '@/theme';

type Idea = { id: string; content: string; created_at: string };

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  const diff = now.getTime() - d.getTime();
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

type Row =
  | { kind: 'idea'; idea: Idea }
  | { kind: 'day'; label: string; key: string };

function buildRows(ideas: Idea[]): Row[] {
  // ideas come newest-first; we render oldest at top, newest at bottom (chat order).
  const ascending = [...ideas].reverse();
  const rows: Row[] = [];
  let lastDay = '';
  for (const idea of ascending) {
    const label = dayLabel(idea.created_at);
    if (label !== lastDay) {
      rows.push({ kind: 'day', label, key: `day-${label}-${idea.id}` });
      lastDay = label;
    }
    rows.push({ kind: 'idea', idea });
  }
  return rows;
}

export default function IdeaCaptureScreen() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Row>>(null);
  const keyboard = useAnimatedKeyboard();

  const pageStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, insets.bottom),
  }));

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ideas')
        .select('id,content,created_at')
        .order('created_at', { ascending: false });
      if (data) setIdeas(data as Idea[]);
      setLoading(false);
    }
    load();
  }, []);

  // Scroll to bottom whenever new content arrives.
  useEffect(() => {
    const id = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [ideas]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSending(false);
      return;
    }
    const { data, error } = await supabase
      .from('ideas')
      .insert({ content: trimmed, user_id: userId })
      .select('id,content,created_at')
      .single();
    setSending(false);
    if (error || !data) return;
    setIdeas((prev) => [data as Idea, ...prev]);
    setText('');
  }

  const rows = buildRows(ideas);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.page, pageStyle, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={palette.text} />
          </Pressable>
          <Text style={styles.topTitle}>Ideas</Text>
          <View style={{ width: 22 }} />
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.textMuted} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={rows}
            keyExtractor={(r) => (r.kind === 'idea' ? r.idea.id : r.key)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Note to self</Text>
                <Text style={styles.emptySub}>
                  Capture a thought. Throw it at the wall. Come back to it later.
                </Text>
              </View>
            }
            renderItem={({ item }) =>
              item.kind === 'day' ? (
                <Text style={styles.daySep}>{item.label}</Text>
              ) : (
                <View style={styles.bubbleRow}>
                  <View style={styles.bubble}>
                    <Text style={styles.bubbleText}>{item.idea.content}</Text>
                    <Text style={styles.bubbleTime}>{formatTime(item.idea.created_at)}</Text>
                  </View>
                </View>
              )
            }
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Capture an idea…"
            placeholderTextColor={palette.textMuted}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!text.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              (!text.trim() || sending) && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="arrow-up" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  topTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12, flexGrow: 1 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: palette.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: palette.textMuted, textAlign: 'center', lineHeight: 20 },

  daySep: {
    alignSelf: 'center',
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: '600',
    marginVertical: 14,
  },

  bubbleRow: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    maxWidth: '85%',
  },
  bubble: {
    backgroundColor: palette.text,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: { color: '#fff', fontSize: 16, lineHeight: 22 },
  bubbleTime: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
    backgroundColor: palette.bg,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    backgroundColor: '#F4F4F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    color: palette.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
