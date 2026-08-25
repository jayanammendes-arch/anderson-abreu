import pb from '@/lib/pocketbase/client'
import type { CommunityPost, CommunityInteraction, CommunityFollow } from '@/types'

export const getFileUrl = (collection: string, recordId: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${collection}/${recordId}/${filename}`

export const getAvatarUrl = (user: { id: string; avatar?: string }) =>
  user.avatar ? getFileUrl('users', user.id, user.avatar) : undefined

export async function getCommunityPosts(page = 1, perPage = 10, followingIds?: string[]) {
  if (followingIds !== undefined && followingIds.length === 0) {
    return { items: [], page, perPage, totalItems: 0, totalPages: 0 }
  }
  let filter: string | undefined
  if (followingIds && followingIds.length > 0) {
    filter = followingIds.map((id) => `user = "${id}"`).join(' || ')
  }
  return pb.collection('community_posts').getList(page, perPage, {
    sort: '-created',
    expand: 'user,related_course',
    filter,
  })
}

export async function getPostInteractions(postIds: string[]): Promise<CommunityInteraction[]> {
  if (postIds.length === 0) return []
  const filter = postIds.map((id) => `post = "${id}"`).join(' || ')
  return pb.collection('community_interactions').getFullList({
    filter,
    sort: 'created',
    expand: 'user',
  }) as Promise<CommunityInteraction[]>
}

export function createPost(data: FormData) {
  return pb.collection('community_posts').create(data)
}

export function deletePost(id: string) {
  return pb.collection('community_posts').delete(id)
}

export function togglePostHidden(id: string, hidden: boolean) {
  return pb.collection('community_posts').update(id, { is_hidden: hidden })
}

export function toggleLike(postId: string, userId: string, existingLikeId?: string) {
  if (existingLikeId) return pb.collection('community_interactions').delete(existingLikeId)
  return pb
    .collection('community_interactions')
    .create({ post: postId, user: userId, type: 'like' })
}

export function createComment(postId: string, userId: string, text: string) {
  return pb.collection('community_interactions').create({
    post: postId,
    user: userId,
    type: 'comment',
    comment_text: text,
  })
}

export async function getFollowing(userId: string): Promise<CommunityFollow[]> {
  return pb.collection('community_follows').getFullList({
    filter: `follower = "${userId}"`,
  }) as Promise<CommunityFollow[]>
}

export function followUser(followerId: string, followedId: string) {
  return pb.collection('community_follows').create({ follower: followerId, followed: followedId })
}

export function unfollowUser(id: string) {
  return pb.collection('community_follows').delete(id)
}

export async function getUserPostCount(userId: string): Promise<number> {
  const result = await pb.collection('community_posts').getList(1, 1, {
    filter: `user = "${userId}"`,
  })
  return result.totalItems
}

export function getUserProfile(userId: string) {
  return pb.collection('users').getOne(userId)
}
