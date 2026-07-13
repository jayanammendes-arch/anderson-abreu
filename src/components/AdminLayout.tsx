import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/AdminSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

const adminPageTitles: Record<string, string> = {
  '/admin/configuracoes': 'Central de Gerenciamento da Plataforma',
  '/admin/paginas': 'Configuração de Páginas Principais',
  '/admin/cursos': 'Gerenciar Cursos',
  '/admin/cursos/novo': 'Novo Curso',
  '/admin/alunos': 'Gerenciar Alunos',
  '/admin/liberacoes': 'Liberações de Acesso',
  '/admin/depoimentos': 'Gerenciar Depoimentos',
  '/admin/agenda': 'Agenda de Eventos',
  '/admin/faqs': 'Gerenciar FAQs',
  '/admin/comunidade': 'Gerenciar Comunidade',
  '/admin/certificados': 'Gerenciar Certificados',
  '/admin/contatos': 'Mensagens de Contato',
}

export function AdminLayout() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const pageTitle =
    adminPageTitles[location.pathname] ||
    (location.pathname.match(/^\/admin\/cursos\/[^/]+$/) ? 'Editar Curso' : 'Admin')

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-3 border-b border-white/10 bg-black px-6">
          <SidebarTrigger className="-ml-1 text-white hover:bg-white/5" />
          <Separator orientation="vertical" className="h-5 bg-white/10" />
          <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
        </header>
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
