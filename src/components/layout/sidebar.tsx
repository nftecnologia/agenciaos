'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Kanban,
  DollarSign,
  Brain,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    current: false,
  },
  {
    name: 'Projetos',
    href: '/projetos',
    icon: FolderOpen,
    current: false,
  },
  {
    name: 'Kanban',
    href: '/kanban',
    icon: Kanban,
    current: false,
  },
  {
    name: 'Financeiro',
    href: '/financeiro',
    icon: DollarSign,
    current: false,
  },
  {
    name: 'IA Central',
    href: '/ia',
    icon: Brain,
    current: false,
    badge: '31',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">AgênciaOS</h1>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Link
              href="/configuracoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
} 