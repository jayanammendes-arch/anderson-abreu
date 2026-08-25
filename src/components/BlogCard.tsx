import { Link } from 'react-router-dom'
import { Calendar, ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/types'
import { getBlogImageUrl } from '@/services/blog'

export function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = getBlogImageUrl(post)
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border border-[#0E1D2F] rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted/50 to-muted" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {dateStr && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-1 text-sm font-medium text-primary mt-4">
          Ler mais
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
