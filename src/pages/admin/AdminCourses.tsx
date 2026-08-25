import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  adminGetCourses,
  adminDeleteCourse,
  adminUpdateCourse,
  adminGetCourseAccessCount,
} from '@/services/admin-courses'
import { getThumbnailUrl } from '@/services/courses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff, Award } from 'lucide-react'
import { toast } from 'sonner'
import { previewTestCertificate } from '@/services/certificates'
import type { Course } from '@/types'

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [accessCounts, setAccessCounts] = useState<Record<string, number>>({})
  const [previewing, setPreviewing] = useState(false)

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminGetCourses()
      setCourses(data as unknown as Course[])
      const counts: Record<string, number> = {}
      for (const c of data) counts[c.id] = await adminGetCourseAccessCount(c.id)
      setAccessCounts(counts)
    } catch {
      toast.error('Erro ao carregar cursos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este curso?')) return
    try {
      await adminDeleteCourse(id)
      toast.success('Curso excluido')
      loadCourses()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const handleToggle = async (course: Course) => {
    try {
      await adminUpdateCourse(course.id, { is_available: !course.is_available })
      loadCourses()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const handlePreviewCertificate = async () => {
    setPreviewing(true)
    try {
      await previewTestCertificate()
    } catch {
      toast.error('Erro ao gerar preview do certificado')
    } finally {
      setPreviewing(false)
    }
  }

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_available) ||
      (statusFilter === 'inactive' && !c.is_available)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handlePreviewCertificate} disabled={previewing}>
            {previewing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Award className="mr-2 h-4 w-4" />
            )}
            Visualizar certificado de teste
          </Button>
          <Button asChild>
            <Link to="/admin/cursos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Curso
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Este é apenas um certificado de teste e visualização, não é um certificado real.
      </p>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4">
        {filtered.map((course) => (
          <Card key={course.id} className="flex items-center gap-4 p-4 bg-card/50 border-border/50">
            <img
              src={getThumbnailUrl(course)}
              alt={course.title}
              className="h-16 w-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{course.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>R$ {course.price?.toFixed(2) || '--'}</span>
                <Badge variant={course.is_available ? 'default' : 'secondary'}>
                  {course.is_available ? 'Ativo' : 'Inativo'}
                </Badge>
                <span>{accessCounts[course.id] || 0} alunos</span>
                <Badge variant="outline" className="capitalize">
                  {course.visibility || 'home'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggle(course)}
                title={course.is_available ? 'Ocultar' : 'Mostrar'}
              >
                {course.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/admin/cursos/${course.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(course.id)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
