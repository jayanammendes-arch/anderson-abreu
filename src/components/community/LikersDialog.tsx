import { getAvatarUrl } from '@/services/community'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { CommunityInteraction } from '@/types'

export function LikersDialog({
  open,
  onOpenChange,
  likes,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  likes: CommunityInteraction[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Curtidas ({likes.length})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-60">
          <div className="space-y-2">
            {likes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma curtida ainda
              </p>
            ) : (
              likes.map((l) => {
                const u = l.expand?.user
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      {u?.avatar && <AvatarImage src={getAvatarUrl(u)} />}
                      <AvatarFallback className="text-xs">
                        {u?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{u?.name || 'Usuário'}</span>
                    {u?.is_admin && (
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
