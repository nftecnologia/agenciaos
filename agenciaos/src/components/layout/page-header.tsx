import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode | {
    label: string
    onClick: () => void
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      
      {action && (
        typeof action === 'object' && 'label' in action ? (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          action
        )
      )}
    </div>
  )
} 