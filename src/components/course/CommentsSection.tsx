import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCommentsByLesson, createComment, reactToComment } from '@/services/lesson-comments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Send, Loader2 } from 'lucide-react'
import type { LessonComment } from '@/types'

export function CommentsSection({ lessonId }: { lessonId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<LessonComment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setComments(await getCommentsByLesson(lessonId))
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [lessonId])
  useRealtime('lesson_comments', () => {
    if (lessonId) loadData()
  })

  const handleSubmit = async () => {
    if (!user || !content.trim()) return
    setSubmitting(true)
    try {
      await createComment({ lesson: lessonId, user: user.id, content: content.trim() })
      setContent('')
      loadData()
    } catch {
      /* intentionally ignored */
    } finally {
      setSubmitting(false)
    }
  }

  const handleReact = async (comment: LessonComment) => {
    try {
      await reactToComment(comment.id, comment.reactions || 0)
      loadData()
    } catch {
      /* intentionally ignored */
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Comentários
      </h3>
      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
        />
        <Button onClick={handleSubmit} disabled={submitting || !content.trim()} size="sm">
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Enviar
        </Button>
      </div>
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {c.expand?.user?.avatar ? (
                    <AvatarImage
                      src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${c.expand.user.id}/${c.expand.user.avatar}`}
                    />
                  ) : null}
                  <AvatarFallback>{c.expand?.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{c.expand?.user?.name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{c.content}</p>
              <button
                onClick={() => handleReact(c)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart className="h-3.5 w-3.5" /> {c.reactions || 0}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
