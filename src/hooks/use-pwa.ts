import { useEffect, useState, useCallback } from 'react'
import { getPlatformSettingsPublic } from '@/services/landing'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as { standalone?: boolean }).standalone === true,
      )
    }
    checkInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e as BeforeInstallPromptEvent)
    }
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPromptEvent(null)
    }
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    getPlatformSettingsPublic()
      .then((settings) => {
        if (!settings?.company_name) return
        const manifest = {
          name: `${settings.company_name} - Área do Aluno`,
          short_name: settings.company_name,
          icons: [
            { src: '/skip.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/og-image.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          ],
          theme_color: settings.primary_color || '#0ea5e9',
          background_color: '#ffffff',
          display: 'standalone' as const,
          start_url: '/',
          scope: '/',
        }
        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        document.querySelector('link[rel="manifest"]')?.setAttribute('href', url)
        if (settings.primary_color) {
          document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', settings.primary_color)
        }
      })
      .catch(() => {})
  }, [])

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) return { outcome: 'dismissed' as const }
    await installPromptEvent.prompt()
    const choice = await installPromptEvent.userChoice
    setInstallPromptEvent(null)
    return { outcome: choice.outcome }
  }, [installPromptEvent])

  return {
    canInstall: !!installPromptEvent && !isInstalled,
    isInstalled,
    isOnline,
    promptInstall,
  }
}
