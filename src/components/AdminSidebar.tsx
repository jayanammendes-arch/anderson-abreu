import { useState } from 'react'
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Brain, ArrowLeft, LogOut, ChevronRight } from 'lucide-react'
import { adminCentralItem, adminNavGroups } from '@/lib/admin-nav'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  const { signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Área de Alunos': true,
    Site: true,
  })

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const isItemActive = (href: string) => location.pathname.startsWith(href)

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
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isItemActive(adminCentralItem.href)}
                  className="text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <Link to={adminCentralItem.href}>
                    <adminCentralItem.icon className="h-4 w-4" />
                    <span>{adminCentralItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminNavGroups.map((group) => {
          const isOpen = openGroups[group.label] ?? true
          const hasActiveChild = group.items.some((item) => isItemActive(item.href))
          return (
            <Collapsible
              key={group.label}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.label)}
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex cursor-pointer items-center justify-between text-white/40 hover:text-white/70">
                    <span>{group.label}</span>
                    <ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isOpen && 'rotate-90',
                      )}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          {group.collapsible ? (
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isItemActive(item.href)}
                                  className="text-white/70 hover:bg-white/5 hover:text-white"
                                >
                                  <Link to={item.href}>
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          ) : (
                            <SidebarMenuButton
                              asChild
                              isActive={isItemActive(item.href)}
                              className="text-white/70 hover:bg-white/5 hover:text-white"
                            >
                              <Link to={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        })}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
