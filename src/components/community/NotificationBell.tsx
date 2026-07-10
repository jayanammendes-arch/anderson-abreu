import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getNotifications, getUnreadCount, markAllAsRead } from '@/services/notifications'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bell, CheckCheck } from 'lucide-react'
import type { AppNotification } from '@/types'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const loadingRef = useRef(false)

  const loadData = useCallback(async () => {
    if (!user) return
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const [count, result] = await Promise.all([
        getUnreadCount(user.id),
        getNotifications(user.id),
      ])
      setUnread(count)
      setNotifications(result.items as AppNotification[])
    } catch {
      /* ignore */
    } finally {
      loadingRef.current = false
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('notifications', () => loadData())

  const handleMarkAll = async () => {
    if (!user) return
    try {
      await markAllAsRead(user.id)
      loadData()
    } catch {
      /* ignore */
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <span className="font-medium">Notificações</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAll} className="h-7 text-xs">
              <CheckCheck className="mr-1 h-3 w-3" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <div className="divide-y">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={cn('p-3 text-sm', !n.read && 'bg-primary/5')}>
                  <p className={cn(!n.read && 'font-medium')}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.created).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
