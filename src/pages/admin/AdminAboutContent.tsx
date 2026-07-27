import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAboutGrandNames,
  getAboutGrandNameImageUrl,
  adminCreateAboutGrandName,
  adminDeleteAboutGrandName,
  getAboutMediaMentions,
  adminCreateAboutMediaMention,
  adminDeleteAboutMediaMention,
  getAboutRecommendations,
  adminCreateAboutRecommendation,
  adminDeleteAboutRecommendation,
  getAboutEnvironmentImages,
  getAboutEnvironmentImageUrl,
  adminCreateAboutEnvironmentImage,
  adminDeleteAboutEnvironmentImage,
} from '@/services/about-collections'
import type {
  AboutGrandName,
  AboutMediaMention,
  AboutRecommendation,
  AboutEnvironmentImage,
} from '@/types'

export default function AdminAboutContent() {
  const [gn, setGn] = useState<AboutGrandName[]>([])
  const [media, setMedia] = useState<AboutMediaMention[]>([])
  const [recs, setRecs] = useState<AboutRecommendation[]>([])
  const [env, setEnv] = useState<AboutEnvironmentImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [gnName, setGnName] = useState('')
  const [gnDesc, setGnDesc] = useState('')
  const [gnFile, setGnFile] = useState<File | null>(null)
  const [mTitle, setMTitle] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mLink, setMLink] = useState('')
  const [mFile, setMFile] = useState<File | null>(null)
  const [mVideoUrl, setMVideoUrl] = useState('')
  const [rUrl, setRUrl] = useState('')
  const [rDesc, setRDesc] = useState('')
  const [eFile, setEFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    const [gnD, mD, rD, eD] = await Promise.all([
      getAboutGrandNames().catch(() => []),
      getAboutMediaMentions().catch(() => []),
      getAboutRecommendations().catch(() => []),
      getAboutEnvironmentImages().catch(() => []),
    ])
    setGn(gnD as AboutGrandName[])
    setMedia(mD as AboutMediaMention[])
    setRecs(rD as AboutRecommendation[])
    setEnv(eD as AboutEnvironmentImage[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('about_grand_names', () => load())
  useRealtime('about_media_mentions', () => load())
  useRealtime('about_recommendations', () => load())
  useRealtime('about_environment_images', () => load())

  const addGn = async () => {
    if (!gnFile || !gnName) return toast.error('Imagem e nome são obrigatórios')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', gnFile)
      fd.append('name', gnName)
      fd.append('description', gnDesc)
      fd.append('order', String(gn.length))
      await adminCreateAboutGrandName(fd)
      setGnName('')
      setGnDesc('')
      setGnFile(null)
      toast.success('Adicionado')
    } catch {
      toast.error('Erro')
    } finally {
      setSaving(false)
    }
  }

  const addMedia = async () => {
    if (!mTitle) return toast.error('Título é obrigatório')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', mTitle)
      fd.append('description', mDesc)
      fd.append('link', mLink)
      fd.append('video_url', mVideoUrl)
      if (mFile) fd.append('image', mFile)
      fd.append('order', String(media.length))
      await adminCreateAboutMediaMention(fd)
      setMTitle('')
      setMDesc('')
      setMLink('')
      setMVideoUrl('')
      setMFile(null)
      toast.success('Adicionado')
    } catch {
      toast.error('Erro')
    } finally {
      setSaving(false)
    }
  }

  const addRec = async () => {
    if (!rUrl) return toast.error('URL do vídeo é obrigatório')
    setSaving(true)
    try {
      await adminCreateAboutRecommendation({
        video_url: rUrl,
        description: rDesc,
        order: recs.length,
      })
      setRUrl('')
      setRDesc('')
      toast.success('Adicionado')
    } catch {
      toast.error('Erro')
    } finally {
      setSaving(false)
    }
  }

  const addEnv = async () => {
    if (!eFile) return toast.error('Imagem é obrigatória')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('image', eFile)
      fd.append('order', String(env.length))
      await adminCreateAboutEnvironmentImage(fd)
      setEFile(null)
      toast.success('Adicionado')
    } catch {
      toast.error('Erro')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  const DelBtn = ({ onClick }: { onClick: () => void }) => (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100"
      onClick={onClick}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <h1 className="text-2xl font-bold">Conteúdo da Página Sobre</h1>
      <Tabs defaultValue="gn">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="gn">Grandes Nomes</TabsTrigger>
          <TabsTrigger value="media">Na Mídia</TabsTrigger>
          <TabsTrigger value="recs">Recomendações</TabsTrigger>
          <TabsTrigger value="env">Ambiente</TabsTrigger>
        </TabsList>

        <TabsContent value="gn">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="md:col-span-2">
                  <Label>Nome</Label>
                  <Input value={gnName} onChange={(e) => setGnName(e.target.value)} />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={gnDesc} onChange={(e) => setGnDesc(e.target.value)} />
                </div>
                <div>
                  <Label>Imagem</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGnFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <Button onClick={addGn} disabled={saving}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gn.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={getAboutGrandNameImageUrl(item) || ''}
                      alt={item.name}
                      className="rounded-lg w-full h-40 object-cover"
                    />
                    <p className="font-medium text-sm mt-1">{item.name}</p>
                    <DelBtn
                      onClick={async () => {
                        await adminDeleteAboutGrandName(item.id)
                        toast.success('Removido')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <Label>Título</Label>
                  <Input value={mTitle} onChange={(e) => setMTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input value={mDesc} onChange={(e) => setMDesc(e.target.value)} />
                </div>
                <div>
                  <Label>Link (opcional)</Label>
                  <Input
                    value={mLink}
                    onChange={(e) => setMLink(e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div>
                  <Label>Vídeo (YouTube)</Label>
                  <Input
                    value={mVideoUrl}
                    onChange={(e) => setMVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <Label>Imagem (opcional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <Button onClick={addMedia} disabled={saving}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
              <div className="grid md:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group bg-white rounded-lg border p-4">
                    <p className="font-medium">{item.title}</p>
                    {item.video_url && (
                      <p className="text-xs text-primary mt-1 truncate">{item.video_url}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <DelBtn
                      onClick={async () => {
                        await adminDeleteAboutMediaMention(item.id)
                        toast.success('Removido')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recs">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <Label>URL do Vídeo</Label>
                  <Input
                    value={rUrl}
                    onChange={(e) => setRUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Input value={rDesc} onChange={(e) => setRDesc(e.target.value)} />
                </div>
              </div>
              <Button onClick={addRec} disabled={saving}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
              <div className="space-y-3">
                {recs.map((item) => (
                  <div
                    key={item.id}
                    className="relative group flex items-center gap-4 bg-white rounded-lg border p-3"
                  >
                    <p className="text-sm flex-1 truncate">{item.video_url}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <DelBtn
                      onClick={async () => {
                        await adminDeleteAboutRecommendation(item.id)
                        toast.success('Removido')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2 items-end">
                <div>
                  <Label>Imagem</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={addEnv} disabled={saving}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {env.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={getAboutEnvironmentImageUrl(item) || ''}
                      alt=""
                      className="rounded-lg w-full h-32 object-cover"
                    />
                    <DelBtn
                      onClick={async () => {
                        await adminDeleteAboutEnvironmentImage(item.id)
                        toast.success('Removido')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
