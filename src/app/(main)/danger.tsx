import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { palette, radius, space } from '@/theme';

const IDLE_GRACE_MS = 500;    // text stays full opacity for this long after last keystroke
const IDLE_WIPE_MS = 3000;    // by this point text is fully gone

const DURATIONS = [
  { label: '1 min', minutes: 1 },
  { label: '3 min', minutes: 3 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
];

type Phase = 'config' | 'writing' | 'done' | 'wiped';
type DoneInfo = { noteId: string | null };

export default function DangerScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('config');
  const [minutes, setMinutes] = useState(5);
  const [text, setText] = useState('');
  const [remaining, setRemaining] = useState(minutes * 60);
  const [doneInfo, setDoneInfo] = useState<DoneInfo>({ noteId: null });

  const lastKeyRef = useRef<number>(Date.now());
  const textRef = useRef('');
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
    textRef.current = '';
    setRemaining(minutes * 60);
    setDoneInfo({ noteId: null });
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
        textRef.current = '';
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
    textRef.current = v;
    setText(v);
  }

  async function finish() {
    const currentText = textRef.current;
    if (!currentText.trim()) {
      setPhase('wiped');
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setDoneInfo({ noteId: null });
      setPhase('done');
      return;
    }
    const html = `<p>${currentText
      .split('\n')
      .map((l) => l.replace(/</g, '&lt;'))
      .join('</p><p>')}</p>`;
    const draftTitle = `${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })} draft`;
    const { data } = await supabase
      .from('notes')
      .insert({
        title: draftTitle,
        content: { html },
        user_id: userId,
      })
      .select('id')
      .single();
    setDoneInfo({ noteId: data?.id ?? null });
    setPhase('done');
  }

  function abort() {
    Alert.alert('Quit session?', 'Your text will be lost.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => router.back() },
    ]);
  }

  if (phase === 'config') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.configBody}>
            <View style={styles.dangerBadge}>
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.dangerBadgeText}>Danger Mode</Text>
            </View>

            <Text style={styles.configHeading}>Write without stopping.</Text>
            <Text style={styles.configSub}>
              Pick a duration. If you stop typing for more than 3 seconds, your words start to
              fade — and then they're gone.
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

            <Pressable style={styles.primaryButton} onPress={start}>
              <Text style={styles.primaryButtonText}>Start writing</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  if (phase === 'wiped') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.center}>
            <View style={styles.wipedIcon}>
              <Feather name="wind" size={28} color={palette.danger} />
            </View>
            <Text style={styles.wipedTitle}>Your words drifted away.</Text>
            <Text style={styles.wipedSub}>
              You hesitated for too long. Nothing was saved.
            </Text>

            <Pressable style={[styles.primaryButton, { marginTop: 32 }]} onPress={start}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
            <Pressable style={{ marginTop: 14 }} onPress={() => router.back()}>
              <Text style={styles.linkText}>Back home</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  if (phase === 'done') {
    const canEdit = !!doneInfo.noteId;
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.center}>
            <View style={styles.doneIcon}>
              <Feather name="check" size={32} color="#fff" />
            </View>
            <Text style={styles.doneTitle}>You cleared Danger Mode.</Text>
            <Text style={styles.wipedSub}>
              Your draft is saved. Time to shape it into something real.
            </Text>

            {canEdit && (
              <Pressable
                style={[styles.primaryButton, { marginTop: 32 }]}
                onPress={() => router.replace(`/(main)/note/${doneInfo.noteId}`)}
              >
                <Feather name="edit-3" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Edit your draft</Text>
              </Pressable>
            )}
            <Pressable style={{ marginTop: 14 }} onPress={() => router.replace('/(main)')}>
              <Text style={styles.linkText}>Back home</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  // writing
  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.safe, pageStyle, { paddingTop: insets.top }]}>
        <View style={styles.writingHeader}>
          <Text style={styles.timer}>
            {mm}:{ss}
          </Text>
          <Pressable onPress={abort} hitSlop={12}>
            <Text style={styles.quitText}>Quit</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: { padding: 4 },

  configBody: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },

  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: palette.danger,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    marginBottom: 18,
  },
  dangerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  configHeading: {
    fontSize: 30,
    fontWeight: '700',
    color: palette.text,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  configSub: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
    marginTop: 10,
  },

  label: {
    marginTop: 36,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  duration: {
    backgroundColor: '#F7F6F3',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  durationActive: { backgroundColor: palette.text },
  durationText: { fontSize: 15, color: palette.text, fontWeight: '600' },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.text,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 36,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { color: palette.textMuted, fontSize: 14, fontWeight: '500' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  wipedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDECE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  wipedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  wipedSub: {
    fontSize: 15,
    color: palette.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },

  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  writingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  timer: { fontSize: 28, fontWeight: '700', color: palette.danger, letterSpacing: -0.5 },
  quitText: { color: palette.textMuted, fontSize: 14, fontWeight: '500' },

  editorWrap: { flex: 1, backgroundColor: palette.bg, overflow: 'hidden' },
  editor: {
    flex: 1,
    fontSize: 19,
    lineHeight: 28,
    color: palette.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
