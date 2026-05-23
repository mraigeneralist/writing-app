import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { EditorBridge } from '@10play/tentap-editor';

import { supabase } from '@/lib/supabase';
import { palette, radius, space } from '@/theme';

type Props = { editor: EditorBridge };

type BlockAction = { label: string; icon: keyof typeof Feather.glyphMap; run: () => void };
type FormatAction = { label: string; icon: keyof typeof Feather.glyphMap; run: () => void };

export function NotionToolbar({ editor }: Props) {
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const blocks: BlockAction[] = [
    { label: 'Heading 1', icon: 'type', run: () => editor.toggleHeading(1) },
    { label: 'Heading 2', icon: 'type', run: () => editor.toggleHeading(2) },
    { label: 'Heading 3', icon: 'type', run: () => editor.toggleHeading(3) },
    { label: 'Bullet list', icon: 'list', run: () => editor.toggleBulletList() },
    { label: 'Numbered list', icon: 'list', run: () => editor.toggleOrderedList() },
    { label: 'To-do list', icon: 'check-square', run: () => editor.toggleTaskList() },
    { label: 'Blockquote', icon: 'message-square', run: () => editor.toggleBlockquote() },
  ];

  const formats: FormatAction[] = [
    { label: 'Bold', icon: 'bold', run: () => editor.toggleBold() },
    { label: 'Italic', icon: 'italic', run: () => editor.toggleItalic() },
    { label: 'Underline', icon: 'underline', run: () => editor.toggleUnderline() },
    { label: 'Strikethrough', icon: 'minus', run: () => editor.toggleStrike() },
    { label: 'Code', icon: 'code', run: () => editor.toggleCode() },
  ];

  async function pickAndUploadImage() {
    setBlockMenuOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const path = `${userId}/${fileName}`;

      const arrayBuffer = decodeBase64ToArrayBuffer(asset.base64!);
      const { error: upErr } = await supabase.storage
        .from('note-images')
        .upload(path, arrayBuffer, {
          contentType: asset.mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: false,
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('note-images').getPublicUrl(path);
      editor.setImage(pub.publicUrl);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Unknown error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.bar}>
      <ToolButton icon="plus" onPress={() => setBlockMenuOpen(true)} />
      <ToolButton icon="image" onPress={pickAndUploadImage} loading={uploading} />
      <AaButton onPress={() => setFormatMenuOpen(true)} />
      <ToolButton icon="rotate-ccw" onPress={() => editor.undo()} />
      <ToolButton icon="rotate-cw" onPress={() => editor.redo()} />
      <ToolButton icon="chevron-down" onPress={() => Keyboard.dismiss()} />

      <BottomSheet open={blockMenuOpen} onClose={() => setBlockMenuOpen(false)} title="Insert">
        {blocks.map((b) => (
          <MenuRow
            key={b.label}
            label={b.label}
            icon={b.icon}
            onPress={() => {
              b.run();
              setBlockMenuOpen(false);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet open={formatMenuOpen} onClose={() => setFormatMenuOpen(false)} title="Format">
        {formats.map((f) => (
          <MenuRow
            key={f.label}
            label={f.label}
            icon={f.icon}
            onPress={() => {
              f.run();
              setFormatMenuOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

function ToolButton({
  icon,
  onPress,
  loading,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      hitSlop={8}
    >
      <Feather name={icon} size={22} color={loading ? palette.textMuted : palette.text} />
    </Pressable>
  );
}

function AaButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      hitSlop={8}
    >
      <Text style={styles.aa}>Aa</Text>
    </Pressable>
  );
}

function MenuRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#F4F4F2' }]}
    >
      <Feather name={icon} size={20} color={palette.text} style={{ marginRight: 14 }} />
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
}

function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        {children}
      </View>
    </Modal>
  );
}

function decodeBase64ToArrayBuffer(base64: string): Uint8Array {
  const binary = globalThis.atob ? globalThis.atob(base64) : decodeBase64Polyfill(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeBase64Polyfill(b64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let str = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < b64.length; i++) {
    const c = b64[i];
    if (c === '=') break;
    const v = chars.indexOf(c);
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      str += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return str;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: palette.bg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { backgroundColor: '#F4F4F2' },
  aa: { fontSize: 17, fontWeight: '600', color: palette.text },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
    marginBottom: space.md,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  rowText: { fontSize: 16, color: palette.text, fontWeight: '500' },
});
