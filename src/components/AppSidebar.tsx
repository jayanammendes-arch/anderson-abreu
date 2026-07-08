import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  BookOpen,
  HelpCircle,
  Home,
  LayoutDashboard,
  ShoppingBag,
  Store,
  Trophy,
} from 'lucide-react'

const navigation = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Produtos à Venda', href: '/produtos', icon: Store },
  { name: 'Minhas Compras', href: '/compras', icon: BookOpen },
  { name: 'Pontos e Ranking', href: '/ranking', icon: Trophy },
  { name: 'Dúvidas Frequentes', href: '/faq', icon: HelpCircle },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" className="border-r-border/50">
      <SidebarHeader className="flex h-16 items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-hidden px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="truncate font-semibold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Anderson Abreu
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className="hover:text-primary transition-colors data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <Link to={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-xl bg-card p-4 group-data-[collapsible=icon]:hidden border border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ranking Atual</p>
              <p className="text-xs text-muted-foreground">Posição #12 de 3.4k</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <div className="absolute -right-3 top-16 z-20 hidden md:block">
        <SidebarTrigger className="h-6 w-6 rounded-full border border-border bg-background shadow-md hover:bg-accent" />
      </div>
    </Sidebar>
  )
}
