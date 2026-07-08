import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LifeBuoy, Mail, MessageCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Como acesso as aulas ao vivo?',
    answer:
      'Os links para as aulas ao vivo são disponibilizados no módulo correspondente dentro do curso e também enviados por e-mail 1h antes do início. Caso perca, a gravação ficará disponível em até 24h na plataforma.',
  },
  {
    question: 'Por quanto tempo tenho acesso aos cursos?',
    answer:
      'A maioria dos nossos cursos, incluindo as Formações Master, possuem acesso vitalício para os alunos. Mentoria e grupos específicos possuem prazos determinados que são informados no ato da compra.',
  },
  {
    question: 'Como funciona o sistema de pontuação e ranking?',
    answer:
      'Você ganha pontos ao assistir aulas completas (10 pts), realizar avaliações (50 pts), participar na comunidade (5 pts por post) e concluir cursos (500 pts). Os top 10 do ranking mensal recebem convites para masterclasses exclusivas.',
  },
  {
    question: 'Posso baixar as videoaulas?',
    answer:
      'As videoaulas só podem ser assistidas online através da nossa plataforma para garantir a proteção de direitos autorais. No entanto, todos os materiais complementares em PDF, planilhas e áudios de hipnose podem ser baixados livremente.',
  },
  {
    question: 'Como emito meu certificado?',
    answer:
      'Após concluir 100% das aulas e ser aprovado na avaliação final (quando aplicável), o botão "Emitir Certificado" aparecerá na página "Minhas Compras" e também na última aula do curso.',
  },
]

export default function Faq() {
  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <LifeBuoy className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Central de Ajuda</h1>
        <p className="text-muted-foreground text-lg">
          Como podemos ajudar você hoje? Encontre respostas rápidas abaixo.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 shadow-none mb-12">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                <AccordionTrigger className="text-left font-medium text-lg hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Suporte via WhatsApp</CardTitle>
            <CardDescription>Atendimento de Segunda a Sexta, das 9h às 18h.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Chamar no WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>E-mail</CardTitle>
            <CardDescription>Respondemos em até 24 horas úteis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              suporte@andersonabreu.com
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
