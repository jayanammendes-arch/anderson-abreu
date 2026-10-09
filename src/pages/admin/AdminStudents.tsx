import { useState, useEffect, useCallback } from 'react'
import {
  adminGetStudents,
  adminGetStudentAccess,
  adminGrantAccess,
  adminRevokeAccess,
  adminUpdateLevel,
  adminUpdateComecePorAquiAccess,
  adminUpdateStudent,
  adminUpdateAdminStatus,
  adminCreateStudent,
  adminDeleteStudent,
  adminResetComecePorAqui,
} from '@/services/admin-students'
import { canManuallyReleaseComecePorAqui, NO_LEVEL } from '@/lib/level-access'
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
  Phone,
  Instagram,
  Calendar,
  Mail,
  UserCircle,
  Plus,
  Trash2,
  RotateCcw,
  CreditCard,
  KeyRound,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { LevelBadge } from '@/components/LevelBadge'
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

function formatCpf(val: string): string {
  const digits = (val || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
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
  const [editCpf, setEditCpf] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editInstagram, setEditInstagram] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [pendingLevel, setPendingLevel] = useState<string | null>(null)
  const [comeceLoading, setComeceLoading] = useState(false)

  // Modais de Criação e Ações
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingStudent, setCreatingStudent] = useState(false)
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    level: '',
    cpf: '',
    phone: '',
    instagram_handle: '',
    birth_date: '',
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})

  // Diálogos de confirmação
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<any | null>(null)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [resetConfirmStudent, setResetConfirmStudent] = useState<any | null>(null)
  const [resettingStudent, setResettingStudent] = useState(false)

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

  useRealtime('users', () => loadStudents())

  const handleLevelChange = async () => {
    if (!selected || !pendingLevel) return
    // "Sem nivel" é representado por uma string vazia no banco.
    const newLevel = pendingLevel === NO_LEVEL ? '' : pendingLevel
    try {
      await adminUpdateLevel(selected.id, newLevel)
      // Ao rebaixar para "Sem nivel", o acesso ao "Comece por Aqui" não faz
      // sentido; removemos a flag para manter o estado consistente.
      if (pendingLevel === NO_LEVEL && selected.comece_por_aqui_access) {
        try {
          await adminUpdateComecePorAquiAccess(selected.id, false)
        } catch {
          /* não bloqueia o fluxo principal */
        }
        setSelected({ ...selected, level: '', comece_por_aqui_access: false })
      } else {
        setSelected({ ...selected, level: newLevel })
      }
      toast.success(
        pendingLevel === NO_LEVEL
          ? 'Nível removido (aluno sem nível)'
          : `Nível alterado para ${pendingLevel}`,
      )
    } catch {
      toast.error('Erro ao alterar nível')
    } finally {
      setPendingLevel(null)
    }
  }

  const handleComecePorAquiToggle = async (checked: boolean) => {
    if (!selected) return
    const previousValue = !!selected.comece_por_aqui_access
    setSelected({ ...selected, comece_por_aqui_access: checked })
    setComeceLoading(true)
    try {
      await adminUpdateComecePorAquiAccess(selected.id, checked)
      toast.success(
        checked
          ? 'Acesso ao "Comece por Aqui" liberado para o aluno'
          : 'Acesso ao "Comece por Aqui" revogado',
      )
    } catch {
      setSelected({ ...selected, comece_por_aqui_access: previousValue })
      toast.error('Erro ao alterar liberação do "Comece por Aqui"')
    } finally {
      setComeceLoading(false)
    }
  }

  const handleAdminToggle = async (checked: boolean) => {
    if (!selected) return
    const previousValue = selected.is_admin
    setSelected({ ...selected, is_admin: checked })
    try {
      await adminUpdateAdminStatus(selected.id, checked)
      toast.success(
        checked
          ? 'Privilégios de administrador concedidos'
          : 'Privilégios de administrador revogados',
      )
    } catch {
      setSelected({ ...selected, is_admin: previousValue })
      toast.error('Erro ao alterar status de administrador')
    }
  }
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
    setEditCpf(formatCpf(student.cpf || ''))
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

  // Sincroniza os estados de edição sempre que `selected` mudar (por exemplo, após atualizar no banco)
  useEffect(() => {
    if (selected) {
      setEditName(selected.name || '')
      setEditEmail(selected.email || '')
      setEditCpf(formatCpf(selected.cpf || ''))
      setEditPhone(selected.phone || '')
      setEditInstagram(selected.instagram_handle || '')
      setEditBirthDate(selected.birth_date ? selected.birth_date.split(' ')[0] : '')
    }
  }, [selected?.id])

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateErrors({})

    const errs: Record<string, string> = {}
    if (!newStudentData.name.trim()) errs.name = 'Nome é obrigatório'
    if (!newStudentData.email.trim()) errs.email = 'E-mail é obrigatório'
    if (!newStudentData.password) errs.password = 'Senha é obrigatória'
    else if (newStudentData.password.length < 8)
      errs.password = 'A senha deve ter no mínimo 8 caracteres'
    if (newStudentData.password !== newStudentData.passwordConfirm) {
      errs.passwordConfirm = 'As senhas não coincidem'
    }

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs)
      return
    }

    setCreatingStudent(true)
    try {
      const created = await adminCreateStudent({
        name: newStudentData.name,
        email: newStudentData.email,
        password: newStudentData.password,
        passwordConfirm: newStudentData.passwordConfirm,
        level: newStudentData.level || undefined,
        cpf: newStudentData.cpf || undefined,
        phone: newStudentData.phone || undefined,
        instagram_handle: newStudentData.instagram_handle || undefined,
        birth_date: newStudentData.birth_date || undefined,
      })
      toast.success('Aluno cadastrado com sucesso!')
      setCreateDialogOpen(false)
      setNewStudentData({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        level: '',
        cpf: '',
        phone: '',
        instagram_handle: '',
        birth_date: '',
      })
      await loadStudents()
      // Abre direto o detalhe do aluno criado
      openStudent(created)
    } catch (err: any) {
      const extracted = extractFieldErrors(err)
      if (Object.keys(extracted).length > 0) {
        setCreateErrors(extracted)
      }
      toast.error(err?.message || 'Erro ao cadastrar aluno')
    } finally {
      setCreatingStudent(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!deleteConfirmStudent) return
    setDeletingStudent(true)
    try {
      await adminDeleteStudent(deleteConfirmStudent.id)
      toast.success('Aluno e dados dependentes excluídos com sucesso!')
      if (selected?.id === deleteConfirmStudent.id) {
        setSelected(null)
      }
      setDeleteConfirmStudent(null)
      await loadStudents()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao excluir aluno')
    } finally {
      setDeletingStudent(false)
    }
  }

  const handleResetComecePorAqui = async () => {
    if (!resetConfirmStudent) return
    setResettingStudent(true)
    try {
      await adminResetComecePorAqui(resetConfirmStudent.id)
      toast.success('Fluxo "Comece por Aqui" zerado com sucesso! Cursos e acessos preservados.')
      setResetConfirmStudent(null)
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao zerar Comece por Aqui')
    } finally {
      setResettingStudent(false)
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
        cpf: editCpf,
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
              className="border-[#0E1D2F] bg-[#1F3552] text-white hover:bg-[#1F3552]/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                {selected.name || 'Aluno'}
                <LevelBadge level={selected.level} size="md" showNoLevel />
              </h1>
              <p className="text-sm text-muted-foreground">{selected.email}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setResetConfirmStudent(selected)}
                className="border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Zerar Comece por Aqui
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteConfirmStudent(selected)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir cadastro
              </Button>
            </div>
          )}
        </div>

        <Card className="bg-[#1F3552] border border-[#0E1D2F]">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-[#C9A15A]" /> Dados de Cadastro
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-[#C9A15A] hover:bg-[#b08b47] text-white font-semibold"
                >
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Nome</label>
                {isAdmin ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                    />
                    {fieldErrors.name && <p className="text-xs text-red-400">{fieldErrors.name}</p>}
                  </>
                ) : (
                  <p className="text-sm text-white font-medium">{selected.name || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Email</label>
                {isAdmin ? (
                  <>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-400">{fieldErrors.email}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-white font-medium">{selected.email || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200 flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-[#C9A15A]" /> CPF
                </label>
                {isAdmin ? (
                  <>
                    <Input
                      value={editCpf}
                      onChange={(e) => setEditCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                    />
                    {fieldErrors.cpf && <p className="text-xs text-red-400">{fieldErrors.cpf}</p>}
                  </>
                ) : (
                  <p className="text-sm text-white font-medium">{selected.cpf || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Telefone / WhatsApp</label>
                {isAdmin ? (
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                  />
                ) : (
                  <p className="text-sm text-white font-medium">{selected.phone || '—'}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Instagram</label>
                {isAdmin ? (
                  <Input
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                    placeholder="@usuario"
                  />
                ) : (
                  <p className="text-sm text-white font-medium">
                    {selected.instagram_handle ? `@${selected.instagram_handle}` : '—'}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Data de nascimento</label>
                {isAdmin ? (
                  <Input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="h-9 bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                  />
                ) : (
                  <p className="text-sm text-white font-medium">
                    {formatDate(selected.birth_date)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm pt-1">
                <Calendar className="h-4 w-4 text-[#C9A15A] shrink-0" />
                <span className="text-gray-300">Cadastro:</span>
                <span className="text-white font-medium">{formatDate(selected.created)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1F3552] border border-[#0E1D2F] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Nível do Aluno</h3>
              <p className="text-sm text-gray-300">
                Prata e Diamante são atribuídos manualmente. Ouro é automático ao comprar um curso.
              </p>
            </div>
            {isAdmin && (
              <Select value={selected.level || NO_LEVEL} onValueChange={(v) => setPendingLevel(v)}>
                <SelectTrigger className="w-40 bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
                  <SelectItem value={NO_LEVEL}>Sem nível</SelectItem>
                  <SelectItem value="Prata">Prata</SelectItem>
                  <SelectItem value="Ouro">Ouro</SelectItem>
                  <SelectItem value="Diamante">Diamante</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Liberação manual do "Comece por Aqui" — disponível apenas para Ouro/Diamante.
              Prata já possui acesso por padrão ao módulo. */}
          {isAdmin && canManuallyReleaseComecePorAqui(selected.level) && (
            <div className="pt-4 border-t border-[#0E1D2F] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Acesso ao “Comece por Aqui”</h3>
                <p className="text-sm text-gray-300">
                  Libera manualmente o módulo de onboarding para este aluno.
                </p>
              </div>
              <Switch
                checked={!!selected.comece_por_aqui_access}
                onCheckedChange={handleComecePorAquiToggle}
                disabled={comeceLoading}
              />
            </div>
          )}
          {isAdmin && selected.level === 'Prata' && (
            <div className="pt-4 border-t border-[#0E1D2F]">
              <p className="text-sm text-gray-300">
                ℹ️ Alunos Prata já possuem acesso automático ao “Comece por Aqui”.
              </p>
            </div>
          )}

          {isAdmin && (
            <div className="pt-4 border-t border-[#0E1D2F] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Administrador</h3>
                <p className="text-sm text-gray-300">
                  Concede privilégios de administrador na plataforma
                </p>
              </div>
              <Switch checked={!!selected.is_admin} onCheckedChange={handleAdminToggle} />
            </div>
          )}
        </Card>

        <AlertDialog open={!!pendingLevel} onOpenChange={(open) => !open && setPendingLevel(null)}>
          <AlertDialogContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#C9A15A]">
                Confirmar alteração de nível
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Deseja alterar o nível do aluno para <strong>{pendingLevel}</strong>? Esta ação pode
                afetar o acesso a conteúdos da plataforma.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border border-[#0E1D2F]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLevelChange}
                className="bg-[#C9A15A] hover:bg-[#b08b47] text-white font-semibold"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {accessLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#C9A15A]" />
          </div>
        ) : (
          <div className="grid gap-3">
            {courses.map((course) => {
              const has = access.some((a) => a.course === course.id)
              return (
                <Card
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-[#1F3552] border border-[#0E1D2F]"
                >
                  <div>
                    <h3 className="font-semibold text-white">{course.title}</h3>
                    <p className="text-sm text-gray-300">{course.category || 'Sem categoria'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {has ? (
                      <Badge className="bg-green-500/90 text-white">Liberado</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-[#0E1D2F] text-gray-300 border border-[#0E1D2F]"
                      >
                        <Lock className="mr-1 h-3 w-3" /> Bloqueado
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={has ? 'destructive' : 'default'}
                      onClick={() => toggleAccess(course.id)}
                      className={
                        has
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-[#C9A15A] hover:bg-[#b08b47] text-white font-semibold'
                      }
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

        {/* Diálogos de Confirmação no modo detalhe */}
        <AlertDialog
          open={!!deleteConfirmStudent}
          onOpenChange={(open) => !open && setDeleteConfirmStudent(null)}
        >
          <AlertDialogContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Excluir cadastro do aluno?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Tem certeza de que deseja excluir o cadastro de{' '}
                <strong className="text-white">
                  {deleteConfirmStudent?.name || deleteConfirmStudent?.email}
                </strong>
                ?
                <br />
                <span className="text-red-300 font-medium mt-2 block">
                  Esta ação é irreversível e apagará todos os dados dependentes (progresso nas
                  aulas, acessos a cursos, respostas de formulários, fichas pré-hipnose, avaliações
                  da Roda da Vida e certificados).
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deletingStudent}
                className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border-border/50"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                disabled={deletingStudent}
                className="bg-red-600 text-white hover:bg-red-700 font-semibold"
              >
                {deletingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!resetConfirmStudent}
          onOpenChange={(open) => !open && setResetConfirmStudent(null)}
        >
          <AlertDialogContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-400 flex items-center gap-2">
                <RotateCcw className="h-5 w-5" /> Zerar "Comece por Aqui"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Esta ação vai reiniciar o fluxo de boas-vindas do aluno{' '}
                <strong className="text-white">
                  {resetConfirmStudent?.name || resetConfirmStudent?.email}
                </strong>
                .
                <br />
                <br />
                <strong>Serão apagados:</strong>
                <ul className="list-disc list-inside mt-1 text-sm text-amber-200">
                  <li>Respostas de formulários de onboarding (form_submissions)</li>
                  <li>Ficha pré-hipnose (pre_hypnosis_forms)</li>
                  <li>Avaliação inicial da Roda da Vida (tipo "pre")</li>
                </ul>
                <br />
                <span className="text-green-300 font-medium">
                  Cursos, acessos, progresso de aulas, certificados e quizzes serão mantidos
                  intactos.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={resettingStudent}
                className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border-border/50"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetComecePorAqui}
                disabled={resettingStudent}
                className="bg-amber-600 text-white hover:bg-amber-700 font-semibold"
              >
                {resettingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar e Zerar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alunos</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de estudantes, acessos, níveis e dados cadastrais.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#C9A15A] hover:bg-[#b08b47] text-white font-semibold shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Cadastrar novo aluno
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#1F3552] border border-[#0E1D2F] text-white placeholder:text-gray-400 focus:border-[#C9A15A]"
        />
      </div>
      <div className="grid gap-3">
        {students.length === 0 ? (
          <Card className="bg-[#1F3552] border border-[#0E1D2F]">
            <CardContent className="py-12 text-center text-gray-400">
              Nenhum aluno encontrado.
            </CardContent>
          </Card>
        ) : (
          students.map((s) => (
            <Card
              key={s.id}
              className="flex items-center gap-4 p-4 bg-[#1F3552] border border-[#0E1D2F] cursor-pointer hover:border-[#C9A15A] transition-colors"
              onClick={() => openStudent(s)}
            >
              <Avatar className="h-10 w-10 border border-[#0E1D2F]">
                <AvatarFallback className="bg-[#0E1D2F] text-[#C9A15A] font-bold text-xs">
                  {(s.name || 'A')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 text-white truncate">
                      {s.name || 'Sem nome'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <LevelBadge level={s.level} size="sm" showNoLevel />
                      {s.cpf && (
                        <span className="text-xs font-mono text-[#C9A15A] bg-[#0E1D2F] px-2 py-0.5 rounded border border-[#0E1D2F]">
                          CPF: {formatCpf(s.cpf)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1 truncate">{s.email}</p>
                  </div>

                  {isAdmin && (
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Zerar Comece por Aqui"
                        onClick={(e) => {
                          e.stopPropagation()
                          setResetConfirmStudent(s)
                        }}
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2 border border-transparent hover:border-amber-500/30"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        <span className="text-xs hidden md:inline">Zerar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Excluir aluno"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirmStudent(s)
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2 border border-transparent hover:border-red-500/30"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="text-xs hidden md:inline">Excluir</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Cadastro de Novo Aluno */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg bg-[#1F3552] border border-[#0E1D2F] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#C9A15A]">
              <Plus className="h-5 w-5" /> Cadastrar Novo Aluno
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Preencha as informações para registrar o aluno no sistema. Ele poderá usar o e-mail e
              a senha para entrar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStudent} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-200">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <Input
                value={newStudentData.name}
                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                placeholder="Ex: Anderson Silva"
                className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                required
              />
              {createErrors.name && <p className="text-xs text-red-400">{createErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">
                  E-mail <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  value={newStudentData.email}
                  onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                  placeholder="aluno@email.com"
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                  required
                />
                {createErrors.email && <p className="text-xs text-red-400">{createErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200 flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-[#C9A15A]" /> CPF
                </label>
                <Input
                  value={newStudentData.cpf}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      cpf: formatCpf(e.target.value),
                    })
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                />
                {createErrors.cpf && <p className="text-xs text-red-400">{createErrors.cpf}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200 flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-[#C9A15A]" /> Senha inicial{' '}
                  <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  value={newStudentData.password}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, password: e.target.value })
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                  required
                />
                {createErrors.password && (
                  <p className="text-xs text-red-400">{createErrors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200 flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-[#C9A15A]" /> Confirmar senha{' '}
                  <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  value={newStudentData.passwordConfirm}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      passwordConfirm: e.target.value,
                    })
                  }
                  placeholder="Repita a senha"
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                  required
                />
                {createErrors.passwordConfirm && (
                  <p className="text-xs text-red-400">{createErrors.passwordConfirm}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Nível do aluno</label>
                <Select
                  value={newStudentData.level || NO_LEVEL}
                  onValueChange={(v) =>
                    setNewStudentData({
                      ...newStudentData,
                      level: v === NO_LEVEL ? '' : v,
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
                    <SelectItem value={NO_LEVEL}>Sem nível</SelectItem>
                    <SelectItem value="Prata">Prata</SelectItem>
                    <SelectItem value="Ouro">Ouro</SelectItem>
                    <SelectItem value="Diamante">Diamante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Telefone / WhatsApp</label>
                <Input
                  value={newStudentData.phone}
                  onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Instagram</label>
                <Input
                  value={newStudentData.instagram_handle}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      instagram_handle: e.target.value,
                    })
                  }
                  placeholder="@usuario"
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white placeholder:text-gray-500 focus:border-[#C9A15A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-200">Data de nascimento</label>
                <Input
                  type="date"
                  value={newStudentData.birth_date}
                  onChange={(e) =>
                    setNewStudentData({ ...newStudentData, birth_date: e.target.value })
                  }
                  className="bg-[#0E1D2F] border border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#0E1D2F] gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={creatingStudent}
                onClick={() => setCreateDialogOpen(false)}
                className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border border-[#0E1D2F]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creatingStudent}
                className="bg-[#C9A15A] hover:bg-[#b08b47] text-white font-semibold"
              >
                {creatingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Aluno
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogos de Confirmação na listagem */}
      <AlertDialog
        open={!!deleteConfirmStudent}
        onOpenChange={(open) => !open && setDeleteConfirmStudent(null)}
      >
        <AlertDialogContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Excluir cadastro do aluno?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Tem certeza de que deseja excluir o cadastro de{' '}
              <strong className="text-white">
                {deleteConfirmStudent?.name || deleteConfirmStudent?.email}
              </strong>
              ?
              <br />
              <span className="text-red-300 font-medium mt-2 block">
                Esta ação é irreversível e apagará todos os dados dependentes (progresso nas aulas,
                acessos a cursos, respostas de formulários, fichas pré-hipnose, avaliações da Roda
                da Vida e certificados).
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingStudent}
              className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border border-[#0E1D2F]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deletingStudent}
              className="bg-red-600 text-white hover:bg-red-700 font-semibold"
            >
              {deletingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!resetConfirmStudent}
        onOpenChange={(open) => !open && setResetConfirmStudent(null)}
      >
        <AlertDialogContent className="bg-[#1F3552] border border-[#0E1D2F] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" /> Zerar "Comece por Aqui"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Esta ação vai reiniciar o fluxo de boas-vindas do aluno{' '}
              <strong className="text-white">
                {resetConfirmStudent?.name || resetConfirmStudent?.email}
              </strong>
              .
              <br />
              <br />
              <strong>Serão apagados:</strong>
              <ul className="list-disc list-inside mt-1 text-sm text-amber-200">
                <li>Respostas de formulários de onboarding (form_submissions)</li>
                <li>Ficha pré-hipnose (pre_hypnosis_forms)</li>
                <li>Avaliação inicial da Roda da Vida (tipo "pre")</li>
              </ul>
              <br />
              <span className="text-green-300 font-medium">
                Cursos, acessos, progresso de aulas, certificados e quizzes serão mantidos intactos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={resettingStudent}
              className="bg-[#0E1D2F] text-white hover:bg-[#0E1D2F]/80 border border-[#0E1D2F]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetComecePorAqui}
              disabled={resettingStudent}
              className="bg-amber-600 text-white hover:bg-amber-700 font-semibold"
            >
              {resettingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar e Zerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
