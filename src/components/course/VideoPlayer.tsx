import { useEffect, useRef, useState } from 'react'
import { PlayCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onNearComplete: () => void
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      if (existing.getAttribute('data-loaded')) resolve()
      else existing.addEventListener('load', () => resolve())
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => {
      s.setAttribute('data-loaded', 'true')
      resolve()
    }
    document.head.appendChild(s)
  })
}

export function VideoPlayer({ videoUrl, title, onNearComplete }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const completedRef = useRef(false)
  const callbackRef = useRef(onNearComplete)
  callbackRef.current = onNearComplete
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    completedRef.current = false
    if (playerRef.current) {
      try {
        playerRef.current.destroy?.()
      } catch {
        /* intentionally ignored */
      }
      playerRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
    if (containerRef.current) containerRef.current.innerHTML = ''

    if (!videoUrl) {
      setHasVideo(false)
      return
    }
    setHasVideo(true)

    const ytId = getYouTubeId(videoUrl)
    const vimeoId = getVimeoId(videoUrl)

    if (ytId) {
      loadScript('https://www.youtube.com/iframe_api').then(() => {
        const init = () => {
          const YT = (window as any).YT
          if (!YT?.Player || !containerRef.current || playerRef.current) {
            setTimeout(init, 200)
            return
          }
          const iframe = document.createElement('iframe')
          iframe.src = `https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0`
          iframe.className = 'h-full w-full'
          iframe.allowFullscreen = true
          iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
          containerRef.current!.innerHTML = ''
          containerRef.current!.appendChild(iframe)
          playerRef.current = new YT.Player(iframe, {
            events: {
              onStateChange: (e: any) => {
                if (e.data === 1) {
                  if (intervalRef.current) clearInterval(intervalRef.current)
                  intervalRef.current = setInterval(() => {
                    const p = playerRef.current
                    if (!completedRef.current && p?.getDuration) {
                      const dur = p.getDuration()
                      if (dur > 0 && p.getCurrentTime() >= dur - 20) {
                        completedRef.current = true
                        callbackRef.current()
                        if (intervalRef.current) clearInterval(intervalRef.current)
                      }
                    }
                  }, 1000)
                }
              },
            },
          })
        }
        setTimeout(init, 300)
      })
    } else if (vimeoId) {
      loadScript('https://player.vimeo.com/api/player.js').then(() => {
        const Vimeo = (window as any).Vimeo
        if (!Vimeo?.Player || !containerRef.current) return
        const iframe = document.createElement('iframe')
        iframe.src = `https://player.vimeo.com/video/${vimeoId}`
        iframe.className = 'h-full w-full'
        iframe.allowFullscreen = true
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
        containerRef.current!.innerHTML = ''
        containerRef.current!.appendChild(iframe)
        playerRef.current = new Vimeo.Player(iframe)
        playerRef.current.on('timeupdate', (data: any) => {
          if (!completedRef.current && data.duration > 0 && data.seconds >= data.duration - 20) {
            completedRef.current = true
            callbackRef.current()
          }
        })
      })
    } else {
      if (!containerRef.current) return
      const iframe = document.createElement('iframe')
      iframe.src = videoUrl
      iframe.className = 'h-full w-full'
      iframe.allowFullscreen = true
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
      iframe.title = title
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(iframe)
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy?.()
        } catch {
          /* intentionally ignored */
        }
        playerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [videoUrl, title])

  if (!hasVideo) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-black shadow-lg">
        <PlayCircle className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-xl bg-black shadow-lg"
    />
  )
}
