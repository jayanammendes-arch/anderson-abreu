import pb from '@/lib/pocketbase/client'
import type { InstagramPost } from '@/types'

/**
 * Retorna os posts do Instagram ativos para exibição pública no site.
 * Ordenados por order asc e created desc.
 */
export async function getActiveInstagramPosts(): Promise<InstagramPost[]> {
  try {
    return await pb.collection('instagram_posts').getFullList<InstagramPost>({
      filter: 'is_active = true',
      sort: 'order,-created',
    })
  } catch {
    return []
  }
}

/**
 * Retorna todos os posts do Instagram para gestão no Admin.
 */
export async function adminGetInstagramPosts(): Promise<InstagramPost[]> {
  return await pb.collection('instagram_posts').getFullList<InstagramPost>({
    sort: 'order,-created',
  })
}

export async function adminCreateInstagramPost(
  data: FormData | Record<string, unknown>,
): Promise<InstagramPost> {
  return await pb.collection('instagram_posts').create<InstagramPost>(data)
}

export async function adminUpdateInstagramPost(
  id: string,
  data: FormData | Record<string, unknown>,
): Promise<InstagramPost> {
  return await pb.collection('instagram_posts').update<InstagramPost>(id, data)
}

export async function adminDeleteInstagramPost(id: string): Promise<boolean> {
  return await pb.collection('instagram_posts').delete(id)
}

export function getInstagramPostImageUrl(post: { id: string; image?: string }): string | null {
  if (post.image) {
    return pb.files.getUrl(
      {
        id: post.id,
        collectionId: 'instagram_posts',
        collectionName: 'instagram_posts',
      } as any,
      post.image,
    )
  }
  return null
}
