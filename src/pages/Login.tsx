import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Form Area */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-[400px] space-y-8 animate-fade-in-up">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Anderson Abreu</h1>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Acesse sua conta</h2>
            <p className="text-sm text-muted-foreground">
              Entre para continuar sua jornada de desenvolvimento.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="seu.email@exemplo.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                className="bg-card/50 border-white/10 focus:border-primary transition-colors h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-card/50 border-white/10 focus:border-primary transition-colors h-12"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-md font-semibold mt-2 shadow-glow hover:shadow-glow-strong transition-all duration-300"
            >
              Entrar
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 bg-card/30 border-white/10 hover:bg-card/80 transition-colors"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-card/30 border-white/10 hover:bg-card/80 transition-colors"
            >
              <AppleIcon className="mr-2 h-5 w-5 fill-current" />
              Apple
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-6">
            Ainda não é aluno?{' '}
            <a href="#" className="font-semibold text-primary hover:underline">
              Conheça os cursos
            </a>
          </p>
        </div>
      </div>

      {/* Visual Area */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-brand relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/i?q=brain&color=solid-black&shape=outline')] bg-center bg-no-repeat bg-contain opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10"></div>

        <div className="relative z-20 flex flex-col items-center animate-float">
          <div className="h-32 w-32 rounded-3xl bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-glow-strong mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            <span className="text-primary font-bold text-6xl relative z-10">A</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 text-center px-12">
            Transforme sua mente.
            <br />
            <span className="text-gradient-gold">Desperte seu potencial.</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            A maior plataforma de desenvolvimento humano focada em Hipnose, PNL e Inteligência
            Emocional.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 384 512" {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}
