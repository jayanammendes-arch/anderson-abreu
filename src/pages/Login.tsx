import { useState, useEffect, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
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
    const { error } = await signUp(name, email, password)
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
    <div className="flex min-h-screen bg-black">
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:max-w-xl lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Anderson Abreu</h1>
              <p className="text-sm text-muted-foreground">Área do Aluno</p>
            </div>
          </Link>

          {mode === 'recovery' && recoverySent ? (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
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
                className="w-full text-white hover:bg-white/5"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : mode === 'recovery' ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recuperar senha</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digite seu email para receber o link de recuperação
                </p>
              </div>
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
                </Button>
              </form>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/5"
                onClick={() => switchMode('login')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
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
                    <Label htmlFor="name" className="text-white">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                    />
                    {fieldErrors.name && <p className="text-sm text-red-400">{fieldErrors.name}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                  {fieldErrors.email && <p className="text-sm text-red-400">{fieldErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
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
                      className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
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
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
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
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={submitting}
                >
                  {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2" />
                )}
                Entrar com Google
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-medium text-primary hover:text-primary/80"
                >
                  {mode === 'login' ? 'Criar conta' : 'Entrar'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          'relative hidden items-center justify-center overflow-hidden lg:flex lg:flex-1',
          !loginSettings?.login_gradient && 'bg-gradient-to-b from-blue-900 via-blue-950 to-black',
        )}
        style={
          loginSettings?.login_gradient
            ? { backgroundImage: loginSettings.login_gradient }
            : loginSettings && getLoginImageUrl(loginSettings)
              ? {
                  backgroundImage: `url(${getLoginImageUrl(loginSettings)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
        }
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-black/60" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <Link
            to="/"
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-opacity hover:opacity-80"
          >
            {loginSettings && getLogoUrl(loginSettings) ? (
              <img
                src={getLogoUrl(loginSettings)!}
                alt="Logo"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Brain className="h-12 w-12 text-white" />
            )}
          </Link>
          <Link to="/" className="space-y-3 transition-opacity hover:opacity-80">
            <h2 className="text-3xl font-bold text-white">
              {loginSettings?.company_name || 'Anderson Abreu'}
            </h2>
            <p className="max-w-md text-lg text-white/60">
              {loginSettings?.login_text ||
                'Hipnose, inteligência emocional e mentoria de alta performance'}
            </p>
          </Link>
          <div className="flex gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">+10k</div>
              <div className="text-sm text-white/50">Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">+50</div>
              <div className="text-sm text-white/50">Cursos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">+8 anos</div>
              <div className="text-sm text-white/50">Experiência</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
