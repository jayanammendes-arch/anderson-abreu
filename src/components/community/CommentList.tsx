import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getAvatarUrl, createComment } from '@/services/community'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import type { CommunityInteraction } from '@/types'

export function CommentList({
  postId,
  comments,
  onRefresh,
}: {
  postId: string
  comments: CommunityInteraction[]
  onRefresh: () => void
}) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user || !text.trim()) return
    setSubmitting(true)
    try {
      await createComment(postId, user.id, text.trim())
      setText('')
      onRefresh()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 pt-2">
      {comments.map((c) => {
        const u = c.expand?.user
        return (
          <div key={c.id} className="flex gap-2">
            <Avatar className="h-7 w-7 shrink-0">
              {u?.avatar && <AvatarImage src={getAvatarUrl(u)} />}
              <AvatarFallback className="text-xs">
                {u?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{u?.name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{c.comment_text}</p>
            </div>
          </div>
        )
      })}
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={1}
          className="min-h-[36px] resize-none"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          className="shrink-0"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
