import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';

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
  const [title, setTitle] = useState(initial.title);
  const [savedTitle, setSavedTitle] = useState(initial.title);
  const [savedHtml, setSavedHtml] = useState(initial.html);
  const [saving, setSaving] = useState(false);

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initial.html || '<p></p>',
  });

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
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: palette.bg },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.bg },
          headerTitle: '',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {saving && <ActivityIndicator size="small" color={palette.textMuted} />}
              <Pressable onPress={onDelete} hitSlop={8}>
                <Text style={{ color: palette.danger, fontSize: 14 }}>Delete</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <View style={styles.page}>
        <TextInput
          style={styles.title}
          placeholder="Untitled"
          placeholderTextColor={palette.textMuted}
          value={title}
          onChangeText={setTitle}
          multiline
          scrollEnabled={false}
        />
        <View style={styles.body}>
          <RichText editor={editor} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  page: { flex: 1, backgroundColor: palette.bg },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
    color: palette.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: palette.bg,
  },
  body: { flex: 1, backgroundColor: palette.bg, paddingHorizontal: 24 },
});
