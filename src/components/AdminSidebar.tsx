import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Brain,
  Settings,
  ArrowLeft,
  LogOut,
  BookOpen,
  Users,
  Calendar,
  Palette,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react'

const adminNavItems = [
  { title: 'Central', href: '/admin/configuracoes', icon: Settings },
  { title: 'Cursos', href: '/admin/cursos', icon: BookOpen },
  { title: 'Alunos', href: '/admin/alunos', icon: Users },
  { title: 'Depoimentos', href: '/admin/depoimentos', icon: MessageSquareQuote },
  { title: 'Agenda', href: '/admin/agenda', icon: Calendar },
  { title: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { title: 'Plataforma', href: '/admin/plataforma', icon: Palette },
]

export function AdminSidebar() {
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar className="border-r border-white/10">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white">Anderson Abreu</span>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40">Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.startsWith(item.href)}
                    className="text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <Link to="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar ao Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <button
            onClick={() => {
              signOut()
              navigate('/login')
            }}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white w-full px-2 py-1.5"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
