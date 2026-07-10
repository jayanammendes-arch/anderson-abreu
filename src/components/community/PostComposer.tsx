import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getUserAccess } from '@/services/user-access'
import { getCourses } from '@/services/courses'
import { createPost } from '@/services/community'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Trophy,
  MessageSquareQuote,
  Send,
  Loader2,
  X,
} from 'lucide-react'
import type { Course } from '@/types'

export function PostComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [videoInput, setVideoInput] = useState('')
  const [postType, setPostType] = useState<'text' | 'achievement' | 'testimony'>('text')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (postType === 'achievement' && user) {
      getUserAccess(user.id)
        .then(async (access) => {
          const allCourses = await getCourses()
          const ids = new Set(access.map((a) => a.course))
          setCourses(allCourses.filter((c) => ids.has(c.id)))
        })
        .catch(() => setCourses([]))
    }
  }, [postType, user])

  const canPublish =
    user && (content.trim() || image || videoUrl) && (postType !== 'achievement' || selectedCourse)

  const handlePublish = async () => {
    if (!canPublish || !user) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('user', user.id)
      const type = postType !== 'text' ? postType : image ? 'image' : videoUrl ? 'video' : 'text'
      formData.append('type', type)
      formData.append('content', content.trim())
      if (image) formData.append('image', image)
      if (videoUrl) formData.append('video_url', videoUrl)
      if (postType === 'achievement' && selectedCourse)
        formData.append('related_course', selectedCourse)
      formData.append('is_hidden', 'false')
      await createPost(formData)
      setContent('')
      setImage(null)
      setVideoUrl('')
      setPostType('text')
      setSelectedCourse('')
      onPosted()
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Compartilhe algo com a comunidade..."
        rows={3}
        className="resize-none border-none bg-transparent focus-visible:ring-0"
      />
      {image && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" /> {image.name}
          <button onClick={() => setImage(null)} className="text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {videoUrl && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <VideoIcon className="h-4 w-4" /> {videoUrl}
          <button onClick={() => setVideoUrl('')} className="text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {postType === 'achievement' && (
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o curso relacionado" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setImage(f)
            e.target.value = ''
          }}
        />
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="mr-1 h-4 w-4" /> Imagem
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setVideoInput('')
            setShowVideoDialog(true)
          }}
        >
          <VideoIcon className="mr-1 h-4 w-4" /> Vídeo
        </Button>
        <Button
          variant={postType === 'achievement' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setPostType(postType === 'achievement' ? 'text' : 'achievement')}
        >
          <Trophy className="mr-1 h-4 w-4" /> Conquista
        </Button>
        <Button
          variant={postType === 'testimony' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setPostType(postType === 'testimony' ? 'text' : 'testimony')}
        >
          <MessageSquareQuote className="mr-1 h-4 w-4" /> Depoimento
        </Button>
        <Button
          className="ml-auto bg-green-600 hover:bg-green-700"
          size="sm"
          onClick={handlePublish}
          disabled={!canPublish || submitting}
        >
          {submitting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1 h-4 w-4" />
          )}
          Publicar
        </Button>
      </div>
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar vídeo</DialogTitle>
          </DialogHeader>
          <Input
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="Cole o link do YouTube ou Vimeo"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setVideoUrl(videoInput)
                setShowVideoDialog(false)
              }}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
