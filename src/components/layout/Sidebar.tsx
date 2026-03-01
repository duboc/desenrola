import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Calendar, RefreshCw,
  Briefcase, ClipboardList, Target, TrendingUp,
  Landmark, Bot, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard, Wallet, ArrowLeftRight, Calendar, RefreshCw,
  Briefcase, ClipboardList, Target, TrendingUp,
  Landmark, Bot,
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const location = useLocation()

  return (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 drag-region">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg shrink-0 no-drag">
          <span role="img" aria-label="Desenrola">&#127744;</span>
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-extrabold text-stone-800 dark:text-white tracking-tight no-drag">
            Desenrola
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {Icon && <Icon size={20} />}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-stone-200 dark:border-stone-700 space-y-0.5">
        <NavLink
          to="/settings"
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          title={sidebarCollapsed ? 'Configurações' : undefined}
        >
          <Settings size={20} />
          {!sidebarCollapsed && <span>Configurações</span>}
        </NavLink>

        <button
          onClick={toggleSidebar}
          className="nav-item w-full justify-center"
          title={sidebarCollapsed ? 'Expandir' : 'Recolher'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
