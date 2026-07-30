import { useState, useEffect, useCallback } from 'react'
import {
  adminGetStudents,
  adminGetStudentAccess,
  adminGrantAccess,
  adminRevokeAccess,
  adminToggleHypnosis,
  adminUpdateStudent,
} from '@/services/admin-students'
import { getCourses } from '@/services/courses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Search,
  ArrowLeft,
  Lock,
  Unlock,
  Loader2,
  Sparkles,
  Phone,
  Instagram,
  Calendar,
  Mail,
  UserCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import type { Course, UserAccess } from '@/types'

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminStudents() {
  const { isAdmin } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [access, setAccess] = useState<UserAccess[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editInstagram, setEditInstagram] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [savingProfile, setSavingProfile] = useState(false)

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
    setFieldErrors({})
    setEditName(student.name || '')
    setEditEmail(student.email || '')
    setEditPhone(student.phone || '')
    setEditInstagram(student.instagram_handle || '')
    setEditBirthDate(student.birth_date ? student.birth_date.split(' ')[0] : '')
    setAccessLoading(true)
    try {
      setAccess(await adminGetStudentAccess(student.id))
    } catch {
      setAccess([])
    } finally {
      setAccessLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!selected) return
    setSavingProfile(true)
    setFieldErrors({})
    try {
      const updated = await adminUpdateStudent(selected.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        instagram_handle: editInstagram,
        birth_date: editBirthDate || undefined,
      })
      setSelected({ ...selected, ...updated })
      toast.success('Dados atualizados com sucesso!')
    } catch (err) {
      const errors = extractFieldErrors(err)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      }
      toast.error('Erro ao atualizar dados do aluno')
    } finally {
      setSavingProfile(false)
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
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
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

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-primary" /> Dados de Cadastro
              </h3>
              {isAdmin && (
                <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nome</label>
                {isAdmin ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-destructive">{fieldErrors.name}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground font-medium">{selected.name || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email</label>
                {isAdmin ? (
                  <>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="h-9"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-destructive">{fieldErrors.email}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground font-medium">{selected.email || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Telefone</label>
                {isAdmin ? (
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-9"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">{selected.phone || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Instagram</label>
                {isAdmin ? (
                  <Input
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="h-9"
                    placeholder="@usuario"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">
                    {selected.instagram_handle ? `@${selected.instagram_handle}` : '—'}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nascimento</label>
                {isAdmin ? (
                  <Input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="h-9"
                  />
                ) : (
                  <p className="text-sm text-foreground font-medium">
                    {formatDate(selected.birth_date)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Cadastro:</span>
                <span className="text-foreground font-medium">{formatDate(selected.created)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2 text-foreground">
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
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
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
      <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
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
                <h3 className="font-semibold flex items-center gap-2 text-foreground">
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
