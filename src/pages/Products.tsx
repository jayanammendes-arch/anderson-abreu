import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCourses, getThumbnailUrl } from '@/services/courses'
import { getUserAccess } from '@/services/user-access'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Search,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
  PlayCircle,
  Package,
} from 'lucide-react'
import type { Course } from '@/types'

export default function Products() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [accessCourseIds, setAccessCourseIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [allCourses, accessRecords] = await Promise.all([getCourses(), getUserAccess(user.id)])
      const userIsPatient = !!user?.is_patient
      setCourses(
        allCourses.filter((c) => c.is_available && (c.access_type !== 'patient' || userIsPatient)),
      )
      setAccessCourseIds(new Set(accessRecords.map((a) => a.course)))
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('courses', () => loadData())
  useRealtime('user_access', () => loadData())

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase().trim()),
  )
  const categories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean))) as string[]

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos à Venda</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Expanda seus conhecimentos com nossos treinamentos exclusivos. Condições especiais para
            quem já é aluno.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50 focus:border-primary"
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border/50 p-1 mb-6 flex-nowrap h-auto">
          <TabsTrigger
            value="todos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Todos os Cursos
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground capitalize"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.length > 0 ? (
              filtered.map((course) => (
                <ProductCard
                  key={course.id}
                  course={course}
                  hasAccess={accessCourseIds.has(course.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
              </div>
            )}
          </div>
        </TabsContent>
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered
                .filter((c) => c.category === cat)
                .map((course) => (
                  <ProductCard
                    key={course.id}
                    course={course}
                    hasAccess={accessCourseIds.has(course.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ProductCard({ course, hasAccess }: { course: Course; hasAccess: boolean }) {
  const hasDiscount =
    course.discount_price != null && course.price != null && course.discount_price < course.price

  return (
    <Card className="group relative overflow-hidden border-border/30 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:shadow-glow flex flex-col h-full">
      <div className="aspect-[3/4] overflow-hidden relative shrink-0">
        <img
          src={getThumbnailUrl(course)}
          alt={course.title}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {hasAccess && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white shadow-lg flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Adquirido
          </Badge>
        )}
        {hasDiscount && !hasAccess && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" />{' '}
            {course.discount_percentage ? `-${course.discount_percentage}%` : 'Oferta'}
          </Badge>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-10 bg-card">
        <CardTitle className="text-lg mb-2 leading-tight">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">
          {course.short_description || course.description}
        </p>

        <div className="mt-auto space-y-4">
          {!hasAccess && (
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-xs text-muted-foreground line-through opacity-70">
                    R$ {course.price?.toFixed(2)}
                  </span>
                  <span className="font-bold text-2xl text-primary">
                    R$ {course.discount_price?.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-2xl text-primary">
                  {course.price ? `R$ ${course.price.toFixed(2)}` : 'Consulte'}
                </span>
              )}
            </div>
          )}
          {hasAccess ? (
            <Button className="w-full" asChild>
              <Link to={`/dashboard/curso/${course.id}`}>
                <PlayCircle className="mr-2 h-4 w-4" /> Acessar Curso
              </Link>
            </Button>
          ) : course.external_buy_url ? (
            <Button
              className="w-full bg-white text-black hover:bg-primary hover:text-primary-foreground transition-colors"
              asChild
            >
              <a href={course.external_buy_url} target="_blank" rel="noopener noreferrer">
                Comprar <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button className="w-full" disabled>
              Comprar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
