import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Lock, Search, Sparkles } from 'lucide-react'

const allProducts = [
  {
    id: 4,
    title: 'Formação em PNL 2.0',
    description:
      'Domine a Programação Neurolinguística para resultados extraordinários na clínica e na vida.',
    price: 'R$ 997,00',
    category: 'pnl',
    image: 'https://img.usecurling.com/p/600/800?q=brain&color=black',
    badge: 'Mais Vendido',
  },
  {
    id: 5,
    title: 'Constelação Familiar Sistêmica',
    description: 'Cure feridas ancestrais e compreenda a dinâmica oculta dos relacionamentos.',
    price: 'R$ 1.497,00',
    category: 'terapia',
    image: 'https://img.usecurling.com/p/600/800?q=family&color=gray',
    badge: 'Premium',
  },
  {
    id: 6,
    title: 'Inteligência Emocional Pro',
    description: 'Gestão de emoções avançada para líderes e terapeutas.',
    price: 'R$ 697,00',
    category: 'desenvolvimento',
    image: 'https://img.usecurling.com/p/600/800?q=emotions&color=black',
  },
  {
    id: 7,
    title: 'Hipnose de Palco e Entretenimento',
    description: 'Aprenda os segredos dos grandes shows de hipnose com segurança e ética.',
    price: 'R$ 497,00',
    category: 'hipnose',
    image: 'https://img.usecurling.com/p/600/800?q=stage&color=gray',
  },
  {
    id: 8,
    title: 'Mentoria Business para Terapeutas',
    description: 'Escale seus atendimentos e construa uma agenda lotada em 90 dias.',
    price: 'R$ 2.997,00',
    category: 'mentoria',
    image: 'https://img.usecurling.com/p/600/800?q=business&color=gold',
    badge: 'Vagas Limitadas',
  },
  {
    id: 9,
    title: 'Hipnoterapia Infantil Aplicada',
    description: 'Técnicas lúdicas e efetivas para tratamento de crianças e adolescentes.',
    price: 'R$ 897,00',
    category: 'hipnose',
    image: 'https://img.usecurling.com/p/600/800?q=children&color=purple',
  },
]

export default function Products() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos à Venda</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Expanda seus conhecimentos com nossos treinamentos exclusivos. Condições especiais para
            quem já é aluno.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-9 bg-card border-border/50 focus:border-primary"
          />
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border/50 p-1 mb-6 flex-nowrap h-auto">
          <TabsTrigger
            value="todos"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Todos os Cursos
          </TabsTrigger>
          <TabsTrigger
            value="hipnose"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Hipnose
          </TabsTrigger>
          <TabsTrigger
            value="pnl"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            PNL
          </TabsTrigger>
          <TabsTrigger
            value="terapia"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Terapias Breves
          </TabsTrigger>
          <TabsTrigger
            value="mentoria"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mentorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>
        {/* Adicione TabsContent para outras categorias filtrando o array, simplificado aqui para demonstração */}
        <TabsContent value="hipnose" className="mt-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProducts
              .filter((p) => p.category === 'hipnose')
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group relative overflow-hidden border-border/30 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:shadow-glow flex flex-col h-full">
      <div className="aspect-[3/4] overflow-hidden relative shrink-0">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
          <div className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {product.badge && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {product.badge}
          </Badge>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-10 bg-card">
        <CardTitle className="text-lg mb-2 leading-tight">{product.title}</CardTitle>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="mt-auto space-y-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through opacity-70">
              De: R${' '}
              {(
                parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.')) *
                1.5
              ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span className="font-bold text-2xl text-primary">{product.price}</span>
          </div>
          <Button className="w-full bg-white text-black hover:bg-primary hover:text-primary-foreground transition-colors group-hover:shadow-glow">
            Comprar Agora
          </Button>
        </div>
      </div>
    </Card>
  )
}
