import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Home,
  Package,
  ShoppingBag,
  HelpCircle,
  GraduationCap,
  Settings,
  Users,
  Radar,
  Sparkles,
} from 'lucide-react'

const studentNavItems = [
  { title: 'Início', href: '/dashboard', icon: Home },
  { title: 'Comece por Aqui', href: '/dashboard/comece-por-aqui', icon: Sparkles },
  { title: 'Roda da Vida', href: '/dashboard/roda-da-vida', icon: Radar },
  { title: 'Produtos', href: '/dashboard/produtos', icon: Package },
  { title: 'Compras', href: '/dashboard/compras', icon: ShoppingBag },
  { title: 'Comunidade', href: '/dashboard/comunidade', icon: Users },
  { title: 'FAQ', href: '/dashboard/faq', icon: HelpCircle },
]

const adminNavItems = [{ title: 'Configurações', href: '/admin/configuracoes', icon: Settings }]

export function AppSidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = Boolean(user?.is_admin)

  const getInitials = (name: string) => {
    if (!name) return 'AA'
    const parts = name.split(' ')
    return (
      parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'AA'
    )
  }

  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
    : undefined

  const checkActive = (href: string) =>
    href === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(href)

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-lg font-bold">Anderson Abreu</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={checkActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={checkActive(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
