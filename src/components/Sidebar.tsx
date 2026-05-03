'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Building2,
  TrendingUp,
  Calendar,
  Settings,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contratos', label: 'Contratos', icon: FileText },
  { href: '/entidades', label: 'Entidades', icon: Building2 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/pnl', label: 'P&L Global', icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">D</span>
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Divisia</span>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Coberturas FX</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>
        <div className="px-3 pt-3">
          <p className="text-xs text-slate-500">CEN · Dos Hermanas</p>
          <p className="text-xs text-slate-600 mt-0.5">v0.1.0</p>
        </div>
      </div>
    </aside>
  )
}
