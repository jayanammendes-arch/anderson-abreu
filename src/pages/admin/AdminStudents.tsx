import { useState, useEffect, useCallback } from 'react'
import {
  adminGetStudents,
  adminGetStudentAccess,
  adminGrantAccess,
  adminRevokeAccess,
  adminToggleHypnosis,
} from '@/services/admin-students'
import { getCourses } from '@/services/courses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, ArrowLeft, Lock, Unlock, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import type { Course, UserAccess } from '@/types'

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [access, setAccess] = useState<UserAccess[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(false)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    try {
      setStudents(await adminGetStudents(search))
    } catch {
      toast.error('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])
  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => {})
  }, [])

  const openStudent = async (student: any) => {
    setSelected(student)
    setAccessLoading(true)
    try {
      setAccess(await adminGetStudentAccess(student.id))
    } catch {
      setAccess([])
    } finally {
      setAccessLoading(false)
    }
  }

  const toggleAccess = async (courseId: string) => {
    if (!selected) return
    const existing = access.find((a) => a.course === courseId)
    try {
      if (existing) {
        await adminRevokeAccess(existing.id)
        toast.success('Acesso revogado')
      } else {
        await adminGrantAccess(selected.id, courseId)
        toast.success('Acesso liberado')
      }
      setAccess(await adminGetStudentAccess(selected.id))
    } catch {
      toast.error('Erro ao alterar acesso')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  if (selected) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {selected.name || 'Aluno'}
              {selected.is_hypnosis && (
                <Badge className="bg-purple-500/90 text-white">
                  <Sparkles className="mr-1 h-3 w-3" /> Hipnose
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{selected.email}</p>
          </div>
        </div>
        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" /> Tag Hipnose
              </h3>
              <p className="text-sm text-muted-foreground">
                Permite acesso a cursos Exclusivo Hipnose
              </p>
            </div>
            <Switch
              checked={!!selected.is_hypnosis}
              onCheckedChange={async (checked) => {
                try {
                  await adminToggleHypnosis(selected.id, checked)
                  setSelected({ ...selected, is_hypnosis: checked })
                  toast.success(checked ? 'Tag Hipnose ativada' : 'Tag Hipnose desativada')
                } catch {
                  toast.error('Erro ao atualizar tag')
                }
              }}
            />
          </div>
        </Card>
        {accessLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {courses.map((course) => {
              const has = access.some((a) => a.course === course.id)
              return (
                <Card
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-card/50 border-border/50"
                >
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.category || 'Sem categoria'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {has ? (
                      <Badge className="bg-green-500/90 text-white">Liberado</Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Lock className="mr-1 h-3 w-3" /> Bloqueado
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={has ? 'destructive' : 'default'}
                      onClick={() => toggleAccess(course.id)}
                    >
                      {has ? (
                        <>
                          <Lock className="mr-1 h-4 w-4" /> Revogar
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-1 h-4 w-4" /> Liberar
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Alunos</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid gap-3">
        {students.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum aluno encontrado.
            </CardContent>
          </Card>
        ) : (
          students.map((s) => (
            <Card
              key={s.id}
              className="flex items-center gap-4 p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openStudent(s)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-white text-xs">
                  {(s.name || 'A')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {s.name || 'Sem nome'}
                  {s.is_hypnosis && (
                    <Badge className="bg-purple-500/90 text-white text-xs">
                      <Sparkles className="mr-1 h-3 w-3" /> Hipnose
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{s.email}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
