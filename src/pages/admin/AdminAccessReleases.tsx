import { useState, useEffect, useCallback } from 'react'
import {
  adminGetHypnosisUsers,
  adminGetStudentAccess,
  adminGrantAccess,
  adminRevokeAccess,
} from '@/services/admin-students'
import { getCourses } from '@/services/courses'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Lock, Unlock, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Course, UserAccess } from '@/types'

export default function AdminAccessReleases() {
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [access, setAccess] = useState<UserAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [hypnosisUsers, allCourses] = await Promise.all([adminGetHypnosisUsers(), getCourses()])
      setUsers(hypnosisUsers)
      setCourses(allCourses.filter((c) => c.access_type === 'hypnosis'))
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openUser = async (user: any) => {
    setSelected(user)
    setAccessLoading(true)
    try {
      setAccess(await adminGetStudentAccess(user.id))
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
              <Badge className="bg-purple-500/90 text-white">
                <Sparkles className="mr-1 h-3 w-3" /> Hipnose
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{selected.email}</p>
          </div>
        </div>
        {accessLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum curso Exclusivo Hipnose cadastrado.
            </CardContent>
          </Card>
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
                      <Badge className="bg-green-500/90 text-white">Acesso liberado</Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Lock className="mr-1 h-3 w-3" /> Aguardando liberação
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={has ? 'destructive' : 'default'}
                      onClick={() => toggleAccess(course.id)}
                    >
                      {has ? (
                        <>
                          <Lock className="mr-1 h-4 w-4" /> Revogar acesso
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-1 h-4 w-4" /> Liberar acesso
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
      <div>
        <h1 className="text-2xl font-bold">Liberações de Acesso</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie acessos a cursos Exclusivo Hipnose para alunos com tag.
        </p>
      </div>
      {users.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum aluno com tag Hipnose encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <Card
              key={u.id}
              className="flex items-center gap-4 p-4 bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openUser(u)}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-purple-500 text-white text-xs">
                  {(u.name || 'A')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {u.name || 'Sem nome'}
                  <Badge className="bg-purple-500/90 text-white text-xs">
                    <Sparkles className="mr-1 h-3 w-3" /> Hipnose
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
