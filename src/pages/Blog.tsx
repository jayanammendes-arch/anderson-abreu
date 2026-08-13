import { useEffect, useState } from 'react'
import { getBlogPosts } from '@/services/blog'
import { getPlatformSettingsPublic } from '@/services/landing'
import type { BlogPost, PlatformSettings } from '@/types'
import { LandingLayout } from '@/components/LandingLayout'
import { BlogCard } from '@/components/BlogCard'
import { Loader2 } from 'lucide-react'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBlogPosts().catch(() => []),
      getPlatformSettingsPublic().catch(() => null),
    ]).then(([data, settingsData]) => {
      setPosts(data as BlogPost[])
      setSettings(settingsData as PlatformSettings | null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <LandingLayout settings={settings}>
        <div className="flex h-screen items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout settings={settings}>
      <section className="pt-32 pb-20 bg-card min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {settings?.blog_section_title || 'Blog'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {settings?.blog_section_intro ||
                'Reflexões, técnicas e histórias sobre hipnose, inteligência emocional e desenvolvimento humano.'}
            </p>
          </div>
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">Nenhum post publicado ainda.</p>
          )}
        </div>
      </section>
    </LandingLayout>
  )
}
