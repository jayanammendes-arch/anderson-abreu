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
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Trophy,
  HelpCircle,
  LogOut,
} from 'lucide-react'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Produtos', href: '/produtos', icon: BookOpen },
  { title: 'Compras', href: '/compras', icon: ShoppingBag },
  { title: 'Ranking', href: '/ranking', icon: Trophy },
  { title: 'FAQ', href: '/faq', icon: HelpCircle },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

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

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white">Anderson Abreu</span>
            <p className="text-xs text-muted-foreground">Área do Aluno</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className="text-white/70 hover:bg-white/5 hover:text-white"
                  >
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
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback className="bg-primary text-xs text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-white/50 hover:text-white" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
