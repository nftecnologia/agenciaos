"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTenant } from "@/hooks/use-tenant"
import { AdminOnly, OwnerOnly } from "@/components/auth/permission-guard"
import { cn } from "@/lib/utils"
import {
  Menu,
  Home,
  Users,
  FolderOpen,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  CreditCard,
  Zap,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    current: false,
  },
  {
    name: "Projetos",
    href: "/projetos",
    icon: FolderOpen,
    current: false,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    current: false,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    current: false,
  },
  {
    name: "Kanban",
    href: "/kanban",
    icon: Calendar,
    current: false,
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    current: false,
    adminOnly: true,
  },
]

const adminNavigation = [
  {
    name: "Usuários",
    href: "/users",
    icon: Users,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

const ownerNavigation = [
  {
    name: "Faturamento",
    href: "/billing",
    icon: CreditCard,
  },
  {
    name: "Integrações",
    href: "/integrations",
    icon: Zap,
  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { tenant } = useTenant()

  const isCurrentPath = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-6 py-6">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={() => setOpen(false)}
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg">AgênciaOS</span>
          </Link>
        </div>

        <div className="px-6">
          {tenant && (
            <div className="mb-6 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{tenant.agency.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {tenant.role.toLowerCase()}
              </p>
            </div>
          )}

          <nav className="space-y-2">
            {navigation.map((item) => {
              if (item.adminOnly) {
                return (
                  <AdminOnly key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isCurrentPath(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </AdminOnly>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCurrentPath(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            <AdminOnly>
              <div className="pt-4 mt-4 border-t">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Administração
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isCurrentPath(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </AdminOnly>

            <OwnerOnly>
              <div className="pt-4 mt-4 border-t">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Proprietário
                </p>
                {ownerNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isCurrentPath(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </OwnerOnly>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
