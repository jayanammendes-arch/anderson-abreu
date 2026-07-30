import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Share, Plus, Download, X } from 'lucide-react'

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: boolean }).MSStream
  )
}

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = usePWA()
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed')
    if (dismissedTime) {
      const hoursSince = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60)
      if (hoursSince < 24) setDismissed(true)
    }
  }, [])

  if (isInstalled || dismissed) return null
  if (!canInstall && !isIOS()) return null

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSGuide(true)
    } else {
      await promptInstall()
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg animate-fade-in-up sm:left-auto sm:right-4">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Instalar App</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acesse seus cursos offline diretamente do seu dispositivo.
            </p>
            <Button size="sm" className="mt-2 w-full" onClick={handleInstall}>
              Instalar
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Instalar no iPhone</SheetTitle>
            <SheetDescription>Para instalar o app no seu iPhone:</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="flex items-start gap-3">
              <Share className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Plus className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Confirme para adicionar o ícone do app à sua tela inicial.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
