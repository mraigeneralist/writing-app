import { Feather } from '@expo/vector-icons';
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

function todayLabel() {
  return new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
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

  useFocusEffect(useCallback(() => { load(); }, []));

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

  const header = (
    <View>
      <View style={styles.headerTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{todayLabel()}</Text>
          <Text style={styles.heading}>Writeflow</Text>
        </View>
        <Pressable onPress={signOut} hitSlop={12} style={styles.iconBtn}>
          <Feather name="log-out" size={18} color={palette.textMuted} />
        </Pressable>
      </View>

      <View style={styles.actions}>
        <ActionCard
          icon="edit-3"
          label="New note"
          onPress={newNote}
        />
        <ActionCard
          icon="zap"
          label="Idea"
          onPress={() => router.push('/(main)/idea-capture')}
        />
        <ActionCard
          icon="clock"
          label="Danger"
          accent
          onPress={() => router.push('/(main)/danger')}
        />
      </View>

      {ideas.length > 0 && (
        <View style={styles.ideasBlock}>
          <Text style={styles.section}>Recent ideas</Text>
          {ideas.slice(0, 4).map((i) => (
            <View key={i.id} style={styles.ideaRow}>
              <View style={styles.bullet} />
              <Text style={styles.ideaText} numberOfLines={2}>
                {i.content}
              </Text>
            </View>
          ))}
          {ideas.length > 4 && (
            <Text style={styles.moreLabel}>+ {ideas.length - 4} more</Text>
          )}
        </View>
      )}

      <Text style={styles.section}>Notes</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
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
            <Pressable onPress={newNote} style={styles.emptyCard}>
              <Feather name="edit-3" size={22} color={palette.textMuted} />
              <Text style={styles.emptyText}>Start your first note</Text>
            </Pressable>
          }
        />
      )}

      <Pressable
        onPress={newNote}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      >
        <Feather name="plus" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function ActionCard({
  icon,
  label,
  onPress,
  accent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        accent && styles.actionCardAccent,
        pressed && { opacity: 0.6 },
      ]}
    >
      <Feather
        name={icon}
        size={20}
        color={accent ? '#fff' : palette.text}
      />
      <Text style={[styles.actionLabel, accent && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: space.lg, paddingBottom: 120 },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  date: { fontSize: 13, color: palette.textMuted, fontWeight: '500', marginBottom: 2 },
  heading: { fontSize: 34, fontWeight: '700', color: palette.text, letterSpacing: -0.6 },
  iconBtn: { padding: 6 },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: space.xl,
  },
  actionCard: {
    flex: 1,
    aspectRatio: 1.15,
    borderRadius: 14,
    backgroundColor: '#F7F6F3',
    padding: 14,
    justifyContent: 'space-between',
  },
  actionCardAccent: {
    backgroundColor: palette.text,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.text,
  },

  ideasBlock: { marginBottom: space.xl },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.sm,
    paddingHorizontal: 2,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 4,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.text,
    marginTop: 11,
    marginRight: 12,
  },
  ideaText: { flex: 1, fontSize: 15, lineHeight: 22, color: palette.text },
  moreLabel: {
    fontSize: 13,
    color: palette.textMuted,
    fontWeight: '500',
    paddingHorizontal: 4,
    marginTop: 6,
  },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  pressed: { backgroundColor: '#F4F4F2' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.border },
  noteTitle: { fontSize: 16, fontWeight: '600', color: palette.text },
  notePreview: { fontSize: 13, color: palette.textMuted, marginTop: 3 },
  noteDate: { fontSize: 12, color: palette.textMuted, marginLeft: 8 },

  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#F7F6F3',
  },
  emptyText: { fontSize: 15, color: palette.textMuted, fontWeight: '500' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
});
