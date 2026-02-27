/**
 * Desenrola Voice — all user-facing copy strings
 * Casual, friendly, Brazilian Portuguese
 */

export const messages = {
  // ─── Onboarding ─────────────────────────────────────────────
  onboarding: {
    welcome: 'E aí! Bora desenrolar suas finanças?',
    subtitle: 'Vou te guiar em 5 minutinhos. Relaxa!',
    stepSalary: 'Primeiro, me conta sobre sua renda',
    stepAccounts: 'Agora, suas contas e cartões',
    stepBills: 'Quais contas fixas você paga todo mês?',
    stepParcelas: 'Tem parcelas rolando?',
    stepBudget: 'Bora definir uns limites de gasto?',
    done: 'Pronto! Sua vida financeira tá no radar. 🎯',
  },

  // ─── Dashboard ──────────────────────────────────────────────
  dashboard: {
    greeting: (name?: string) =>
      name ? `E aí, ${name}! 👋` : 'E aí! 👋',
    monthSummary: 'Resumo do mês',
    balance: 'Saldo do mês',
    income: 'Receitas',
    expenses: 'Gastos',
    upcomingBills: 'Próximas contas',
    noBills: 'Nenhuma conta nos próximos dias. Sussa! 😎',
    parcelas: 'Parcelas ativas',
    cashFlow: 'Fluxo de caixa',
  },

  // ─── Transactions ───────────────────────────────────────────
  transactions: {
    title: 'Transações',
    empty: 'Nenhuma transação ainda. Adicione a primeira!',
    added: 'Anotado! 📝',
    deleted: 'Transação removida',
    quickAdd: 'Nova transação',
  },

  // ─── Bills ──────────────────────────────────────────────────
  bills: {
    title: 'Contas a Pagar',
    paid: (remaining: number) =>
      `Pago! ✅ ${remaining > 0 ? `Faltam ${remaining} contas esse mês.` : 'Zerou as contas do mês! 🎉'}`,
    overdue: (name: string, days: number) =>
      `${name} venceu há ${days} dias. Bora resolver?`,
    upcoming: (name: string, days: number, amount: string) =>
      days === 0
        ? `${name} vence hoje (${amount}). Bora pagar?`
        : days === 1
          ? `${name} vence amanhã (${amount})`
          : `${name} vence em ${days} dias (${amount})`,
    noBills: 'Nenhuma conta cadastrada. Adicione suas contas fixas!',
  },

  // ─── Parcelas ───────────────────────────────────────────────
  parcelas: {
    title: 'Parcelas',
    commitment: (percent: number) =>
      percent > 40
        ? `⚠️ ${percent}% da renda comprometida em parcelas. Fica de olho!`
        : `${percent}% da renda em parcelas. Tá controlado! 👍`,
    empty: 'Nenhuma parcela ativa. Boa! 🎉',
    added: 'Anotado! Fica de olho no comprometimento.',
    simulatorTitle: 'Simulador de Parcelas',
  },

  // ─── Salary ─────────────────────────────────────────────────
  salary: {
    title: 'Salário',
    netResult: (net: string) => `Seu líquido: ${net}`,
    decimoTerceiro: '13º Salário',
  },

  // ─── Budget ─────────────────────────────────────────────────
  budget: {
    title: 'Orçamento',
    exceeded: (category: string, spent: string, limit: string) =>
      `Opa, estourou o limite de ${category} (${spent} de ${limit}). Quer ajustar?`,
    warning: (category: string, percent: number) =>
      `${category} tá em ${percent}% do limite. Atenção! ⚠️`,
    onTrack: 'Orçamento no trilho! Continue assim. 👏',
  },

  // ─── Goals ──────────────────────────────────────────────────
  goals: {
    title: 'Metas',
    reached: (name: string) => `CONSEGUIU! 🎉 ${name} completa. Você é fera!`,
    progress: (name: string, percent: number) =>
      `${name}: ${percent}% concluído. Tá chegando!`,
    empty: 'Nenhuma meta definida. Que tal começar pela reserva de emergência?',
  },

  // ─── Tax ────────────────────────────────────────────────────
  tax: {
    title: 'IRPF',
    deductiblesTotal: (total: string) =>
      `Total de dedutíveis acumulados: ${total}`,
    reminder: 'Lembre de guardar os informes de rendimento!',
  },

  // ─── AI ─────────────────────────────────────────────────────
  ai: {
    title: 'Assistente',
    placeholder: 'Pergunte algo sobre suas finanças...',
    thinking: 'Analisando...',
    greeting: 'Oi! Sou seu assistente financeiro. Como posso ajudar?',
    error: 'Ops, tive um problema. Tenta de novo?',
  },

  // ─── Generic ────────────────────────────────────────────────
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    back: 'Voltar',
    loading: 'Carregando...',
    error: 'Ops, algo deu errado.',
    confirm: 'Confirmar',
    search: 'Buscar...',
    noResults: 'Nada encontrado',
    markAsPaid: 'Marcar como pago',
  },
} as const
