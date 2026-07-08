import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Products from '@/pages/Products'
import Purchases from '@/pages/Purchases'
import Ranking from '@/pages/Ranking'
import Faq from '@/pages/Faq'
import CourseDetail from '@/pages/CourseDetail'
import NotFound from '@/pages/NotFound'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Index />} />
            <Route path="produtos" element={<Products />} />
            <Route path="compras" element={<Purchases />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="faq" element={<Faq />} />
            <Route path="curso/:courseId" element={<CourseDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
