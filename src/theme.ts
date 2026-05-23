import { Platform } from 'react-native';

export const palette = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#37352F',
  textMuted: '#9B9A97',
  border: '#EDECE9',
  accent: '#2EAADC',
  accentMuted: '#E7F3F8',
  danger: '#E03E3E',
  success: '#0F7B6C',
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
