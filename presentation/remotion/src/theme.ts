import { loadFont as loadLato } from '@remotion/google-fonts/Lato';
import { loadFont as loadSerif } from '@remotion/google-fonts/NotoSerif';
import { loadFont as loadMono } from '@remotion/google-fonts/IBMPlexMono';

// Load latin subsets only — keeps the headless render light and fast.
export const lato = loadLato('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
}).fontFamily;

export const serif = loadSerif('normal', {
  weights: ['300', '400'],
  subsets: ['latin'],
}).fontFamily;

export const mono = loadMono('normal', {
  weights: ['400'],
  subsets: ['latin'],
}).fontFamily;

// Palette lifted from the app / deck (theme.scss).
export const COLORS = {
  bg: '#fcfcfc',
  ink: '#404040',
  blue: '#2b8cbe',
  blueDark: '#1c5f80',
  green: '#469408',
  light: '#DEEBF7',
  muted: '#8a8a8a',
  line: '#e6e6e6',
  full: '#d64545',
} as const;
