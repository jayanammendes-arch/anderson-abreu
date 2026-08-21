import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getOnboardingConfig } from '@/services/onboarding'
import { getFormSubmission } from '@/services/forms'
import { getPreHypnosisForm } from '@/services/pre-hypnosis-forms'
import type { OnboardingStep } from '@/types'
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
  useSidebar,
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

const DEFAULT_STEPS: OnboardingStep[] = [
  { type: 'form', label: 'Formulário Pré-Hipnose' },
  { type: 'life_wheel', label: 'Roda da Vida' },
  { type: 'lesson', label: 'Primeira Aula' },
  { type: 'audio', label: 'Primeiro Áudio' },
]

// Itens de navegação base (visíveis a qualquer aluno autenticado).
const baseNavItems = [
  { title: 'Início', href: '/dashboard', icon: Home },
  { title: 'FAQ', href: '/dashboard/faq', icon: HelpCircle },
]

// Itens liberados apenas para alunos com nível atribuído (Prata/Ouro/Diamante).
const levelNavItems = [
  {
    title: 'Comece por Aqui',
    href: '/dashboard/comece-por-aqui',
    icon: Sparkles,
    requiresComecePorAqui: true,
    requiresFormCompleted: false,
  },
  {
    title: 'Roda da Vida',
    href: '/dashboard/roda-da-vida',
    icon: Radar,
    requiresComecePorAqui: false,
    requiresFormCompleted: true,
  },
  {
    title: 'Produtos',
    href: '/dashboard/produtos',
    icon: Package,
    requiresComecePorAqui: false,
    requiresFormCompleted: false,
  },
  {
    title: 'Compras',
    href: '/dashboard/compras',
    icon: ShoppingBag,
    requiresComecePorAqui: false,
    requiresFormCompleted: false,
  },
  {
    title: 'Comunidade',
    href: '/dashboard/comunidade',
    icon: Users,
    requiresComecePorAqui: false,
    requiresFormCompleted: false,
  },
]

const adminNavItems = [{ title: 'Configurações', href: '/admin/configuracoes', icon: Settings }]

export function AppSidebar() {
  const { user, hasLevel, canAccessComecePorAqui } = useAuth()
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()
  const isAdmin = Boolean(user?.is_admin)

  const [formCompleted, setFormCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true

    async function checkForm() {
      if (!user) {
        if (isMounted) setFormCompleted(false)
        return
      }
      try {
        const cfg = await getOnboardingConfig()
        const formSteps = (cfg?.steps || DEFAULT_STEPS).filter((s) => s.type === 'form')
        const stepsWithFormId = formSteps.filter((s) => s.form_id)
        const stepsWithoutFormId = formSteps.filter((s) => !s.form_id)

        let completed = true
        if (stepsWithFormId.length > 0) {
          const submission = await getFormSubmission(user.id, stepsWithFormId[0].form_id!)
          completed = !!submission
        } else if (stepsWithoutFormId.length > 0) {
          const preHypnosisForm = await getPreHypnosisForm(user.id)
          completed = !!preHypnosisForm
        }

        if (isMounted) {
          setFormCompleted(completed)
        }
      } catch {
        if (isMounted) {
          setFormCompleted(false)
        }
      }
    }

    checkForm()

    return () => {
      isMounted = false
    }
  }, [user])

  const recheck = () => {
    if (!user) return
    getOnboardingConfig()
      .then(async (cfg) => {
        const formSteps = (cfg?.steps || DEFAULT_STEPS).filter((s) => s.type === 'form')
        const stepsWithFormId = formSteps.filter((s) => s.form_id)
        const stepsWithoutFormId = formSteps.filter((s) => !s.form_id)

        let completed = true
        if (stepsWithFormId.length > 0) {
          const submission = await getFormSubmission(user.id, stepsWithFormId[0].form_id!)
          completed = !!submission
        } else if (stepsWithoutFormId.length > 0) {
          const preHypnosisForm = await getPreHypnosisForm(user.id)
          completed = !!preHypnosisForm
        }
        setFormCompleted(completed)
      })
      .catch(() => {})
  }

  useRealtime('onboarding_config', recheck)
  useRealtime('form_submissions', recheck)
  useRealtime('pre_hypnosis_forms', recheck)

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile])

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
              {/* Itens base — sempre visíveis (Início, FAQ) */}
              {baseNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={checkActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Itens de nível — só para alunos com nível atribuído */}
              {hasLevel &&
                levelNavItems
                  .filter((item) => {
                    if (item.requiresComecePorAqui && !canAccessComecePorAqui) return false
                    if (item.requiresFormCompleted && formCompleted !== true) return false
                    return true
                  })
                  .map((item) => (
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
