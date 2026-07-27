import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const targetId = decodeURIComponent(hash)
      let elapsed = 0
      const interval = setInterval(() => {
        const el = document.querySelector(targetId)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top, behavior: 'smooth' })
          clearInterval(interval)
        } else {
          elapsed += 100
          if (elapsed >= 5000) {
            clearInterval(interval)
          }
        }
      }, 100)
      return () => clearInterval(interval)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
