'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTenant } from '@/hooks/use-tenant'
import { AdminOnly } from '@/components/auth/permission-guard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Kanban,
  DollarSign,
  Brain,
  Bot,
  Settings,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'

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
  {
    name: 'Automações',
    href: '/automations',
    icon: Bot,
    current: false,
    badge: 'NEW',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { tenant } = useTenant()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { unreadCount } = useNotifications()

  async function handleSignOut() {
    await signOut({ callbackUrl: '/auth/signin' })
  }

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
                  {(item.badge || (item.name === 'Automações' && unreadCount > 0)) && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.name === 'Automações' && unreadCount > 0 ? unreadCount : item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            <Link
              href="/configuracoes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </Link>

            {/* Gestão de Usuários - Apenas para Admins */}
            <AdminOnly>
              <Link
                href="/usuarios"
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Usuários</span>
              </Link>
            </AdminOnly>

            {/* User Menu */}
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 py-2 h-auto"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback className="text-xs">
                        {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                                         <div className="flex-1 text-left">
                       <p className="text-sm font-medium text-gray-900">
                         {session.user.name}
                       </p>
                       <p className="text-xs text-gray-500">
                         {session.user.email}
                       </p>
                       {tenant?.role && (
                         <p className="text-xs text-blue-600 font-medium">
                           {tenant.role === 'OWNER' ? 'Proprietário' : tenant.role === 'ADMIN' ? 'Administrador' : 'Membro'}
                         </p>
                       )}
                     </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
