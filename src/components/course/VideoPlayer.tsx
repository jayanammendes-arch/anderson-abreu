import { useEffect, useRef, useState } from 'react'
import { PlayCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  initialPosition?: number
  onProgressSave?: (currentTime: number) => void
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

export function VideoPlayer({
  videoUrl,
  title,
  initialPosition = 0,
  onProgressSave,
  onNearComplete,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const tickCountRef = useRef(0)
  const completedRef = useRef(false)
  const lastPositionRef = useRef(0)
  const nearCompleteRef = useRef(onNearComplete)
  const progressRef = useRef(onProgressSave)
  nearCompleteRef.current = onNearComplete
  progressRef.current = onProgressSave
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    completedRef.current = false
    tickCountRef.current = 0
    lastPositionRef.current = 0
    if (playerRef.current) {
      try {
        playerRef.current.destroy?.()
      } catch {
        /* ignored */
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
    const startPos = initialPosition

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
          iframe.className = 'absolute inset-0 h-full w-full'
          iframe.style.border = 'none'
          iframe.allowFullscreen = true
          iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
          containerRef.current!.innerHTML = ''
          containerRef.current!.appendChild(iframe)
          playerRef.current = new YT.Player(iframe, {
            events: {
              onReady: (e: any) => {
                if (startPos > 5) e.target.seekTo(startPos, true)
              },
              onStateChange: (e: any) => {
                if (e.data === 1) {
                  if (intervalRef.current) clearInterval(intervalRef.current)
                  intervalRef.current = setInterval(() => {
                    const p = playerRef.current
                    if (!p?.getDuration) return
                    const dur = p.getDuration()
                    const cur = p.getCurrentTime()
                    lastPositionRef.current = cur
                    tickCountRef.current++
                    if (!completedRef.current && dur > 0 && cur >= dur - 20) {
                      completedRef.current = true
                      nearCompleteRef.current?.()
                    }
                    if (tickCountRef.current % 15 === 0 && progressRef.current) {
                      progressRef.current(cur)
                    }
                  }, 1000)
                } else if (e.data === 2 || e.data === 0) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = undefined
                  }
                  if (progressRef.current && lastPositionRef.current > 0)
                    progressRef.current(lastPositionRef.current)
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
        iframe.className = 'absolute inset-0 h-full w-full'
        iframe.style.border = 'none'
        iframe.allowFullscreen = true
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
        containerRef.current!.innerHTML = ''
        containerRef.current!.appendChild(iframe)
        playerRef.current = new Vimeo.Player(iframe)
        if (startPos > 5) playerRef.current.setCurrentTime(startPos).catch(() => {})
        let vimeoTick = 0
        playerRef.current.on('timeupdate', (data: any) => {
          lastPositionRef.current = data.seconds
          vimeoTick++
          if (!completedRef.current && data.duration > 0 && data.seconds >= data.duration - 20) {
            completedRef.current = true
            nearCompleteRef.current?.()
          }
          if (vimeoTick % 15 === 0 && progressRef.current) progressRef.current(data.seconds)
        })
        playerRef.current.on('ended', () => {
          if (progressRef.current && lastPositionRef.current > 0)
            progressRef.current(lastPositionRef.current)
        })
      })
    } else {
      if (!containerRef.current) return
      const iframe = document.createElement('iframe')
      iframe.src = videoUrl
      iframe.className = 'absolute inset-0 h-full w-full'
      iframe.style.border = 'none'
      iframe.allowFullscreen = true
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
      iframe.title = title
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(iframe)
    }

    return () => {
      if (progressRef.current && lastPositionRef.current > 0)
        progressRef.current(lastPositionRef.current)
      if (playerRef.current) {
        try {
          playerRef.current.destroy?.()
        } catch {
          /* ignored */
        }
        playerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [videoUrl, title]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasVideo) {
    return (
      <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black">
        <PlayCircle className="h-12 w-12 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden bg-black" />
  )
}
