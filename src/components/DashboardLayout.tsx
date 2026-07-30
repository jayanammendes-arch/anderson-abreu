import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Loader2, User, Award, ShoppingBag, LifeBuoy } from 'lucide-react'
import { NotificationBell } from '@/components/community/NotificationBell'
import { LevelBadge } from '@/components/LevelBadge'
import { useState, useEffect } from 'react'
import { getPlatformSettingsPublic, getLogoUrl } from '@/services/landing'
import { useRealtime } from '@/hooks/use-realtime'
import type { PlatformSettings } from '@/types'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/comece-por-aqui': 'Comece por Aqui',
  '/dashboard/produtos': 'Produtos',
  '/dashboard/compras': 'Compras',
  '/dashboard/comunidade': 'Comunidade',
  '/dashboard/ranking': 'Ranking',
  '/dashboard/faq': 'FAQ',
  '/dashboard/profile': 'Perfil',
  '/dashboard/certificates': 'Certificados',
  '/dashboard/roda-da-vida': 'Roda da Vida',
}

export function DashboardLayout() {
  const { isAuthenticated, loading, user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    getPlatformSettingsPublic()
      .then(setPlatformSettings)
      .catch(() => {})
  }, [isAuthenticated])

  useRealtime(
    'platform_settings',
    () => {
      getPlatformSettingsPublic()
        .then(setPlatformSettings)
        .catch(() => {})
    },
    isAuthenticated,
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const userName = user?.name || 'Aluno'
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
    : undefined
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-6">
          <SidebarTrigger className="-ml-1 text-foreground hover:bg-muted" />
          <Separator orientation="vertical" className="h-5 bg-border" />
          {platformSettings &&
            (platformSettings as any).show_logo !== false &&
            getLogoUrl(platformSettings) && (
              <img
                src={getLogoUrl(platformSettings)!}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            )}
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{userName}</span>
                  {user?.level && <LevelBadge level={user.level} size="sm" />}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      {user?.level && <LevelBadge level={user.level} size="sm" />}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Acessar perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard/certificates')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Certificados
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard/compras')}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Minhas compras
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard/faq')}
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Central de ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => {
                    signOut()
                    navigate('/login')
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
