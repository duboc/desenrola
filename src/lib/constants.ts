// ─── São Paulo Utilities ────────────────────────────────────────
export const SP_UTILITIES = [
  { name: 'Enel SP', type: 'Luz', icon: '💡', provider: 'Enel' },
  { name: 'Sabesp', type: 'Água', icon: '💧', provider: 'Sabesp' },
  { name: 'Comgás', type: 'Gás', icon: '🔥', provider: 'Comgás' },
] as const

// ─── Common SP Institutions ─────────────────────────────────────
export const INSTITUTIONS = [
  { name: 'Nubank', color: '#820AD1', icon: '💜' },
  { name: 'Inter', color: '#FF7A00', icon: '🧡' },
  { name: 'Itaú', color: '#003399', icon: '🔵' },
  { name: 'Bradesco', color: '#CC092F', icon: '🔴' },
  { name: 'Banco do Brasil', color: '#FFCC00', icon: '🟡' },
  { name: 'Santander', color: '#EC0000', icon: '❤️' },
  { name: 'Caixa', color: '#005CA9', icon: '🏦' },
  { name: 'C6 Bank', color: '#242424', icon: '⬛' },
  { name: 'BTG Pactual', color: '#002244', icon: '🏛️' },
  { name: 'PicPay', color: '#21C25E', icon: '💚' },
  { name: 'Mercado Pago', color: '#009EE3', icon: '💙' },
  { name: 'Sodexo', color: '#ED1C24', icon: '🍽️' },
  { name: 'Alelo', color: '#00A651', icon: '💳' },
  { name: 'VR Benefícios', color: '#1B3C87', icon: '🎫' },
  { name: 'iFood Benefícios', color: '#EA1D2C', icon: '🛵' },
] as const

// ─── Default Account Colors ─────────────────────────────────────
export const ACCOUNT_COLORS = [
  '#8B5CF6', '#3B82F6', '#06B6D4', '#10B981',
  '#22C55E', '#F59E0B', '#F97316', '#EF4444',
  '#EC4899', '#A855F7', '#6366F1', '#14B8A6',
]

// ─── Navigation Items ───────────────────────────────────────────
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: 'LayoutDashboard', path: '/' },
  { id: 'transactions', label: 'Transações', icon: 'ArrowLeftRight', path: '/transactions' },
  { id: 'bills', label: 'Contas a Pagar', icon: 'Calendar', path: '/bills' },
  { id: 'parcelas', label: 'Parcelas', icon: 'RefreshCw', path: '/parcelas' },
  { id: 'salary', label: 'Salário', icon: 'Briefcase', path: '/salary' },
  { id: 'budget', label: 'Orçamento', icon: 'ClipboardList', path: '/budget' },
  { id: 'goals', label: 'Metas', icon: 'Target', path: '/goals' },
  { id: 'investments', label: 'Investimentos', icon: 'TrendingUp', path: '/investments' },
  { id: 'tax', label: 'IRPF', icon: 'Landmark', path: '/tax' },
  { id: 'ai', label: 'Assistente', icon: 'Bot', path: '/ai' },
] as const

// ─── Keyboard Shortcuts ─────────────────────────────────────────
export const SHORTCUTS = {
  QUICK_ADD: 'Ctrl+N',
  SEARCH: 'Ctrl+F',
  DASHBOARD: 'Ctrl+1',
  TRANSACTIONS: 'Ctrl+2',
  BILLS: 'Ctrl+3',
  PARCELAS: 'Ctrl+4',
  AI_CHAT: 'Ctrl+0',
} as const
