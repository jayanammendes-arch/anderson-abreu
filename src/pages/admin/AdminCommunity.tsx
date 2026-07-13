import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  adminGetCommunityPosts,
  adminTogglePostVisibility,
  adminDeletePost,
  type AdminCommunityPost,
} from '@/services/admin-community'

const typeLabels: Record<string, string> = {
  text: 'Texto',
  image: 'Imagem',
  video: 'Vídeo',
  achievement: 'Conquista',
  testimony: 'Depoimento',
}

export default function AdminCommunity() {
  const [posts, setPosts] = useState<AdminCommunityPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await adminGetCommunityPosts()
      setPosts(data)
    } catch {
      toast.error('Falha ao carregar posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await adminTogglePostVisibility(id, !current)
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, is_hidden: !current } : p)))
      toast.success(!current ? 'Post ocultado' : 'Post visível')
    } catch {
      toast.error('Falha ao atualizar post')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminDeletePost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Post excluído')
    } catch {
      toast.error('Falha ao excluir post')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Gerenciar Comunidade</h2>
        <span className="text-sm text-muted-foreground">({posts.length})</span>
      </div>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Autor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum post encontrado
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="border-border/50">
                    <TableCell className="font-medium text-white">{post.userName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{typeLabels[post.type] || post.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {post.content || '—'}
                    </TableCell>
                    <TableCell>
                      {post.is_hidden ? (
                        <Badge variant="destructive">Oculto</Badge>
                      ) : (
                        <Badge className="bg-green-600">Visível</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleToggle(post.id, post.is_hidden)}
                        >
                          {post.is_hidden ? (
                            <Eye className="h-4 w-4 text-green-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-yellow-400" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
