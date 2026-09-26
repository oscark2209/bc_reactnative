// src/theme/index.ts

export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  background: '#0B0F19',
  surface: '#1E293B',
  surfaceElevated: '#111827',
  surfaceHighlight: '#334155',
  border: '#334155',
  borderLight: '#1F2937',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  available: '#10B981',
  availableBg: '#064E3B',
  availableText: '#34D399',
  loan: '#F59E0B',
  loanBg: '#78350F',
  loanText: '#FBBF24',
  assigned: '#8B5CF6',
  assignedBg: '#581C87',
  assignedText: '#C084FC',
  maintenance: '#EF4444',
  maintenanceBg: '#7F1D1D',
  maintenanceText: '#F87171',
  badgeCategoryBg: '#312E81',
  badgeCategoryText: '#A5B4FC',
  badgeLevelBg: '#1E1B4B',
  badgeLevelBorder: '#4338CA',
  badgeLevelText: '#C7D2FE',
  studentHighlight: '#38BDF8',
};

export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};

export const SIZES = {
  borderThin: 1,
  cardImageHeight: 180,
  searchInputHeight: 48,
  separatorHeight: 12,
  headerPaddingTop: 54,
};

export const TYPOGRAPHY = {
  headerTag: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: COLORS.badgeLevelText,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.primaryLight,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.textPrimary,
  },
  metaStudent: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.studentHighlight,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  searchCounter: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.primaryLight,
  },
};
