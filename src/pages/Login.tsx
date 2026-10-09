import { useState, useEffect, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  getPlatformSettingsPublic,
  getLogoUrl,
  applyBrandColor,
  shouldShowLogo,
} from '@/services/landing'
import type { PlatformSettings } from '@/types'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'recovery'

export default function Login() {
  const { signIn, requestPasswordReset, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [loginSettings, setLoginSettings] = useState<PlatformSettings | null>(null)

  useEffect(() => {
    getPlatformSettingsPublic()
      .then(setLoginSettings)
      .catch(() => {})
  }, [])

  useRealtime('platform_settings', () => {
    getPlatformSettingsPublic()
      .then(setLoginSettings)
      .catch(() => {})
  })

  useEffect(() => {
    if (loginSettings?.primary_color) applyBrandColor(loginSettings.primary_color)
  }, [loginSettings?.primary_color])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    const { error } = await signIn(email, password)
    if (error) {
      setFieldErrors(extractFieldErrors(error))
      toast.error(getErrorMessage(error))
    } else {
      navigate('/dashboard')
    }
    setSubmitting(false)
  }

  const handleRecovery = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    const { error } = await requestPasswordReset(email)
    if (error) {
      setFieldErrors(extractFieldErrors(error))
      toast.error(getErrorMessage(error))
    } else {
      setRecoverySent(true)
    }
    setSubmitting(false)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setFieldErrors({})
    setRecoverySent(false)
  }

  const inputClass =
    'border-foreground/15 bg-foreground/5 text-foreground placeholder:text-muted-foreground/40 h-11 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
  const goldButtonClass =
    'w-full bg-[#D4AF37] hover:bg-[#C5A030] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[#D4AF37]/30 font-semibold h-11 rounded-xl transition-all duration-200 active:scale-[0.99]'

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden text-foreground login-gradient-bg"
      style={
        loginSettings?.login_gradient && loginSettings.login_gradient.trim() !== ''
          ? { background: loginSettings.login_gradient }
          : undefined
      }
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="w-full max-w-md mx-auto lg:max-w-none lg:col-span-6 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          <Link
            to="/"
            className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80 group"
          >
            {loginSettings && shouldShowLogo(loginSettings) && getLogoUrl(loginSettings) ? (
              <img
                src={getLogoUrl(loginSettings)!}
                alt={loginSettings.company_name || 'Anderson Abreu'}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <Brain className="h-7 w-7 text-[#D4AF37]" />
                <span className="font-bold text-lg text-foreground tracking-tight">
                  {loginSettings?.company_name || 'Anderson Abreu'}
                </span>
              </div>
            )}
          </Link>

          {mode === 'recovery' && recoverySent ? (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Link de recuperação enviado com sucesso
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enviamos um link de recuperação para{' '}
                    <strong className="text-foreground">{email}</strong>. Verifique sua caixa de
                    entrada.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full text-foreground hover:bg-foreground/10"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : mode === 'recovery' ? (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Recuperar senha
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digite seu email para receber o link de recuperação
                </p>
              </div>
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-foreground text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>
                <Button type="submit" className={goldButtonClass} disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full text-foreground hover:bg-foreground/10"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Bem-vindo de volta
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Acesse sua área do aluno</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={cn(inputClass, 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-sm text-red-400">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('recovery')}
                    className="text-sm text-[#D4AF37]/90 hover:text-[#D4AF37] transition-colors font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button type="submit" className={goldButtonClass} disabled={submitting}>
                  {submitting ? 'Aguarde...' : 'Entrar'}
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center text-center p-6 lg:p-8 space-y-8">
          <Link
            to="/"
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-foreground/15 bg-foreground/10 backdrop-blur-md shadow-2xl transition-transform hover:scale-105"
          >
            {loginSettings && shouldShowLogo(loginSettings) && getLogoUrl(loginSettings) ? (
              <img
                src={getLogoUrl(loginSettings)!}
                alt="Logo"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Brain className="h-12 w-12 text-[#D4AF37]" />
            )}
          </Link>

          <div className="space-y-3 max-w-lg">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {loginSettings?.company_name || 'Anderson Abreu'}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {loginSettings?.login_text ||
                'Hipnose, inteligência emocional e mentoria de alta performance'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 w-full max-w-md">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-foreground tracking-tight">
                +{loginSettings?.stats_students ? loginSettings.stats_students : '10k'}
              </div>
              <div className="text-xs text-blue-200/70 font-medium mt-0.5">Alunos</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-foreground tracking-tight">
                +{loginSettings?.stats_courses ? loginSettings.stats_courses : '50'}
              </div>
              <div className="text-xs text-blue-200/70 font-medium mt-0.5">Cursos</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-foreground/5 border border-foreground/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-foreground tracking-tight">
                +{loginSettings?.stats_years ? `${loginSettings.stats_years} anos` : '8 anos'}
              </div>
              <div className="text-xs text-blue-200/70 font-medium mt-0.5">Experiência</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
