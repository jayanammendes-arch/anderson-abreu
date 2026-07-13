import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCertificates, downloadCertificatePdf } from '@/services/certificates'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Download, Loader2, Clock, CalendarDays } from 'lucide-react'
import type { Certificate } from '@/types'

export default function Certificates() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  const loadCertificates = useCallback(async () => {
    if (!user) return
    try {
      const data = await getCertificates(user.id)
      setCertificates(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCertificates()
  }, [loadCertificates])

  useRealtime('certificates', () => loadCertificates())

  const handleDownload = async (id: string) => {
    setDownloading(id)
    try {
      await downloadCertificatePdf(id)
    } catch {
      /* ignore */
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>
        <p className="mt-2 text-muted-foreground">
          Seus certificados de conclusão de cursos aparecerão aqui.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Award className="h-10 w-10 text-gold" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Nenhum certificado ainda</h2>
            <p className="max-w-md text-muted-foreground">
              Você ainda não concluiu nenhum curso. Continue estudando para ganhar seu certificado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => {
            const course = cert.expand?.course
            return (
              <Card key={cert.id} className="overflow-hidden border-border/50 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{course?.title || 'Curso'}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {cert.workload_at_issue} horas
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(cert.issue_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(cert.id)}
                        disabled={downloading === cert.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {downloading === cert.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Baixar PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
