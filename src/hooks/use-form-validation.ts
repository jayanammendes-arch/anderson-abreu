import { useState, useCallback } from 'react'

export type FieldErrors = Record<string, string>

export interface ValidationRule {
  name: string
  value: unknown
  required?: boolean
  type?: 'email' | 'url'
  label?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/.+/

export function useFormValidation() {
  const [errors, setErrors] = useState<FieldErrors>({})

  const validate = useCallback((rules: ValidationRule[]): boolean => {
    const newErrors: FieldErrors = {}
    for (const rule of rules) {
      const val = rule.value
      const isEmpty = val == null || (typeof val === 'string' && val.trim() === '')
      if (rule.required && isEmpty) {
        newErrors[rule.name] = 'Este campo é obrigatório'
        continue
      }
      if (!isEmpty && rule.type === 'email' && !EMAIL_RE.test(String(val))) {
        newErrors[rule.name] = 'E-mail inválido'
        continue
      }
      if (!isEmpty && rule.type === 'url' && !URL_RE.test(String(val))) {
        newErrors[rule.name] = 'URL inválida (deve começar com http:// ou https://)'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const clearFieldError = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const clearAll = useCallback(() => setErrors({}), [])

  return { errors, validate, clearFieldError, clearAll }
}
