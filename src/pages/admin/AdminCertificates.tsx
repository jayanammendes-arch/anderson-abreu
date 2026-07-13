import { useState, useEffect, useCallback } from 'react'
import { Award, Trash2, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  adminGetCertificates,
  adminDeleteCertificate,
  getCertificateFileUrl,
  type AdminCertificate,
} from '@/services/admin-certificates'

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await adminGetCertificates()
      setCertificates(data)
    } catch {
      toast.error('Falha ao carregar certificados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await adminDeleteCertificate(id)
      setCertificates((prev) => prev.filter((c) => c.id !== id))
      toast.success('Certificado excluído')
    } catch {
      toast.error('Falha ao excluir certificado')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Certificados Emitidos</h2>
        <span className="text-sm text-muted-foreground">({certificates.length})</span>
      </div>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Carga</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum certificado emitido
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => {
                  const fileUrl = getCertificateFileUrl(cert)
                  return (
                    <TableRow key={cert.id} className="border-border/50">
                      <TableCell className="font-medium text-white">
                        {cert.userName || '—'}
                      </TableCell>
                      <TableCell>{cert.courseTitle || '—'}</TableCell>
                      <TableCell>
                        {cert.issue_date
                          ? new Date(cert.issue_date).toLocaleDateString('pt-BR')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {cert.workload_at_issue ? `${cert.workload_at_issue}h` : '—'}
                      </TableCell>
                      <TableCell>
                        {fileUrl ? (
                          <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 text-primary" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(cert.id)}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
