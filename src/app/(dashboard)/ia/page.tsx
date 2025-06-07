import { Metadata } from 'next'
import { IACentralDashboard } from '@/components/ia/ia-central-dashboard'

export const metadata: Metadata = {
  title: 'IA Central - AgênciaOS',
  description: 'Central de Inteligência Artificial para agências digitais',
}

export default function IACentralPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">IA Central</h2>
        <div className="text-sm text-muted-foreground">
          Assistente inteligente para sua agência
        </div>
      </div>
      <IACentralDashboard />
    </div>
  )
}
