import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, space } from '@/theme';

type Props = {
  title?: string | null;
  preview?: string;
  updatedAt?: string;
  onPress: () => void;
};

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function NoteCard({ title, preview, updatedAt, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {title?.trim() || 'Untitled'}
        </Text>
        {preview ? (
          <Text style={styles.preview} numberOfLines={2}>
            {preview}
          </Text>
        ) : null}
      </View>
      <Text style={styles.date}>{formatDate(updatedAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: { fontSize: 17, fontWeight: '600', color: palette.text },
  preview: { fontSize: 14, color: palette.textMuted, marginTop: 2 },
  date: { fontSize: 12, color: palette.textMuted, marginLeft: space.sm },
});
