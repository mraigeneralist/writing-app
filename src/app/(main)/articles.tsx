import { Feather } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { palette } from '@/theme';

type Note = {
  id: string;
  title: string | null;
  content: { html?: string } | null;
  updated_at: string;
};

function previewFromContent(c: Note['content']) {
  if (!c || !c.html) return '';
  return c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diff < 7 * day) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ArticlesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('notes')
      .select('id,title,content,updated_at')
      .order('updated_at', { ascending: false });
    if (data) setNotes(data as Note[]);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={palette.text} />
          </Pressable>
          <Text style={styles.title}>Your Articles</Text>
          <View style={{ width: 22 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.textMuted} />
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(n) => n.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.textMuted} />}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => router.push(`/(main)/note/${item.id}`)}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title?.trim() || 'Untitled'}
                  </Text>
                  {previewFromContent(item.content) ? (
                    <Text style={styles.rowPreview} numberOfLines={1}>
                      {previewFromContent(item.content)}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.rowDate}>{formatDate(item.updated_at)}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Feather name="book-open" size={32} color={palette.textMuted} />
                <Text style={styles.emptyTitle}>No articles yet</Text>
                <Text style={styles.emptySub}>Start a draft in Normal or Danger Mode.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '700', color: palette.text },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, flexGrow: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 12,
  },
  pressed: { backgroundColor: '#F4F4F2' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: palette.text },
  rowPreview: { fontSize: 13, color: palette.textMuted, marginTop: 3 },
  rowDate: { fontSize: 12, color: palette.textMuted, marginLeft: 8 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: palette.text, marginTop: 8 },
  emptySub: { fontSize: 14, color: palette.textMuted, textAlign: 'center' },
});
