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
import { GoogleIcon } from '@/components/SocialIcons'
import {
  getPlatformSettingsPublic,
  getLogoUrl,
  getLoginImageUrl,
  applyBrandColor,
  shouldShowLogo,
} from '@/services/landing'
import type { PlatformSettings } from '@/types'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'signup' | 'recovery'

export default function Login() {
  const { signIn, signUp, signInWithOAuth, requestPasswordReset, isAuthenticated, loading } =
    useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [instagram, setInstagram] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
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
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleOAuth = async (provider: 'google') => {
    setOauthLoading(provider)
    setFieldErrors({})
    const { error } = await signInWithOAuth(provider)
    if (error) {
      toast.error(getErrorMessage(error))
    } else {
      navigate('/dashboard')
    }
    setOauthLoading(null)
  }

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

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'As senhas não coincidem' })
      return
    }
    setSubmitting(true)
    setFieldErrors({})
    const { error } = await signUp(name, email, password, phone, birthDate, instagram)
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden text-white royal-gradient-bg">
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Form Card */}
        <div className="w-full max-w-md mx-auto lg:max-w-none lg:col-span-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          <Link
            to="/"
            className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80 group"
          >
            <div></div>
          </Link>

          {mode === 'recovery' && recoverySent ? (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Link de recuperação enviado com sucesso
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enviamos um link de recuperação para{' '}
                    <strong className="text-white">{email}</strong>. Verifique sua caixa de entrada.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : mode === 'recovery' ? (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Recuperar senha</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digite seu email para receber o link de recuperação
                </p>
              </div>
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-white text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[hsl(224,76%,25%)] hover:bg-[hsl(224,76%,32%)] text-white shadow-[0_0_15px_rgba(14,37,117,0.5)] border border-blue-400/20 font-semibold h-11 rounded-xl transition-all duration-200"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in space-y-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao início
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'login'
                    ? 'Acesse sua área do aluno'
                    : 'Comece sua jornada de aprendizado'}
                </p>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm font-medium">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                    {fieldErrors.name && <p className="text-sm text-red-400">{fieldErrors.name}</p>}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white text-sm font-medium">
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                      {fieldErrors.phone && (
                        <p className="text-sm text-red-400">{fieldErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-white text-sm font-medium">
                        Data de Nascimento *
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                      {fieldErrors.birth_date && (
                        <p className="text-sm text-red-400">{fieldErrors.birth_date}</p>
                      )}
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-white text-sm font-medium">
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="@seuusuario"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-sm font-medium">
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
                      className="border-white/15 bg-white/5 pr-10 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-sm text-red-400">{fieldErrors.password}</p>
                  )}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/30 h-11 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-400">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('recovery')}
                      className="text-sm text-blue-300 hover:text-white transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[hsl(224,76%,25%)] hover:bg-[hsl(224,76%,32%)] text-white shadow-[0_0_15px_rgba(14,37,117,0.5)] border border-blue-400/20 font-semibold h-11 rounded-xl transition-all duration-200 active:scale-[0.99]"
                  disabled={submitting}
                >
                  {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-3 text-white/50 font-medium">ou</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white h-11 rounded-xl font-medium transition-all"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-400" />
                ) : (
                  <GoogleIcon className="mr-2" />
                )}
                Entrar com Google
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-medium text-blue-300 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  {mode === 'login' ? 'Criar conta' : 'Entrar'}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Right Info Section (Seamlessly blended over the continuous gradient) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center text-center p-6 lg:p-8 space-y-8">
          <Link
            to="/"
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl transition-transform hover:scale-105"
          >
            {loginSettings && shouldShowLogo(loginSettings) && getLogoUrl(loginSettings) ? (
              <img
                src={getLogoUrl(loginSettings)!}
                alt="Logo"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Brain className="h-12 w-12 text-blue-300" />
            )}
          </Link>

          <div className="space-y-3 max-w-lg">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {loginSettings?.company_name || 'Anderson Abreu'}
            </h2>
            <p className="text-base text-blue-100/70 leading-relaxed">
              {loginSettings?.login_text ||
                'Hipnose, inteligência emocional e mentoria de alta performance'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 w-full max-w-md">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-white tracking-tight">
                +{loginSettings?.stats_students ? loginSettings.stats_students : '10k'}
              </div>
              <div className="text-xs text-blue-200/70 font-medium mt-0.5">Alunos</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-white tracking-tight">
                +{loginSettings?.stats_courses ? loginSettings.stats_courses : '50'}
              </div>
              <div className="text-xs text-blue-200/70 font-medium mt-0.5">Cursos</div>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
              <div className="text-2xl font-bold text-white tracking-tight">
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
