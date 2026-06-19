/**
 * Peak White (TripGlide Inspired) — Design Tokens
 * Gym app · Clean Light · High Performance · Minimalist
 */
export const nebulaGold = {
  colors: {
    background: {
      primary: '#F2F2F7',      // Light gray page base
      secondary: '#FFFFFF',    // Pure white for cards/surfaces
      tertiary: '#EBEBF0',     // Borders and dividers
    },
    gold: {
      primary: '#000000',      // Primary actions are black pills
      light: '#F2F2F7',        // Light surfaces
      dark: '#1A1A1A',         // Pressed states
    },
    text: {
      primary: '#000000',      // Bold dark text
      secondary: '#8E8E93',    // Secondary labels
      muted: '#C7C7CC',        // Placeholder / hint
      gold: '#007AFF',         // Primary Blue for accents/links
      inverse: '#FFFFFF',      // Text on dark buttons
    },
    accent: {
      blue: '#007AFF',         // System Blue
      purple: '#5856D6',
    },
    status: {
      active: '#34C759',       // iOS Green
      warning: '#FF9500',      // iOS Orange
      danger: '#FF3B30',       // iOS Red
      muted: '#8E8E93',
    },
    // Adding shadow tokens for cards
    shadow: {
      light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }
    }
  },
  typography: {
    heading1: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      color: '#000000',
    },
    heading2: {
      fontSize: 22,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      color: '#000000',
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#000000',
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
      color: '#000000',
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: '#8E8E93',
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: '#000000',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    huge: 32,
    giant: 48,
  },
  borderRadius: {
    sm: 10,
    md: 14,
    lg: 24,           // Higher radius for TripGlide cards
    xl: 32,
    pill: 999,
  },
};
