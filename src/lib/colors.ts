export const brandColors = {
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warm: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
  },
  danger: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
} as const

// Semantic colors for transaction types
export const semanticColors = {
  income: '#22C55E',
  expense: '#EF4444',
  transfer: '#3B82F6',
  pending: '#F59E0B',
} as const

// Category color palette
export const categoryColors = [
  '#8B5CF6', // Purple — Moradia
  '#3B82F6', // Blue — Transporte
  '#F59E0B', // Amber — Alimentação
  '#EF4444', // Red — Saúde
  '#06B6D4', // Cyan — Educação
  '#EC4899', // Pink — Lazer
  '#F97316', // Orange — Compras
  '#A855F7', // Violet — Pets
  '#64748B', // Slate — Impostos
  '#10B981', // Emerald — Investimentos
  '#22C55E', // Green — Renda
] as const
