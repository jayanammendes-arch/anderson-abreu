import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { VideoEmbed } from './VideoEmbed'
import { CommentList } from './CommentList'
import { LikersDialog } from './LikersDialog'
import { MiniProfile } from './MiniProfile'
import {
  getAvatarUrl,
  getFileUrl,
  toggleLike,
  deletePost,
  togglePostHidden,
  followUser,
  unfollowUser,
} from '@/services/community'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Trash2,
  EyeOff,
  Eye,
  Shield,
  Trophy,
  BookOpen,
  UserPlus,
  UserCheck,
} from 'lucide-react'
import type { CommunityPost, CommunityInteraction } from '@/types'
import { cn } from '@/lib/utils'
import { LevelBadge } from '@/components/LevelBadge'

interface PostCardProps {
  post: CommunityPost
  likes: CommunityInteraction[]
  comments: CommunityInteraction[]
  followId: string | null
  onRefresh: () => void
}

export function PostCard({ post, likes, comments, followId, onRefresh }: PostCardProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showLikers, setShowLikers] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [busy, setBusy] = useState(false)
  const author = post.expand?.user
  const course = post.expand?.related_course
  const isAuthor = user?.id === post.user
  const isAdmin = Boolean(user?.is_admin)
  const authorIsAdmin = Boolean(author?.is_admin)
  const isFollowing = !!followId
  const userLike = likes.find((l) => l.user === user?.id)

  const handleLike = async () => {
    if (!user) return
    setBusy(true)
    try {
      await toggleLike(post.id, user.id, userLike?.id)
      onRefresh()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return
    setBusy(true)
    try {
      if (followId) await unfollowUser(followId)
      else await followUser(user.id, post.user)
      onRefresh()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      onRefresh()
    } catch {
      /* ignore */
    }
  }

  const handleToggleHidden = async () => {
    try {
      await togglePostHidden(post.id, !post.is_hidden)
      onRefresh()
    } catch {
      /* ignore */
    }
  }

  const openProfile = () => setShowProfile(true)

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 space-y-3',
        authorIsAdmin ? 'border-primary/40 bg-primary/5' : 'border-border/50',
      )}
    >
      {post.is_hidden && isAuthor && (
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <EyeOff className="h-3 w-3" /> Esta publicação foi ocultada pela moderação
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={openProfile}>
          <Avatar className="h-10 w-10">
            {author?.avatar && <AvatarImage src={getAvatarUrl(author)} />}
            <AvatarFallback>{author?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={openProfile} className="font-medium hover:underline truncate">
              {author?.name || 'Usuário'}
            </button>
            {author?.level && <LevelBadge level={author.level} size="sm" />}
            {authorIsAdmin && (
              <Badge variant="default" className="text-xs gap-1">
                <Shield className="h-3 w-3" /> Admin
              </Badge>
            )}
            {post.type === 'achievement' && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Trophy className="h-3 w-3" /> Conquista
              </Badge>
            )}
            {post.type === 'testimony' && (
              <Badge variant="secondary" className="text-xs">
                Depoimento
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(post.created).toLocaleString('pt-BR')}
          </span>
        </div>
        {!isAuthor && !authorIsAdmin && (
          <Button
            variant={isFollowing ? 'outline' : 'ghost'}
            size="sm"
            onClick={handleFollow}
            disabled={busy}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Seguindo
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Seguir
              </>
            )}
          </Button>
        )}
        {isAdmin && !isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleToggleHidden}>
                {post.is_hidden ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> Desbloquear
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" /> Bloquear
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {post.content && <p className="text-sm whitespace-pre-wrap">{post.content}</p>}
      {post.image && (
        <img
          src={getFileUrl('community_posts', post.id, post.image)}
          alt="Post image"
          className="w-full rounded-lg"
        />
      )}
      {post.video_url && <VideoEmbed url={post.video_url} />}
      {course && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="h-3 w-3" /> {course.title}
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-border/30">
        <button
          onClick={handleLike}
          disabled={busy}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Heart className={cn('h-4 w-4', userLike && 'fill-primary text-primary')} />
          {likes.length > 0 && <span>{likes.length}</span>}
        </button>
        {likes.length > 0 && (
          <button
            onClick={() => setShowLikers(true)}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Ver curtidas
          </button>
        )}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {showComments && <CommentList postId={post.id} comments={comments} onRefresh={onRefresh} />}
      <LikersDialog open={showLikers} onOpenChange={setShowLikers} likes={likes} />
      <MiniProfile
        userId={post.user}
        open={showProfile}
        onOpenChange={setShowProfile}
        followId={followId}
        onFollowChanged={onRefresh}
      />
    </div>
  )
}
