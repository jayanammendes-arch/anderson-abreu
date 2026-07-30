import type { LucideIcon } from 'lucide-react'
import {
  Settings,
  FileText,
  BookOpen,
  Users,
  KeyRound,
  MessageSquareQuote,
  Calendar,
  HelpCircle,
  MessageCircle,
  Award,
  Mail,
  Stethoscope,
  Newspaper,
  Globe,
  BadgeCheck,
  Images,
  Radar,
  Contact,
  Sparkles,
  ClipboardList,
} from 'lucide-react'

export interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export interface AdminNavGroup {
  label: string
  collapsible: boolean
  items: AdminNavItem[]
}

export const adminCentralItem: AdminNavItem = {
  title: 'Central',
  href: '/admin/configuracoes',
  icon: Settings,
  description: 'Visão geral e atalhos do painel administrativo',
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: 'Área de Alunos',
    collapsible: true,
    items: [
      {
        title: 'Cursos',
        href: '/admin/cursos',
        icon: BookOpen,
        description: 'Gerenciar cursos, módulos e aulas da plataforma',
      },
      {
        title: 'Alunos',
        href: '/admin/alunos',
        icon: Users,
        description: 'Gerenciar alunos e acessos aos cursos',
      },
      {
        title: 'Liberações',
        href: '/admin/liberacoes',
        icon: KeyRound,
        description: 'Gerenciar liberações de acesso aos cursos',
      },
      {
        title: 'Certificados',
        href: '/admin/certificados',
        icon: Award,
        description: 'Gerenciar certificados emitidos aos alunos',
      },
      {
        title: 'Comunidade',
        href: '/admin/comunidade',
        icon: MessageCircle,
        description: 'Moderar posts e interações da comunidade',
      },
      {
        title: 'Depoimentos',
        href: '/admin/depoimentos',
        icon: MessageSquareQuote,
        description: 'Gerenciar depoimentos de alunos',
      },
      {
        title: 'FAQs',
        href: '/admin/faqs',
        icon: HelpCircle,
        description: 'Gerenciar perguntas frequentes da área do aluno',
      },
      {
        title: 'Roda da Vida — Categorias',
        href: '/admin/roda-da-vida-categorias',
        icon: Radar,
        description: 'Gerenciar categorias da Roda da Vida',
      },
      {
        title: 'Roda da Vida — Perguntas',
        href: '/admin/roda-da-vida-perguntas',
        icon: Radar,
        description: 'Gerenciar perguntas da Roda da Vida',
      },
      {
        title: 'CRM',
        href: '/admin/crm',
        icon: Contact,
        description: 'Gestão de leads e funil de vendas',
      },
      {
        title: 'Formulários',
        href: '/admin/forms',
        icon: ClipboardList,
        description: 'Criar e gerenciar formulários dinâmicos',
      },
      {
        title: 'Comece por Aqui',
        href: '/admin/comece-por-aqui',
        icon: Sparkles,
        description: 'Configurar jornada de onboarding dos alunos',
      },
    ],
  },
  {
    label: 'Site',
    collapsible: true,
    items: [
      {
        title: 'Páginas Principais',
        href: '/admin/paginas',
        icon: FileText,
        description: 'Editar textos, imagens e configurações da plataforma',
      },
      {
        title: 'Categorias de Tratamento',
        href: '/admin/categorias-tratamentos',
        icon: Stethoscope,
        description: 'Gerenciar categorias de tratamento e seções dinâmicas',
      },
      {
        title: 'Blog',
        href: '/admin/blog',
        icon: Newspaper,
        description: 'Criar e gerenciar posts do blog',
      },
      {
        title: 'Agenda',
        href: '/admin/agenda',
        icon: Calendar,
        description: 'Gerenciar eventos e agenda da plataforma',
      },
      {
        title: 'FAQs do Site',
        href: '/admin/site-faqs',
        icon: Globe,
        description: 'Gerenciar perguntas frequentes públicas do site',
      },
      {
        title: 'Contatos',
        href: '/admin/contatos',
        icon: Mail,
        description: 'Visualizar mensagens de contato recebidas',
      },
      {
        title: 'Certificações',
        href: '/admin/certificacoes',
        icon: BadgeCheck,
        description: 'Gerenciar logos de certificações exibidos no site',
      },
      {
        title: 'Conteúdo Sobre',
        href: '/admin/sobre-conteudo',
        icon: Images,
        description: 'Gerenciar galerias e conteúdo da página Sobre',
      },
    ],
  },
]

export const adminNavItems: AdminNavItem[] = [
  adminCentralItem,
  ...adminNavGroups.flatMap((g) => g.items),
]
