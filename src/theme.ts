import { Platform } from 'react-native';

export const palette = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  border: '#ECECEA',
  accent: '#E94E3B',
  accentMuted: '#FDECE9',
  danger: '#E94E3B',
  success: '#2F855A',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const font = Platform.select({
  ios: { sans: 'System', serif: 'Georgia' },
  android: { sans: 'sans-serif', serif: 'serif' },
  default: { sans: 'System', serif: 'Georgia' },
})!;

export const type = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: palette.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: palette.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: palette.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: palette.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: palette.textMuted },
};
