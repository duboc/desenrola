import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { useAppStore } from '@/stores/appStore'
import { Sun, Moon, Monitor, Database, Download, Upload, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore()
  const [backupStatus, setBackupStatus] = useState<string | null>(null)

  const handleBackup = async () => {
    try {
      const result = await window.api.system.backup()
      setBackupStatus(`Backup salvo em: ${(result as any).path}`)
    } catch {
      setBackupStatus('Erro ao criar backup')
    }
  }

  const handleExport = async () => {
    const csv = await window.api.system.exportData('csv')
    // Create download
    const blob = new Blob([csv as string], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `desenrola-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Header title="Configurações" showMonthNav={false} />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Theme */}
        <div className="card">
          <h2 className="text-base font-bold text-stone-800 dark:text-white mb-4">
            Aparência
          </h2>
          <div className="flex gap-3">
            {[
              { value: 'light' as const, label: 'Claro', icon: Sun },
              { value: 'dark' as const, label: 'Escuro', icon: Moon },
              { value: 'system' as const, label: 'Sistema', icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                }`}
              >
                <Icon size={20} className={theme === value ? 'text-emerald-600' : 'text-stone-400'} />
                <span className={`text-sm font-medium ${
                  theme === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Data management */}
        <div className="card">
          <h2 className="text-base font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <Database size={18} />
            Dados
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleBackup}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Fazer backup
            </button>

            <button
              onClick={handleExport}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Exportar CSV
            </button>

            {backupStatus && (
              <p className="text-xs text-emerald-600 text-center">{backupStatus}</p>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="card">
          <h2 className="text-base font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={18} />
            Privacidade
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            Seus dados financeiros ficam armazenados localmente no seu computador em um arquivo SQLite.
            Nenhum dado é enviado para servidores externos. O assistente de IA só acessa seus dados
            durante a conversa e não armazena nada na nuvem.
          </p>
        </div>

        {/* About */}
        <div className="card text-center">
          <div className="text-3xl mb-2">&#127744;</div>
          <p className="text-lg font-bold text-stone-800 dark:text-white">Desenrola</p>
          <p className="text-xs text-stone-400 mt-1">Versão 1.0.0</p>
          <p className="text-xs text-stone-400 mt-2">
            Seu parceiro financeiro que fala sua língua.
          </p>
        </div>
      </div>
    </div>
  )
}
