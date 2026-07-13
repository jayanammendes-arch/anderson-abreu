import pb from '@/lib/pocketbase/client'

export interface AdminCommunityPost {
  id: string
  user: string
  userName: string
  type: string
  content: string
  is_hidden: boolean
  video_url: string
  created: string
}

export const adminGetCommunityPosts = async (): Promise<AdminCommunityPost[]> =>
  pb.send('/backend/v1/admin/community', { method: 'GET' })

export const adminTogglePostVisibility = (id: string, isHidden: boolean) =>
  pb.collection('community_posts').update(id, { is_hidden: isHidden })

export const adminDeletePost = (id: string) => pb.collection('community_posts').delete(id)
