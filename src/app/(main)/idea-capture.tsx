import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { palette, radius, space, type as t } from '@/theme';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.body}>
        <Text style={[t.caption, { marginBottom: space.sm }]}>What's the idea?</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Just type it. Don't overthink."
          placeholderTextColor={palette.textMuted}
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancel} onPress={() => router.back()}>
          <Text style={{ color: palette.textMuted, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.save} onPress={save} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  body: { flex: 1, padding: space.lg },
  input: {
    flex: 1,
    fontSize: 18,
    color: palette.text,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: palette.border,
    minHeight: 200,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    justifyContent: 'flex-end',
    gap: space.md,
  },
  cancel: { paddingVertical: space.sm, paddingHorizontal: space.md, justifyContent: 'center' },
  save: {
    backgroundColor: palette.text,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
