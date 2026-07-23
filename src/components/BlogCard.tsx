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
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        {dateStr && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-slate-500 line-clamp-3 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-1 text-sm font-medium text-primary mt-4">
          Ler mais
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
