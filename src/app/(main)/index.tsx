import { useFocusEffect, useRouter } from 'expo-router';
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
import { Feather } from '@expo/vector-icons';

import { FloatingActionButton } from '@/components/FloatingActionButton';
import { supabase } from '@/lib/supabase';
import { palette, space } from '@/theme';

type Note = {
  id: string;
  title: string | null;
  content: { html?: string } | null;
  updated_at: string;
};

type Idea = { id: string; content: string; created_at: string };

function previewFromContent(c: Note['content']) {
  if (!c || !c.html) return '';
  return c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day && d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffMs < 7 * day) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [n, i] = await Promise.all([
      supabase.from('notes').select('id,title,content,updated_at').order('updated_at', { ascending: false }),
      supabase.from('ideas').select('id,content,created_at').order('created_at', { ascending: false }),
    ]);
    if (n.data) setNotes(n.data as Note[]);
    if (i.data) setIdeas(i.data as Idea[]);
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function newNote() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: '', content: { html: '' }, user_id: userId })
      .select('id')
      .single();
    if (error || !data) return;
    router.push(`/(main)/note/${data.id}`);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Writeflow</Text>
        <Pressable onPress={signOut} hitSlop={12} style={styles.signOut}>
          <Feather name="log-out" size={18} color={palette.textMuted} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.textMuted} />}
          ListHeaderComponent={
            <View>
              <Pressable
                style={({ pressed }) => [styles.dangerRow, pressed && styles.pressed]}
                onPress={() => router.push('/(main)/danger')}
              >
                <View style={styles.dangerIcon}>
                  <Feather name="zap" size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dangerTitle}>Danger Mode</Text>
                  <Text style={styles.dangerSubtitle}>Write without stopping</Text>
                </View>
                <Feather name="chevron-right" size={18} color={palette.textMuted} />
              </Pressable>

              {ideas.length > 0 && (
                <>
                  <Text style={styles.section}>Ideas</Text>
                  {ideas.slice(0, 6).map((i) => (
                    <View key={i.id} style={styles.ideaRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.ideaText}>{i.content}</Text>
                    </View>
                  ))}
                </>
              )}

              <Text style={styles.section}>Notes</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.noteRow, pressed && styles.pressed]}
              onPress={() => router.push(`/(main)/note/${item.id}`)}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {item.title?.trim() || 'Untitled'}
                </Text>
                {previewFromContent(item.content) ? (
                  <Text style={styles.notePreview} numberOfLines={1}>
                    {previewFromContent(item.content)}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.noteDate}>{formatDate(item.updated_at)}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notes yet. Tap + to create one.</Text>
          }
        />
      )}

      <FloatingActionButton
        actions={[
          { label: 'New note', onPress: newNote },
          { label: 'Capture idea', onPress: () => router.push('/(main)/idea-capture') },
          { label: 'Danger Mode', onPress: () => router.push('/(main)/danger'), tint: palette.accent },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.5,
  },
  signOut: { padding: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: space.lg, paddingBottom: 140 },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: space.md,
    backgroundColor: '#FBFAF7',
  },
  dangerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerTitle: { fontSize: 15, fontWeight: '600', color: palette.text },
  dangerSubtitle: { fontSize: 13, color: palette.textMuted, marginTop: 1 },

  section: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: space.lg,
    marginBottom: space.sm,
    paddingHorizontal: 4,
  },

  ideaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.textMuted,
    marginTop: 9,
    marginRight: 12,
  },
  ideaText: { flex: 1, fontSize: 15, lineHeight: 22, color: palette.text },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  pressed: { backgroundColor: '#F4F4F2' },
  noteTitle: { fontSize: 16, fontWeight: '600', color: palette.text },
  notePreview: { fontSize: 13, color: palette.textMuted, marginTop: 2 },
  noteDate: { fontSize: 12, color: palette.textMuted, marginLeft: 8 },

  empty: { fontSize: 14, color: palette.textMuted, textAlign: 'center', marginTop: space.xl },
});
