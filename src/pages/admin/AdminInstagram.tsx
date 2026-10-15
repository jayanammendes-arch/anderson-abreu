import { useState, useEffect, useCallback } from 'react'
import {
  adminGetInstagramPosts,
  adminCreateInstagramPost,
  adminUpdateInstagramPost,
  adminDeleteInstagramPost,
  getInstagramPostImageUrl,
} from '@/services/instagram-posts'
import {
  getPlatformSettings,
  updatePlatformSettings,
  createPlatformSettings,
} from '@/services/admin-settings'
import type { InstagramPost, PlatformSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import {
  Instagram,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
  Save,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react'

export default function AdminInstagram() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Profile URL & Handle
  const [profileUrl, setProfileUrl] = useState('')
  const [profileHandle, setProfileHandle] = useState('')

  // Modal Create / Edit
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null)
  const [formCaption, setFormCaption] = useState('')
  const [formPostUrl, setFormPostUrl] = useState('')
  const [formOrder, setFormOrder] = useState<number>(0)
  const [formIsActive, setFormIsActive] = useState<boolean>(true)
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [postsData, settingsData] = await Promise.all([
        adminGetInstagramPosts(),
        getPlatformSettings(),
      ])
      setPosts(postsData)
      if (settingsData) {
        setSettings(settingsData)
        setProfileUrl(settingsData.instagram_url || '')
        setProfileHandle(settingsData.instagram_handle || '')
      }
    } catch {
      toast.error('Erro ao carregar dados do Instagram')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('instagram_posts', () => {
    loadData()
  })

  useRealtime('platform_settings', () => {
    getPlatformSettings()
      .then((s) => {
        if (s) {
          setSettings(s)
          setProfileUrl(s.instagram_url || '')
          setProfileHandle(s.instagram_handle || '')
        }
      })
      .catch(() => {})
  })

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const payload = {
        instagram_url: profileUrl.trim(),
        instagram_handle: profileHandle.trim(),
      }
      if (settings?.id) {
        await updatePlatformSettings(settings.id, payload)
      } else {
        const created = await createPlatformSettings(payload)
        setSettings(created as unknown as PlatformSettings)
      }
      toast.success('Perfil do Instagram salvo com sucesso!')
    } catch {
      toast.error('Erro ao salvar URL do perfil do Instagram')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingPost(null)
    setFormCaption('')
    setFormPostUrl('')
    setFormOrder(posts.length)
    setFormIsActive(true)
    setFormImageFile(null)
    setPreviewImageUrl(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (post: InstagramPost) => {
    setEditingPost(post)
    setFormCaption(post.caption || '')
    setFormPostUrl(post.post_url || '')
    setFormOrder(post.order ?? 0)
    setFormIsActive(post.is_active !== false)
    setFormImageFile(null)
    setPreviewImageUrl(getInstagramPostImageUrl(post))
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPostUrl.trim()) {
      toast.error('Por favor, informe o link do post no Instagram.')
      return
    }
    if (!editingPost && !formImageFile) {
      toast.error('Por favor, envie uma imagem para o card do post.')
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('post_url', formPostUrl.trim())
      fd.append('caption', formCaption.trim())
      fd.append('order', String(formOrder))
      fd.append('is_active', String(formIsActive))
      if (formImageFile) {
        fd.append('image', formImageFile)
      }

      if (editingPost) {
        await adminUpdateInstagramPost(editingPost.id, fd)
        toast.success('Post atualizado com sucesso!')
      } else {
        await adminCreateInstagramPost(fd)
        toast.success('Post adicionado com sucesso!')
      }
      setIsDialogOpen(false)
      loadData()
    } catch {
      toast.error('Erro ao salvar post do Instagram')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteInstagramPost(deleteId)
      toast.success('Post excluído com sucesso!')
      loadData()
    } catch {
      toast.error('Erro ao excluir post')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleToggleActive = async (post: InstagramPost) => {
    try {
      await adminUpdateInstagramPost(post.id, { is_active: !post.is_active })
      toast.success(post.is_active ? 'Post ocultado' : 'Post ativado')
      loadData()
    } catch {
      toast.error('Erro ao alterar status do post')
    }
  }

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= posts.length) return
    const current = posts[index]
    const target = posts[targetIndex]
    try {
      await Promise.all([
        adminUpdateInstagramPost(current.id, { order: target.order ?? targetIndex }),
        adminUpdateInstagramPost(target.id, { order: current.order ?? index }),
      ])
      loadData()
    } catch {
      toast.error('Erro ao reordenar posts')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A15A]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3552] border border-[#0E1D2F] text-[#C9A15A] text-xs font-semibold mb-2">
            <Instagram className="h-3.5 w-3.5 text-[#C9A15A]" />
            <span>Página Mentoria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Instagram — Mentoria</h1>
          <p className="text-sm text-slate-300 mt-1">
            Gerencie os cards de posts exibidos na seção "Acompanhe no Instagram" da página Mentoria
            e o link do perfil oficial.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#C9A15A] hover:bg-[#b89047] text-[#0E1D2F] font-bold border border-[#0E1D2F] shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Card de Configuração do Perfil (Seguir no Instagram) */}
      <Card className="bg-[#1F3552] border-2 border-[#0E1D2F] shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#0E1D2F]">
              <div className="w-10 h-10 rounded-xl bg-[#0E1D2F] border border-[#C9A15A]/40 flex items-center justify-center text-[#C9A15A]">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Perfil do Instagram (Botão "Seguir")
                </h3>
                <p className="text-xs text-slate-300">
                  Destino do botão "Seguir no Instagram" exibido abaixo da grade na página Mentoria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileUrl" className="text-white text-sm font-medium">
                  URL Completa do Perfil
                </Label>
                <Input
                  id="profileUrl"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://instagram.com/andersonabreu.expansao"
                  className="bg-[#0E1D2F] border-[#0E1D2F] text-white placeholder:text-slate-400 focus:border-[#C9A15A]"
                />
                <p className="text-xs text-slate-400">
                  Ex: https://instagram.com/andersonabreu.expansao
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileHandle" className="text-white text-sm font-medium">
                  Handle / Usuário (fallback)
                </Label>
                <Input
                  id="profileHandle"
                  value={profileHandle}
                  onChange={(e) => setProfileHandle(e.target.value)}
                  placeholder="@andersonabreu.expansao"
                  className="bg-[#0E1D2F] border-[#0E1D2F] text-white placeholder:text-slate-400 focus:border-[#C9A15A]"
                />
                <p className="text-xs text-slate-400">Ex: @andersonabreu.expansao</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingSettings}
                className="bg-[#C9A15A] hover:bg-[#b89047] text-[#0E1D2F] font-bold border border-[#0E1D2F]"
              >
                {savingSettings ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Listagem de Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Posts Cadastrados</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0E1D2F] border border-[#0E1D2F] text-[#C9A15A]">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </h2>
          <p className="text-xs text-slate-300 hidden sm:block">
            Exibição na Mentoria: 3 cards por linha no desktop, 2 no mobile.
          </p>
        </div>

        {posts.length === 0 ? (
          <Card className="bg-[#1F3552] border-2 border-[#0E1D2F] p-12 text-center text-slate-300 shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-[#0E1D2F] border border-[#0E1D2F] flex items-center justify-center mx-auto mb-4 text-[#C9A15A]">
              <Instagram className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Nenhum post cadastrado</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Adicione cards de posts do Instagram com imagem, legenda e link para que a seção
              "Acompanhe no Instagram" passe a ser exibida na página Mentoria.
            </p>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#C9A15A] hover:bg-[#b89047] text-[#0E1D2F] font-bold border border-[#0E1D2F]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => {
              const imgUrl = getInstagramPostImageUrl(post)
              return (
                <Card
                  key={post.id}
                  className="bg-[#1F3552] border-2 border-[#0E1D2F] hover:border-[#C9A15A] transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-md"
                >
                  <div>
                    {/* Imagem do Card */}
                    <div className="relative aspect-square w-full bg-[#0E1D2F] overflow-hidden border-b border-[#0E1D2F]">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={post.caption || 'Post Instagram'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Instagram className="h-12 w-12 text-[#C9A15A]/40" />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-sm ${
                            post.is_active !== false
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-slate-900/80 text-slate-400 border-slate-700'
                          }`}
                        >
                          {post.is_active !== false ? 'Visível' : 'Oculto'}
                        </span>
                      </div>

                      {/* Botão de abrir link externo */}
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir no Instagram"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#0E1D2F]/80 backdrop-blur-sm border border-[#C9A15A]/40 flex items-center justify-center text-[#C9A15A] hover:bg-[#C9A15A] hover:text-[#0E1D2F] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    {/* Conteúdo / Legenda */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-slate-400 truncate" title={post.post_url}>
                        <span className="font-semibold text-slate-300">Link: </span>
                        {post.post_url}
                      </p>
                      {post.caption ? (
                        <p className="text-sm text-slate-200 line-clamp-3 leading-relaxed">
                          {post.caption}
                        </p>
                      ) : (
                        <p className="text-xs italic text-slate-500">Sem legenda</p>
                      )}
                    </div>
                  </div>

                  {/* Ações inferiores */}
                  <div className="p-4 pt-2 border-t border-[#0E1D2F] flex items-center justify-between bg-[#0E1D2F]/40">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10"
                        onClick={() => handleReorder(index, -1)}
                        disabled={index === 0}
                        title="Subir ordem"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10"
                        onClick={() => handleReorder(index, 1)}
                        disabled={index === posts.length - 1}
                        title="Descer ordem"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(post)}
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        {post.is_active !== false ? 'Ocultar' : 'Exibir'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#C9A15A] hover:bg-[#C9A15A]/10"
                        onClick={() => handleOpenEdit(post)}
                        title="Editar post"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => setDeleteId(post.id)}
                        title="Excluir post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Criar / Editar Post */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[#1F3552] border-2 border-[#0E1D2F] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Instagram className="h-5 w-5 text-[#C9A15A]" />
              {editingPost ? 'Editar Post do Instagram' : 'Novo Post do Instagram'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePost} className="space-y-4 pt-2">
            {/* Upload Imagem */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Imagem do Post {editingPost ? '(opcional para manter a atual)' : '*'}
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl bg-[#0E1D2F] border-2 border-[#0E1D2F] overflow-hidden flex items-center justify-center shrink-0">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Instagram className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E1D2F] border border-[#0E1D2F] hover:border-[#C9A15A] text-sm text-slate-200 transition-colors">
                    <Upload className="h-4 w-4 text-[#C9A15A]" />
                    <span>Selecionar imagem...</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    Recomendado: formato quadrado (1:1), JPG/PNG até 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Link do Post */}
            <div className="space-y-2">
              <Label htmlFor="postUrl" className="text-sm font-medium text-white">
                Link do Post no Instagram *
              </Label>
              <Input
                id="postUrl"
                type="url"
                required
                value={formPostUrl}
                onChange={(e) => setFormPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/ABC123xyz/"
                className="bg-[#0E1D2F] border-[#0E1D2F] text-white placeholder:text-slate-400 focus:border-[#C9A15A]"
              />
              <p className="text-xs text-slate-400">
                URL exata do post ou reel que abrirá ao clicar no card.
              </p>
            </div>

            {/* Legenda */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium text-white">
                Legenda Curta (opcional)
              </Label>
              <Textarea
                id="caption"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                placeholder="Ex: Como a mente subconsciente reprograma seus padrões de sucesso..."
                rows={3}
                className="bg-[#0E1D2F] border-[#0E1D2F] text-white placeholder:text-slate-400 focus:border-[#C9A15A]"
              />
              <p className="text-xs text-slate-400">Texto descritivo exibido no rodapé do card.</p>
            </div>

            {/* Ordem & Ativo */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="order" className="text-sm font-medium text-white">
                  Ordem de Exibição
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value) || 0)}
                  className="bg-[#0E1D2F] border-[#0E1D2F] text-white focus:border-[#C9A15A]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Visível no Site</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                  <span className="text-xs text-slate-300">
                    {formIsActive ? 'Ativo' : 'Oculto'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#0E1D2F] gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#C9A15A] hover:bg-[#b89047] text-[#0E1D2F] font-bold border border-[#0E1D2F]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {editingPost ? 'Salvar Alterações' : 'Cadastrar Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1F3552] border-2 border-[#0E1D2F] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Post do Instagram</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza de que deseja excluir este post da grade? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0E1D2F] border-[#0E1D2F] text-slate-300 hover:text-white hover:bg-[#0E1D2F]/80">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
