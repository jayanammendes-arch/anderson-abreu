import { useState, useEffect, useCallback } from 'react'
import {
  adminGetBlogPosts,
  adminCreateBlogPost,
  adminUpdateBlogPost,
  adminDeleteBlogPost,
  getBlogImageUrl,
} from '@/services/blog'
import type { BlogPost } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Save } from 'lucide-react'

const emptyForm: Partial<BlogPost> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'Anderson Abreu',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<Partial<BlogPost>>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminGetBlogPosts()
      setPosts(data as BlogPost[])
    } catch {
      toast.error('Erro ao carregar posts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('blog_posts', () => loadData())

  const handleNew = () => {
    setFormData({ ...emptyForm })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (post: BlogPost) => {
    setFormData({ ...post })
    setImageFile(null)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const slug = formData.slug || slugify(formData.title || '')
      const baseData: Record<string, unknown> = {
        title: formData.title || '',
        slug,
        excerpt: formData.excerpt || '',
        content: formData.content || '',
        author: formData.author || 'Anderson Abreu',
      }

      if (imageFile) {
        const fd = new FormData()
        Object.entries(baseData).forEach(([key, value]) => fd.append(key, String(value)))
        fd.append('image', imageFile)
        if (formData.id) await adminUpdateBlogPost(formData.id, fd)
        else await adminCreateBlogPost(fd)
      } else {
        if (formData.id) await adminUpdateBlogPost(formData.id, baseData)
        else await adminCreateBlogPost(baseData)
      }
      toast.success(formData.id ? 'Post atualizado!' : 'Post criado!')
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      if (Object.keys(errors).length === 0) toast.error('Erro ao salvar post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await adminDeleteBlogPost(deleteId)
      toast.success('Post excluído!')
      loadData()
    } catch {
      toast.error('Erro ao excluir')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Post
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-card/50 border-border/50 p-12 text-center text-muted-foreground">
          Nenhum post cadastrado.
        </Card>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => {
            const imgUrl = getBlogImageUrl(post)
            return (
              <Card
                key={post.id}
                className="flex items-center gap-4 p-4 bg-card/50 border-border/50"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={post.title}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-16 rounded-lg bg-primary/10" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      /blog/{post.slug}
                    </Badge>
                    {post.author && <span className="text-xs">{post.author}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(post.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Post' : 'Novo Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {fieldErrors.title && <p className="text-sm text-red-500">{fieldErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-gerado a partir do título"
              />
              {fieldErrors.slug && <p className="text-sm text-red-500">{fieldErrors.slug}</p>}
            </div>
            <div className="space-y-2">
              <Label>Autor</Label>
              <Input
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Resumo (Excerpt)</Label>
              <Input
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <RichTextEditor
                value={formData.content || ''}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
              {fieldErrors.content && <p className="text-sm text-red-500">{fieldErrors.content}</p>}
            </div>
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 1200×630 px (proporção 16:9)
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Post</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
