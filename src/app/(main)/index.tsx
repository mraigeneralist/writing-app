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

import { FloatingActionButton } from '@/components/FloatingActionButton';
import { NoteCard } from '@/components/NoteCard';
import { supabase } from '@/lib/supabase';
import { palette, radius, space, type as t } from '@/theme';

type Note = {
  id: string;
  title: string | null;
  content: { html?: string } | null;
  updated_at: string;
};

type Idea = { id: string; content: string; created_at: string };

function previewFromContent(c: Note['content']) {
  if (!c || !c.html) return '';
  return c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
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
        <View>
          <Text style={t.h1}>Writeflow</Text>
          <Text style={t.caption}>Capture, draft, ship.</Text>
        </View>
        <Pressable onPress={signOut} hitSlop={12}>
          <Text style={{ color: palette.textMuted, fontSize: 14 }}>Sign out</Text>
        </Pressable>
      </View>

      <Pressable style={styles.dangerBanner} onPress={() => router.push('/(main)/danger')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dangerTitle}>Danger Mode</Text>
          <Text style={styles.dangerSubtitle}>Stop typing and your words disappear.</Text>
        </View>
        <Text style={styles.dangerArrow}>→</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 140 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View>
              {ideas.length > 0 && (
                <>
                  <Text style={styles.section}>Ideas</Text>
                  {ideas.slice(0, 6).map((i) => (
                    <View key={i.id} style={styles.ideaCard}>
                      <Text style={styles.ideaText}>{i.content}</Text>
                    </View>
                  ))}
                </>
              )}
              <Text style={styles.section}>Notes</Text>
            </View>
          }
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              preview={previewFromContent(item.content)}
              updatedAt={item.updated_at}
              onPress={() => router.push(`/(main)/note/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <Text style={[t.caption, { textAlign: 'center', marginTop: space.lg }]}>
              No notes yet. Tap + to create one.
            </Text>
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
    paddingTop: space.md,
    paddingBottom: space.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  ideaCard: {
    backgroundColor: palette.accentMuted,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
  },
  ideaText: { color: palette.text, fontSize: 15 },
  dangerBanner: {
    marginHorizontal: space.lg,
    marginBottom: space.md,
    backgroundColor: palette.text,
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dangerSubtitle: { color: '#bbb', fontSize: 13, marginTop: 2 },
  dangerArrow: { color: palette.accent, fontSize: 22, marginLeft: space.sm },
});
