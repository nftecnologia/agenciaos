'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  
  // Páginas que não devem ter sidebar - mais específico
  const isAuthPage = pathname?.startsWith('/auth/')
  
  // Se é página de auth, renderiza apenas o conteúdo
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <MobileNav />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg">AgênciaOS</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
