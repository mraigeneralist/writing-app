import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RichText, useEditorBridge } from '@10play/tentap-editor';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotionToolbar } from '@/components/NotionToolbar';
import { notionEditorCss } from '@/lib/editor-styles';
import { supabase } from '@/lib/supabase';
import { palette } from '@/theme';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

// Build the editor's initial content from a saved title + body.
function buildInitial(title: string, html: string) {
  const body = html?.trim() || '<p></p>';
  return `<h1>${escapeHtml(title || '')}</h1>${body}`;
}

// Split editor HTML into title (first h1) + body (everything else).
function splitDoc(fullHtml: string) {
  const m = fullHtml.match(/^<h1[^>]*>([\s\S]*?)<\/h1>([\s\S]*)$/);
  if (m) {
    return { title: stripTags(m[1]), body: m[2] };
  }
  return { title: '', body: fullHtml };
}

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [initial, setInitial] = useState<{ title: string; html: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('notes')
        .select('id,title,content')
        .eq('id', id)
        .single();
      if (error || !data) {
        Alert.alert('Could not load note', error?.message ?? 'Unknown error');
        router.back();
        return;
      }
      const html: string = (data.content as { html?: string } | null)?.html ?? '';
      setInitial({ title: data.title ?? '', html });
      setLoaded(true);
    }
    load();
  }, [id]);

  async function deleteNote() {
    Alert.alert('Delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('notes').delete().eq('id', id);
          router.back();
        },
      },
    ]);
  }

  if (!loaded || !initial) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return <Editor noteId={id!} initial={initial} onDelete={deleteNote} />;
}

function Editor({
  noteId,
  initial,
  onDelete,
}: {
  noteId: string;
  initial: { title: string; html: string };
  onDelete: () => void;
}) {
  const router = useRouter();
  const [savedTitle, setSavedTitle] = useState(initial.title);
  const [savedHtml, setSavedHtml] = useState(initial.html);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();

  const pageStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, insets.bottom),
  }));

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: buildInitial(initial.title, initial.html),
  });

  // Position cursor inside the title and pop the keyboard, once after mount.
  // autofocus is off so the cursor never briefly appears anywhere else.
  useEffect(() => {
    const id = setTimeout(() => {
      editor.setSelection(1, 1);
      editor.focus();
    }, 250);
    return () => clearTimeout(id);
  }, [editor]);

  useEffect(() => {
    const attempts = [0, 50, 100, 200, 400, 800, 1500];
    const timeouts = attempts.map((ms) =>
      setTimeout(() => editor.injectCSS(notionEditorCss, 'notion-styles'), ms)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [editor]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fullHtml = await editor.getHTML();
      const { title, body } = splitDoc(fullHtml);
      if (title === savedTitle && body === savedHtml) return;
      setSaving(true);
      const { error } = await supabase
        .from('notes')
        .update({ title, content: { html: body }, updated_at: new Date().toISOString() })
        .eq('id', noteId);
      setSaving(false);
      if (!error) {
        setSavedTitle(title);
        setSavedHtml(body);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [savedTitle, savedHtml, noteId, editor]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.page, pageStyle, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={palette.text} />
          </Pressable>
          <View style={styles.topRight}>
            {saving && <ActivityIndicator size="small" color={palette.textMuted} />}
            <Pressable onPress={onDelete} hitSlop={8}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.body}>
          <RichText
            editor={editor}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            overScrollMode="never"
          />
        </View>
        <NotionToolbar editor={editor} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  page: { flex: 1, backgroundColor: palette.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteText: { color: palette.danger, fontSize: 14, fontWeight: '500' },
  body: { flex: 1, backgroundColor: palette.bg, paddingHorizontal: 24 },
});
