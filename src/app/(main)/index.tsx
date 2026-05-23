import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { palette } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function newNormalNote() {
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
        <Text style={styles.brand}>Writeflow</Text>
        <Pressable onPress={signOut} hitSlop={12} style={styles.signOut}>
          <Feather name="log-out" size={18} color={palette.textMuted} />
        </Pressable>
      </View>

      <View style={styles.cards}>
        <ModeCard
          variant="danger"
          icon="zap"
          title="Danger Mode"
          subtitle="Write without stopping. Stop typing and it's gone."
          onPress={() => router.push('/(main)/danger')}
        />
        <ModeCard
          variant="default"
          icon="edit-3"
          title="Normal Mode"
          subtitle="Draft your article at your own pace."
          onPress={newNormalNote}
        />
        <ModeCard
          variant="default"
          icon="book-open"
          title="Your Articles"
          subtitle="Everything you've written."
          onPress={() => router.push('/(main)/articles')}
        />
      </View>

      <Pressable
        onPress={() => router.push('/(main)/idea-capture')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: Math.max(insets.bottom, 16) + 12 },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Feather name="message-circle" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function ModeCard({
  variant,
  icon,
  title,
  subtitle,
  onPress,
}: {
  variant: 'danger' | 'default';
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isDanger ? styles.cardDanger : styles.cardDefault,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.cardIcon, isDanger ? styles.cardIconDanger : styles.cardIconDefault]}>
        <Feather name={icon} size={22} color={isDanger ? '#fff' : palette.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, isDanger && { color: palette.danger }]}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Feather
        name="chevron-right"
        size={20}
        color={isDanger ? palette.danger : palette.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  brand: { fontSize: 22, fontWeight: '700', color: palette.text, letterSpacing: -0.3 },
  signOut: { padding: 6 },

  cards: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  cardDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: palette.border,
  },
  cardDanger: {
    backgroundColor: '#FFF5F4',
    borderColor: palette.danger,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconDefault: { backgroundColor: '#F4F4F2' },
  cardIconDanger: { backgroundColor: palette.danger },
  cardTitle: { fontSize: 17, fontWeight: '700', color: palette.text, letterSpacing: -0.2 },
  cardSubtitle: { fontSize: 13, color: palette.textMuted, marginTop: 2, lineHeight: 18 },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
});
