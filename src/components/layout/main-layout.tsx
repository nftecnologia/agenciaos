'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'

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
      
      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
} 