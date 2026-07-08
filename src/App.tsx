import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DashboardLayout } from './components/DashboardLayout'
import Index from './pages/Index'
import Login from './pages/Login'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import Ranking from './pages/Ranking'
import Faq from './pages/Faq'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public / Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Index />} />
          <Route path="produtos" element={<Products />} />
          <Route path="compras" element={<Purchases />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="faq" element={<Faq />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
