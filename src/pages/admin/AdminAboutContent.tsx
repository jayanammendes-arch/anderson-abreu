import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown, Check, X, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import {
  getAboutGrandNames,
  getAboutGrandNameImageUrl,
  adminCreateAboutGrandName,
  adminUpdateAboutGrandName,
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
  adminUpdateAboutEnvironmentImage,
  adminDeleteAboutEnvironmentImage,
} from '@/services/about-collections'
import {
  getPlatformSettings,
  updatePlatformSettings,
  createPlatformSettings,
} from '@/services/admin-settings'
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
  const [gnTitle, setGnTitle] = useState('')
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [gnName, setGnName] = useState('')
  const [gnFile, setGnFile] = useState<File | null>(null)
  const [gnEditingId, setGnEditingId] = useState<string | null>(null)
  const [gnEditingName, setGnEditingName] = useState('')
  const [gnEditErrors, setGnEditErrors] = useState<FieldErrors>({})
  const [mTitle, setMTitle] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mLink, setMLink] = useState('')
  const [mFile, setMFile] = useState<File | null>(null)
  const [mVideoUrl, setMVideoUrl] = useState('')
  const [rUrl, setRUrl] = useState('')
  const [rDesc, setRDesc] = useState('')
  const [eFile, setEFile] = useState<File | null>(null)
  const [envCaptions, setEnvCaptions] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const [gnD, mD, rD, eD, settings] = await Promise.all([
      getAboutGrandNames().catch(() => []),
      getAboutMediaMentions().catch(() => []),
      getAboutRecommendations().catch(() => []),
      getAboutEnvironmentImages().catch(() => []),
      getPlatformSettings().catch(() => null),
    ])
    setGn(gnD as AboutGrandName[])
    setMedia(mD as AboutMediaMention[])
    setRecs(rD as AboutRecommendation[])
    setEnv(eD as AboutEnvironmentImage[])
    if (settings) {
      setSettingsId(settings.id)
      setGnTitle(settings.about_grand_names_title || '')
    }
    setLoading(false)
  }, [])

  const saveGnTitle = async () => {
    setSavingTitle(true)
    try {
      if (settingsId) {
        await updatePlatformSettings(settingsId, { about_grand_names_title: gnTitle })
      } else {
        const created = await createPlatformSettings({ about_grand_names_title: gnTitle })
        setSettingsId(created.id)
      }
      toast.success('Título da seção atualizado com sucesso!')
    } catch {
      toast.error('Erro ao atualizar título da seção')
    } finally {
      setSavingTitle(false)
    }
  }

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
      fd.append('order', String(gn.length))
      await adminCreateAboutGrandName(fd)
      setGnName('')
      setGnFile(null)
      toast.success('Adicionado')
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        toast.error(Object.values(fieldErrors).join(' '))
      } else {
        toast.error('Erro')
      }
    } finally {
      setSaving(false)
    }
  }

  const startEditGnName = (item: AboutGrandName) => {
    setGnEditingId(item.id)
    setGnEditingName(item.name)
    setGnEditErrors({})
  }

  const cancelEditGnName = () => {
    setGnEditingId(null)
    setGnEditingName('')
    setGnEditErrors({})
  }

  const saveGnName = async (id: string) => {
    if (!gnEditingName.trim()) {
      setGnEditErrors({ name: 'Nome é obrigatório' })
      return
    }
    try {
      await adminUpdateAboutGrandName(id, { name: gnEditingName.trim() })
      toast.success('Nome atualizado')
      setGnEditingId(null)
      setGnEditingName('')
      setGnEditErrors({})
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setGnEditErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) {
        toast.error('Erro ao atualizar nome')
      }
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

  const moveEnv = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === env.length - 1) return
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const current = env[index]
    const swap = env[swapIndex]
    const newCurrentOrder = swap.order
    const newSwapOrder = current.order
    try {
      await adminUpdateAboutEnvironmentImage(current.id, { order: newCurrentOrder })
      await adminUpdateAboutEnvironmentImage(swap.id, { order: newSwapOrder })
      toast.success('Ordem atualizada')
      load()
    } catch {
      toast.error('Erro ao reordenar')
    }
  }

  const saveEnvCaption = async (id: string) => {
    const caption = envCaptions[id] ?? ''
    try {
      await adminUpdateAboutEnvironmentImage(id, { caption })
      toast.success('Legenda salva')
      setEnvCaptions((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      load()
    } catch {
      toast.error('Erro ao salvar legenda')
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
              <div className="flex gap-2 items-end pb-4 border-b border-border/50">
                <div className="flex-1">
                  <Label>Título da Seção Grandes Nomes</Label>
                  <Input
                    value={gnTitle}
                    onChange={(e) => setGnTitle(e.target.value)}
                    placeholder="Com Grandes Nomes da Hipnoterapia"
                  />
                </div>
                <Button onClick={saveGnTitle} disabled={savingTitle} variant="secondary">
                  {savingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Título'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="md:col-span-2">
                  <Label>Nome</Label>
                  <Input value={gnName} onChange={(e) => setGnName(e.target.value)} />
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
                    {gnEditingId === item.id ? (
                      <div className="mt-1 space-y-1">
                        <Input
                          value={gnEditingName}
                          onChange={(e) => {
                            setGnEditingName(e.target.value)
                            if (gnEditErrors.name) {
                              setGnEditErrors((prev) => {
                                const next = { ...prev }
                                delete next.name
                                return next
                              })
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveGnName(item.id)
                            if (e.key === 'Escape') cancelEditGnName()
                          }}
                          maxLength={255}
                          autoFocus
                          className={cn('h-8', gnEditErrors.name && 'border-red-500')}
                        />
                        {gnEditErrors.name && (
                          <p className="text-xs text-red-500">{gnEditErrors.name}</p>
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2"
                            onClick={() => saveGnName(item.id)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={cancelEditGnName}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1">
                        <p className="font-medium text-sm flex-1 truncate">{item.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => startEditGnName(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
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
                <div className="flex-1">
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
              <div className="space-y-3">
                {env.map((item, index) => {
                  const captionValue =
                    envCaptions[item.id] !== undefined ? envCaptions[item.id] : item.caption || ''
                  return (
                    <div
                      key={item.id}
                      className="relative group flex items-center gap-3 bg-white rounded-lg border p-3"
                    >
                      <span className="text-xs font-mono w-6 text-center text-muted-foreground">
                        {index + 1}
                      </span>
                      <img
                        src={getAboutEnvironmentImageUrl(item) || ''}
                        alt=""
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Legenda</Label>
                        <Input
                          value={captionValue}
                          onChange={(e) =>
                            setEnvCaptions((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            if (
                              envCaptions[item.id] !== undefined &&
                              envCaptions[item.id] !== (item.caption || '')
                            ) {
                              saveEnvCaption(item.id)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              ;(e.target as HTMLInputElement).blur()
                            }
                          }}
                          maxLength={255}
                          placeholder="Ex: Recepção"
                          className="h-8"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => moveEnv(index, 'up')}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === env.length - 1}
                          onClick={() => moveEnv(index, 'down')}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <DelBtn
                        onClick={async () => {
                          await adminDeleteAboutEnvironmentImage(item.id)
                          toast.success('Removido')
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
