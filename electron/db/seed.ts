import type Database from 'better-sqlite3'

/**
 * Seed default categories, SP utilities, and initial settings
 * Only runs if categories table is empty
 */
export function seedDatabase(sqlite: Database.Database): void {
  const count = sqlite.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (count.count > 0) return

  const insertCategory = sqlite.prepare(`
    INSERT INTO categories (name, type, icon, color, parent_id, is_system, is_deductible_irpf, budget_default, sort_order)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `)

  const insertBill = sqlite.prepare(`
    INSERT INTO recurring_bills (name, category_id, due_day, provider, payment_method, amount_min, amount_max, late_fee_percent, late_interest_daily, reminder_days_before)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertSetting = sqlite.prepare(`
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
  `)

  const transaction = sqlite.transaction(() => {
    // ─── Expense Categories ───────────────────────────────────
    // Moradia
    const moradia = insertCategory.run('Moradia', 'expense', '🏠', '#8B5CF6', null, 0, 2000, 1)
    const moradiaId = moradia.lastInsertRowid
    insertCategory.run('Aluguel', 'expense', '🏠', '#8B5CF6', moradiaId, 0, null, 10)
    insertCategory.run('Condomínio', 'expense', '🏢', '#8B5CF6', moradiaId, 0, null, 11)
    insertCategory.run('IPTU', 'expense', '🏛️', '#8B5CF6', moradiaId, 0, null, 12)
    insertCategory.run('Luz (Enel)', 'expense', '💡', '#8B5CF6', moradiaId, 0, null, 13)
    insertCategory.run('Água (Sabesp)', 'expense', '💧', '#8B5CF6', moradiaId, 0, null, 14)
    insertCategory.run('Gás (Comgás)', 'expense', '🔥', '#8B5CF6', moradiaId, 0, null, 15)
    insertCategory.run('Internet', 'expense', '📡', '#8B5CF6', moradiaId, 0, null, 16)

    // Transporte
    const transporte = insertCategory.run('Transporte', 'expense', '🚗', '#3B82F6', null, 0, 800, 2)
    const transporteId = transporte.lastInsertRowid
    insertCategory.run('Metrô/Ônibus', 'expense', '🚇', '#3B82F6', transporteId, 0, null, 20)
    insertCategory.run('Uber/99', 'expense', '🚕', '#3B82F6', transporteId, 0, null, 21)
    insertCategory.run('Combustível', 'expense', '⛽', '#3B82F6', transporteId, 0, null, 22)
    insertCategory.run('Estacionamento', 'expense', '🅿️', '#3B82F6', transporteId, 0, null, 23)
    insertCategory.run('Zona Azul', 'expense', '🔵', '#3B82F6', transporteId, 0, null, 24)
    insertCategory.run('IPVA', 'expense', '📋', '#3B82F6', transporteId, 0, null, 25)

    // Alimentação
    const alimentacao = insertCategory.run('Alimentação', 'expense', '🍔', '#F59E0B', null, 0, 1500, 3)
    const alimentacaoId = alimentacao.lastInsertRowid
    insertCategory.run('Mercado', 'expense', '🛒', '#F59E0B', alimentacaoId, 0, null, 30)
    insertCategory.run('Delivery/iFood', 'expense', '🛵', '#F59E0B', alimentacaoId, 0, null, 31)
    insertCategory.run('Restaurante', 'expense', '🍽️', '#F59E0B', alimentacaoId, 0, null, 32)
    insertCategory.run('Padaria/Café', 'expense', '☕', '#F59E0B', alimentacaoId, 0, null, 33)

    // Saúde (IRPF deductible)
    const saude = insertCategory.run('Saúde', 'expense', '❤️', '#EF4444', null, 1, 800, 4)
    const saudeId = saude.lastInsertRowid
    insertCategory.run('Plano de Saúde', 'expense', '🏥', '#EF4444', saudeId, 1, null, 40)
    insertCategory.run('Farmácia', 'expense', '💊', '#EF4444', saudeId, 0, null, 41)
    insertCategory.run('Consultas', 'expense', '🩺', '#EF4444', saudeId, 1, null, 42)
    insertCategory.run('Exames', 'expense', '🔬', '#EF4444', saudeId, 1, null, 43)

    // Educação (IRPF deductible)
    const educacao = insertCategory.run('Educação', 'expense', '📚', '#06B6D4', null, 1, 500, 5)
    const educacaoId = educacao.lastInsertRowid
    insertCategory.run('Mensalidade', 'expense', '🎓', '#06B6D4', educacaoId, 1, null, 50)
    insertCategory.run('Cursos', 'expense', '📖', '#06B6D4', educacaoId, 1, null, 51)
    insertCategory.run('Livros', 'expense', '📕', '#06B6D4', educacaoId, 0, null, 52)

    // Lazer
    const lazer = insertCategory.run('Lazer', 'expense', '🎮', '#EC4899', null, 0, 500, 6)
    const lazerId = lazer.lastInsertRowid
    insertCategory.run('Streaming', 'expense', '📺', '#EC4899', lazerId, 0, null, 60)
    insertCategory.run('Academia', 'expense', '💪', '#EC4899', lazerId, 0, null, 61)
    insertCategory.run('Viagens', 'expense', '✈️', '#EC4899', lazerId, 0, null, 62)
    insertCategory.run('Cultura/Eventos', 'expense', '🎭', '#EC4899', lazerId, 0, null, 63)

    // Compras
    const compras = insertCategory.run('Compras', 'expense', '🛍️', '#F97316', null, 0, 600, 7)
    const comprasId = compras.lastInsertRowid
    insertCategory.run('Roupas', 'expense', '👔', '#F97316', comprasId, 0, null, 70)
    insertCategory.run('Eletrônicos', 'expense', '📱', '#F97316', comprasId, 0, null, 71)
    insertCategory.run('Casa/Decoração', 'expense', '🏡', '#F97316', comprasId, 0, null, 72)

    // Pets
    insertCategory.run('Pets', 'expense', '🐾', '#A855F7', null, 0, 300, 8)

    // Impostos
    const impostos = insertCategory.run('Impostos', 'expense', '🏛️', '#64748B', null, 0, null, 9)
    const impostosId = impostos.lastInsertRowid
    insertCategory.run('IRPF', 'expense', '📄', '#64748B', impostosId, 0, null, 90)
    insertCategory.run('IPTU', 'expense', '🏠', '#64748B', impostosId, 0, null, 91)
    insertCategory.run('IPVA', 'expense', '🚗', '#64748B', impostosId, 0, null, 92)

    // Investimentos (expense for contributions)
    insertCategory.run('Investimentos', 'expense', '📈', '#10B981', null, 0, null, 10)

    // ─── Income Categories ────────────────────────────────────
    const renda = insertCategory.run('Renda', 'income', '💰', '#22C55E', null, 0, null, 1)
    const rendaId = renda.lastInsertRowid
    insertCategory.run('Salário', 'income', '💼', '#22C55E', rendaId, 0, null, 100)
    insertCategory.run('13º Salário', 'income', '🎄', '#22C55E', rendaId, 0, null, 101)
    insertCategory.run('Férias + ⅓', 'income', '🏖️', '#22C55E', rendaId, 0, null, 102)
    insertCategory.run('PLR', 'income', '🎯', '#22C55E', rendaId, 0, null, 103)
    insertCategory.run('Freelance/PJ', 'income', '💻', '#22C55E', rendaId, 0, null, 104)
    insertCategory.run('Rendimentos', 'income', '📊', '#22C55E', rendaId, 0, null, 105)
    insertCategory.run('Outros', 'income', '💵', '#22C55E', rendaId, 0, null, 106)

    // ─── SP Utility Bill Templates ────────────────────────────
    // Find category IDs for linking
    const luzCat = sqlite.prepare("SELECT id FROM categories WHERE name = 'Luz (Enel)'").get() as { id: number }
    const aguaCat = sqlite.prepare("SELECT id FROM categories WHERE name = 'Água (Sabesp)'").get() as { id: number }
    const gasCat = sqlite.prepare("SELECT id FROM categories WHERE name = 'Gás (Comgás)'").get() as { id: number }

    // Enel SP — typically due around day 15-20
    insertBill.run('Enel SP (Luz)', luzCat.id, 15, 'Enel', 'boleto', 80, 350, 2, 0.033, 3)

    // Sabesp — bimonthly, typically
    insertBill.run('Sabesp (Água)', aguaCat.id, 20, 'Sabesp', 'boleto', 40, 150, 2, 0.033, 3)

    // Comgás
    insertBill.run('Comgás (Gás)', gasCat.id, 10, 'Comgás', 'boleto', 30, 120, 2, 0.033, 3)

    // ─── Default Settings ─────────────────────────────────────
    insertSetting.run('theme', JSON.stringify('system'))
    insertSetting.run('currency', JSON.stringify('BRL'))
    insertSetting.run('locale', JSON.stringify('pt-BR'))
    insertSetting.run('first_day_of_week', JSON.stringify(0)) // Sunday
    insertSetting.run('onboarding_completed', JSON.stringify(false))
    insertSetting.run('ai_provider', JSON.stringify('gemini'))
    insertSetting.run('notification_enabled', JSON.stringify(true))
    insertSetting.run('notification_time', JSON.stringify('09:00'))
    insertSetting.run('backup_auto', JSON.stringify(false))
    insertSetting.run('backup_frequency', JSON.stringify('weekly'))
  })

  transaction()
}
