import pb from '@/lib/pocketbase/client'
import type { BlogPost } from '@/types'

export const getBlogPosts = (): Promise<BlogPost[]> =>
  pb.collection('blog_posts').getFullList({ sort: '-published_at' })

export const getBlogPostBySlug = (slug: string): Promise<BlogPost> =>
  pb.collection('blog_posts').getFirstListItem(`slug = "${slug}"`)

export function getBlogImageUrl(post: BlogPost): string | null {
  if (!post.image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/blog_posts/${post.id}/${post.image}`
}

export const adminGetBlogPosts = (): Promise<BlogPost[]> =>
  pb.collection('blog_posts').getFullList({ sort: '-published_at' })

export const adminCreateBlogPost = (data: Record<string, unknown> | FormData) =>
  pb.collection('blog_posts').create(data)

export const adminUpdateBlogPost = (id: string, data: Record<string, unknown> | FormData) =>
  pb.collection('blog_posts').update(id, data)

export const adminDeleteBlogPost = (id: string) => pb.collection('blog_posts').delete(id)
