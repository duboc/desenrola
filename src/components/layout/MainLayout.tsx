import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { QuickAdd } from './QuickAdd'

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <QuickAdd />
    </div>
  )
}
