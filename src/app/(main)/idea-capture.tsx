import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { palette, space } from '@/theme';

export default function IdeaCaptureScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(id);
  }, []);

  async function save() {
    const trimmed = content.trim();
    if (!trimmed) {
      router.back();
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      return;
    }
    await supabase.from('ideas').insert({ content: trimmed, user_id: userId });
    setSaving(false);
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: palette.surface },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.surface },
          headerRight: () =>
            saving ? (
              <ActivityIndicator size="small" color={palette.textMuted} />
            ) : (
              <Pressable onPress={save} hitSlop={8}>
                <Text style={styles.saveLink}>Save</Text>
              </Pressable>
            ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={palette.textMuted}
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.surface },
  input: {
    flex: 1,
    fontSize: 19,
    lineHeight: 28,
    color: palette.text,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
  },
  saveLink: { color: palette.accent, fontSize: 16, fontWeight: '600' },
});
