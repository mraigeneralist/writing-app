import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, space } from '@/theme';

type Action = { label: string; onPress: () => void; tint?: string };

export function FloatingActionButton({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {open && (
        <View style={styles.menu}>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                a.onPress();
              }}
            >
              <Text style={[styles.menuText, a.tint ? { color: a.tint } : null]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={styles.fabText}>{open ? '×' : '+'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: space.lg,
    bottom: space.xl,
    alignItems: 'flex-end',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300' },
  menu: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    paddingVertical: space.xs,
    marginBottom: space.sm,
    minWidth: 200,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: { paddingHorizontal: space.md, paddingVertical: space.md },
  menuText: { fontSize: 16, color: palette.text, fontWeight: '500' },
});
