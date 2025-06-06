'use client'

import { useSession } from 'next-auth/react'
import { useTenant } from '@/hooks/use-tenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const tenant = useTenant()
  const [apiTest, setApiTest] = useState<{ status: number; data: unknown } | { error: string } | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [usersData, setUsersData] = useState<{ status: number; data: unknown } | { error: string } | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [fixLoading, setFixLoading] = useState(false)
  const [fixResult, setFixResult] = useState<{ status: number; data: unknown } | { error: string } | null>(null)

  const testApi = async () => {
    setApiLoading(true)
    try {
      const response = await fetch('/api/debug/session')
      const data = await response.json()
      setApiTest({ status: response.status, data })
    } catch (error) {
      setApiTest({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setApiLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/debug/users')
      const data = await response.json()
      setUsersData({ status: response.status, data })
    } catch (error) {
      setUsersData({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setUsersLoading(false)
    }
  }

  const fixUsers = async () => {
    setFixLoading(true)
    try {
      const response = await fetch('/api/debug/fix-users', { method: 'POST' })
      const data = await response.json()
      setFixResult({ status: response.status, data })
      // Recarregar dados dos usuários
      await loadUsers()
    } catch (error) {
      setFixResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setFixLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Debug - Estado da Sessão</h1>
        <p className="text-muted-foreground">Informações para debug do sistema de autenticação</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status da Sessão */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Sessão</CardTitle>
            <CardDescription>Informações do NextAuth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={status === 'authenticated' ? 'default' : 'destructive'}>
                {status}
              </Badge>
            </div>
            
            {session ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {session.user?.id || 'N/A'}</div>
                <div><strong>Email:</strong> {session.user?.email || 'N/A'}</div>
                <div><strong>Nome:</strong> {session.user?.name || 'N/A'}</div>
                <div><strong>Role:</strong> {session.user?.role || 'N/A'}</div>
                <div><strong>Agency ID:</strong> {session.user?.agencyId || 'N/A'}</div>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma sessão ativa</p>
            )}
          </CardContent>
        </Card>

        {/* Informações do Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tenant</CardTitle>
            <CardDescription>Hook useTenant()</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div><strong>Agency ID:</strong> {tenant.tenant?.agencyId || 'N/A'}</div>
              <div><strong>User ID:</strong> {tenant.tenant?.userId || 'N/A'}</div>
              <div><strong>Role:</strong> {tenant.tenant?.role || 'N/A'}</div>
              <div><strong>Is Owner:</strong> {tenant.isOwner ? 'Sim' : 'Não'}</div>
              <div><strong>Is Admin:</strong> {tenant.isAdmin ? 'Sim' : 'Não'}</div>
              <div><strong>Is Member:</strong> {tenant.isMember ? 'Sim' : 'Não'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de API */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Teste de API</CardTitle>
            <CardDescription>Testar chamada para API protegida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testApi} disabled={apiLoading}>
                {apiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Sessão'
                )}
              </Button>

              <Button onClick={loadUsers} disabled={usersLoading} variant="outline">
                {usersLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Verificar Usuários'
                )}
              </Button>

              <Button onClick={fixUsers} disabled={fixLoading} variant="destructive">
                {fixLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Corrigindo...
                  </>
                ) : (
                  'Corrigir Usuários'
                )}
              </Button>
            </div>

            {apiTest && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Resultado da Sessão:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(apiTest, null, 2)}
                </pre>
              </div>
            )}

            {usersData && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Dados dos Usuários:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(usersData, null, 2)}
                </pre>
              </div>
            )}

            {fixResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium mb-2 text-green-800">Resultado da Correção:</h4>
                <pre className="text-sm overflow-auto text-green-700">
                  {JSON.stringify(fixResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
