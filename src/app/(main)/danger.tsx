import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { palette, radius, space, type as t } from '@/theme';

const IDLE_GRACE_MS = 1500;   // text stays full opacity for this long after last keystroke
const IDLE_WIPE_MS = 5000;    // by this point text is fully gone

const DURATIONS = [
  { label: '1 min', minutes: 1 },
  { label: '3 min', minutes: 3 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
];

type Phase = 'config' | 'writing' | 'done' | 'wiped';

export default function DangerScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('config');
  const [minutes, setMinutes] = useState(5);
  const [text, setText] = useState('');
  const [remaining, setRemaining] = useState(minutes * 60);

  const lastKeyRef = useRef<number>(Date.now());
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const textOpacity = useSharedValue(1);

  const pageStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value, insets.bottom),
  }));

  const editorOpacityStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  function start() {
    setText('');
    setRemaining(minutes * 60);
    lastKeyRef.current = Date.now();
    textOpacity.value = 1;
    setPhase('writing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // Session countdown
  useEffect(() => {
    if (phase !== 'writing') return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Idle watchdog: continuously map idle time to opacity so the writer
  // sees their words dim gradually as a warning before being wiped.
  useEffect(() => {
    if (phase !== 'writing') return;
    const id = setInterval(() => {
      const idle = Date.now() - lastKeyRef.current;
      if (idle <= IDLE_GRACE_MS) {
        textOpacity.value = 1;
      } else if (idle >= IDLE_WIPE_MS) {
        textOpacity.value = 0;
        setText('');
        setPhase('wiped');
      } else {
        const progress = (idle - IDLE_GRACE_MS) / (IDLE_WIPE_MS - IDLE_GRACE_MS);
        textOpacity.value = 1 - progress;
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase, textOpacity]);

  function onChangeText(v: string) {
    lastKeyRef.current = Date.now();
    textOpacity.value = 1;
    setText(v);
  }

  async function finish() {
    if (!text.trim()) {
      setPhase('wiped');
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setPhase('done');
      return;
    }
    const html = `<p>${text
      .split('\n')
      .map((l) => l.replace(/</g, '&lt;'))
      .join('</p><p>')}</p>`;
    const { data } = await supabase
      .from('notes')
      .insert({
        title: `Danger session — ${new Date().toLocaleDateString()}`,
        content: { html },
        user_id: userId,
      })
      .select('id')
      .single();
    setPhase('done');
    if (data?.id) {
      setTimeout(() => router.replace(`/(main)/note/${data.id}`), 1200);
    }
  }

  function abort() {
    Alert.alert('Quit session?', 'Your text will be lost.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  if (phase === 'config') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.configBody}>
          <Text style={t.h1}>Danger Mode</Text>
          <Text style={[t.body, { color: palette.textMuted, marginTop: space.sm }]}>
            Pick a duration and start writing. If you stop typing for 3 seconds, your text fades
            away — and it's gone.
          </Text>

          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationGrid}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.minutes}
                style={[styles.duration, minutes === d.minutes && styles.durationActive]}
                onPress={() => setMinutes(d.minutes)}
              >
                <Text
                  style={[
                    styles.durationText,
                    minutes === d.minutes && { color: '#fff' },
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.startButton} onPress={start}>
            <Text style={styles.startText}>Start writing</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'wiped') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={[t.h1, { color: palette.danger }]}>Wiped.</Text>
          <Text style={[t.body, { color: palette.textMuted, marginTop: space.sm }]}>
            You stopped writing. The words are gone.
          </Text>
          <Pressable style={[styles.startButton, { marginTop: space.xl }]} onPress={start}>
            <Text style={styles.startText}>Try again</Text>
          </Pressable>
          <Pressable style={{ marginTop: space.md }} onPress={() => router.back()}>
            <Text style={{ color: palette.textMuted }}>Back home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={[t.h1, { color: palette.success }]}>You survived.</Text>
          <Text style={[t.body, { color: palette.textMuted, marginTop: space.sm }]}>
            Your draft is saved. Opening it…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // writing
  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <Animated.View style={[styles.safe, pageStyle, { paddingTop: insets.top }]}>
      <View style={styles.writingHeader}>
        <Text style={styles.timer}>
          {mm}:{ss}
        </Text>
        <Pressable onPress={abort} hitSlop={12}>
          <Text style={{ color: palette.textMuted, fontSize: 14 }}>Quit</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.editorWrap, editorOpacityStyle]}>
        <TextInput
          ref={inputRef}
          style={styles.editor}
          value={text}
          onChangeText={onChangeText}
          multiline
          placeholder="Start typing. Don't stop."
          placeholderTextColor={palette.textMuted}
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.surface },
  configBody: { flex: 1, padding: space.lg, justifyContent: 'center' },
  label: {
    marginTop: space.xl,
    marginBottom: space.sm,
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  duration: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  durationActive: { backgroundColor: palette.text, borderColor: palette.text },
  durationText: { fontSize: 16, color: palette.text, fontWeight: '600' },
  startButton: {
    backgroundColor: palette.accent,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
    marginTop: space.xl,
  },
  startText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  writingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  timer: { fontSize: 28, fontWeight: '700', color: palette.danger },
  editorWrap: {
    flex: 1,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  editor: {
    flex: 1,
    fontSize: 19,
    lineHeight: 28,
    color: palette.text,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
});
