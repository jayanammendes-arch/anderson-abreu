import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { PostComposer } from './PostComposer'
import { PostCard } from './PostCard'
import { getCommunityPosts, getPostInteractions, getFollowing } from '@/services/community'
import { Button } from '@/components/ui/button'
import { Loader2, Users, Globe } from 'lucide-react'
import type { CommunityPost, CommunityInteraction, CommunityFollow } from '@/types'

export function CommunityFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [interactions, setInteractions] = useState<CommunityInteraction[]>([])
  const [follows, setFollows] = useState<CommunityFollow[]>([])
  const [filter, setFilter] = useState<'all' | 'following'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const followsRef = useRef<CommunityFollow[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const followedIds = [...followsRef.current.map((f) => f.followed), user.id]
      const filterIds = filter === 'following' ? followedIds : undefined
      const result = await getCommunityPosts(1, 10, filterIds)
      const newPosts = result.items as CommunityPost[]
      setPosts(newPosts)
      setHasMore(result.page < result.totalPages)
      setPage(1)
      const ids = newPosts.map((p) => p.id)
      setInteractions(ids.length ? await getPostInteractions(ids) : [])
    } catch {
      setPosts([])
      setInteractions([])
    } finally {
      setLoading(false)
    }
  }, [user, filter])

  const loadFollows = useCallback(async () => {
    if (!user) return
    try {
      const f = await getFollowing(user.id)
      followsRef.current = f
      setFollows(f)
    } catch {
      /* ignore */
    }
  }, [user])

  const handleRefresh = async () => {
    await loadFollows()
    loadData()
  }

  useEffect(() => {
    loadData()
    loadFollows()
  }, [loadData, loadFollows])

  useRealtime('community_posts', () => loadData())
  useRealtime('community_interactions', () => loadData())

  const loadMore = async () => {
    if (!user || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const followedIds = [...followsRef.current.map((f) => f.followed), user.id]
      const filterIds = filter === 'following' ? followedIds : undefined
      const result = await getCommunityPosts(nextPage, 10, filterIds)
      const newPosts = result.items as CommunityPost[]
      const allPosts = [...posts, ...newPosts]
      setPosts(allPosts)
      setHasMore(result.page < result.totalPages)
      setPage(nextPage)
      const allIds = allPosts.map((p) => p.id)
      setInteractions(allIds.length ? await getPostInteractions(allIds) : [])
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false)
    }
  }

  const likesByPost = new Map<string, CommunityInteraction[]>()
  const commentsByPost = new Map<string, CommunityInteraction[]>()
  interactions.forEach((i) => {
    const map = i.type === 'like' ? likesByPost : commentsByPost
    const arr = map.get(i.post) || []
    arr.push(i)
    map.set(i.post, arr)
  })

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PostComposer onPosted={handleRefresh} />
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Globe className="mr-1 h-4 w-4" /> Todos
        </Button>
        <Button
          variant={filter === 'following' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('following')}
        >
          <Users className="mr-1 h-4 w-4" /> Seguindo
        </Button>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Nenhuma publicação ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              likes={likesByPost.get(post.id) || []}
              comments={commentsByPost.get(post.id) || []}
              followId={follows.find((f) => f.followed === post.user)?.id || null}
              onRefresh={handleRefresh}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
