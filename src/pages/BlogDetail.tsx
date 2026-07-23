import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBlogPostBySlug, getBlogImageUrl } from '@/services/blog'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { BlogPost, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      getBlogPostBySlug(slug).catch(() => null),
      getPlatformSettingsPublic().catch(() => null),
    ]).then(([data, settingsData]) => {
      setPost(data as BlogPost | null)
      setSettings(settingsData as PlatformSettings | null)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  if (!post) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex flex-col items-center justify-center min-h-screen pt-20 px-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Post não encontrado</h1>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o blog
            </Link>
          </Button>
        </div>
      </LandingLayout>
    )
  }

  const imageUrl = getBlogImageUrl(post)
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <LandingLayout settings={settings}>
      <article className="pt-32 pb-20 bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 text-slate-500 hover:text-slate-900"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o blog
          </Button>

          {dateStr && (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Calendar className="h-4 w-4" />
              {dateStr}
              {post.author && <span>• {post.author}</span>}
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-500 leading-relaxed mb-8">{post.excerpt}</p>
          )}

          {imageUrl && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-slate-100">
              <img src={imageUrl} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none text-slate-700
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_li]:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </LandingLayout>
  )
}
