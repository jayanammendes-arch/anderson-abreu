import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  getAvatarUrl,
  getUserProfile,
  getUserPostCount,
  followUser,
  unfollowUser,
} from '@/services/community'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, UserCheck } from 'lucide-react'
import type { CommunityUser } from '@/types'

export function MiniProfile({
  userId,
  open,
  onOpenChange,
  followId,
  onFollowChanged,
}: {
  userId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
  followId: string | null
  onFollowChanged: () => void
}) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CommunityUser | null>(null)
  const [postCount, setPostCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!userId || !open) return
    setLoading(true)
    Promise.all([getUserProfile(userId), getUserPostCount(userId)])
      .then(([p, c]) => {
        setProfile(p as unknown as CommunityUser)
        setPostCount(c)
      })
      .catch(() => {
        setProfile(null)
        setPostCount(0)
      })
      .finally(() => setLoading(false))
  }, [userId, open])

  const handleFollow = async () => {
    if (!user || !userId) return
    setActionLoading(true)
    try {
      if (followId) {
        await unfollowUser(followId)
      } else {
        await followUser(user.id, userId)
      }
      onFollowChanged()
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false)
    }
  }

  const isSelf = user?.id === userId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <div className="space-y-4 text-center">
            <Avatar className="h-20 w-20 mx-auto">
              {profile.avatar && <AvatarImage src={getAvatarUrl(profile)} />}
              <AvatarFallback className="text-lg">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold">{profile.name || 'Usuário'}</h3>
                {profile.is_admin && (
                  <Badge variant="default" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{postCount} publicações</p>
              {profile.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
            </div>
            {!isSelf && (
              <Button
                variant={followId ? 'outline' : 'default'}
                onClick={handleFollow}
                disabled={actionLoading}
                className="w-full"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : followId ? (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" /> Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Seguir
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Usuário não encontrado</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
