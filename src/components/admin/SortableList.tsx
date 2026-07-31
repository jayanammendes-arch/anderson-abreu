import { useState, useRef, useEffect, type ReactNode } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableRenderProps {
  dragHandle: ReactNode
  isDragging: boolean
  isPlaceholder: boolean
}

interface SortableListProps<T> {
  items: T[]
  keyExtractor: (item: T) => string
  onReorder: (reordered: T[]) => void | Promise<void>
  renderItem: (item: T, props: SortableRenderProps) => ReactNode
  disabled?: boolean
}

export function SortableList<T>({
  items,
  keyExtractor,
  onReorder,
  renderItem,
  disabled = false,
}: SortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number; width: number } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
  const dragIndexRef = useRef<number | null>(null)
  const localItemsRef = useRef(items)
  const offsetYRef = useRef(0)
  const longPressTimer = useRef<number | null>(null)
  const onReorderRef = useRef(onReorder)
  const keyExtractorRef = useRef(keyExtractor)
  const itemsRef = useRef(items)

  itemsRef.current = items
  onReorderRef.current = onReorder
  keyExtractorRef.current = keyExtractor

  useEffect(() => {
    setLocalItems(items)
    localItemsRef.current = items
  }, [items])
  useEffect(() => {
    dragIndexRef.current = dragIndex
  }, [dragIndex])
  useEffect(() => {
    localItemsRef.current = localItems
  }, [localItems])
  useEffect(
    () => () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!isDragging) return

    const findTarget = (clientY: number): number => {
      const cur = localItemsRef.current
      for (let i = 0; i < cur.length; i++) {
        const el = itemRefs.current.get(keyExtractorRef.current(cur[i]))
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (clientY < r.top + r.height / 2) return i
      }
      return cur.length - 1
    }

    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      setGhostPos((p) => (p ? { ...p, y: e.clientY - offsetYRef.current } : null))
      const target = findTarget(e.clientY)
      if (target !== dragIndexRef.current && dragIndexRef.current !== null) {
        const next = [...localItemsRef.current]
        const [moved] = next.splice(dragIndexRef.current, 1)
        next.splice(target, 0, moved)
        localItemsRef.current = next
        setLocalItems(next)
        dragIndexRef.current = target
        setDragIndex(target)
      }
    }

    const onUp = () => {
      setIsSaving(true)
      Promise.resolve(onReorderRef.current(localItemsRef.current))
        .catch(() => {
          setLocalItems(itemsRef.current)
          localItemsRef.current = itemsRef.current
        })
        .finally(() => {
          setIsSaving(false)
          dragIndexRef.current = null
          setDragIndex(null)
          setIsDragging(false)
          setGhostPos(null)
          document.body.style.userSelect = ''
          document.body.style.cursor = ''
        })
    }

    document.addEventListener('pointermove', onMove, { passive: false })
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging])

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    if (disabled || isSaving) return
    e.preventDefault()
    const el = itemRefs.current.get(keyExtractor(localItemsRef.current[index]))
    if (!el) return
    const rect = el.getBoundingClientRect()
    offsetYRef.current = e.clientY - rect.top

    const begin = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      dragIndexRef.current = index
      setDragIndex(index)
      setIsDragging(true)
      setGhostPos({ x: rect.left, y: e.clientY - offsetYRef.current, width: rect.width })
    }

    if (e.pointerType === 'touch') {
      longPressTimer.current = window.setTimeout(begin, 200)
    } else {
      begin()
    }
  }

  const cancelPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const setItemRef = (key: string) => (el: HTMLElement | null) => {
    if (el) itemRefs.current.set(key, el)
    else itemRefs.current.delete(key)
  }

  const renderHandle = (index: number) => (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors py-1 px-1 flex-shrink-0"
      onPointerDown={(e) => handlePointerDown(e, index)}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      aria-label="Arrastar para reordenar"
      tabIndex={-1}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  )

  return (
    <div className="relative">
      <div className="grid gap-3">
        {localItems.map((item, index) => {
          const key = keyExtractor(item)
          const dragging = dragIndex === index
          return (
            <div
              key={key}
              ref={setItemRef(key)}
              className={cn(
                'transition-transform duration-150',
                dragging && 'opacity-30',
                isSaving && 'pointer-events-none',
              )}
            >
              {renderItem(item, {
                dragHandle: renderHandle(index),
                isDragging: dragging,
                isPlaceholder: dragging,
              })}
            </div>
          )
        })}
      </div>

      {ghostPos && dragIndex !== null && dragIndex < localItems.length && (
        <div
          className="fixed z-50 pointer-events-none opacity-95 shadow-2xl rotate-1 rounded-lg"
          style={{ left: ghostPos.x, top: ghostPos.y, width: ghostPos.width }}
        >
          {renderItem(localItems[dragIndex], {
            dragHandle: (
              <span className="flex items-center py-1">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </span>
            ),
            isDragging: false,
            isPlaceholder: false,
          })}
        </div>
      )}

      {isSaving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/40 rounded-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
