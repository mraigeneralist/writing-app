import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RichText, useEditorBridge } from '@10play/tentap-editor';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotionToolbar } from '@/components/NotionToolbar';
import { notionEditorCss } from '@/lib/editor-styles';
import { supabase } from '@/lib/supabase';
import { palette } from '@/theme';

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
  const [title, setTitle] = useState(initial.title);
  const [savedTitle, setSavedTitle] = useState(initial.title);
  const [savedHtml, setSavedHtml] = useState(initial.html);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();

  const pageStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, insets.bottom),
  }));

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initial.html || '<p></p>',
  });

  useEffect(() => {
    const attempts = [200, 500, 1000, 2000];
    const timeouts = attempts.map((ms) =>
      setTimeout(() => editor.injectCSS(notionEditorCss, 'notion-styles'), ms)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [editor]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const html = await editor.getHTML();
      if (html === savedHtml && title === savedTitle) return;
      setSaving(true);
      const { error } = await supabase
        .from('notes')
        .update({ title, content: { html }, updated_at: new Date().toISOString() })
        .eq('id', noteId);
      setSaving(false);
      if (!error) {
        setSavedHtml(html);
        setSavedTitle(title);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [title, savedTitle, savedHtml, noteId, editor]);

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
        <TextInput
          ref={titleRef}
          style={styles.title}
          placeholder="Untitled"
          placeholderTextColor="#C5C4C0"
          value={title}
          onChangeText={(text) => {
            if (text.includes('\n')) {
              setTitle(text.replace(/\n/g, ''));
              titleRef.current?.blur();
              setTimeout(() => {
                // Insert an empty paragraph at the top of the body and put cursor there,
                // matching Notion's behavior when Enter is pressed in the title.
                editor.injectJS(`
                  try {
                    if (typeof editor !== 'undefined' && editor.commands) {
                      editor.commands.insertContentAt(0, '<p></p>');
                      editor.commands.focus(1);
                    }
                  } catch (e) {}
                `);
                editor.focus();
              }, 30);
            } else {
              setTitle(text);
            }
          }}
          multiline
          scrollEnabled={false}
          blurOnSubmit={false}
        />
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
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
    color: palette.text,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: palette.bg,
    letterSpacing: -0.5,
  },
  body: { flex: 1, backgroundColor: palette.bg, paddingHorizontal: 24 },
});
