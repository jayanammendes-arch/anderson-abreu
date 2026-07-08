import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/DashboardLayout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Landing from '@/pages/Landing'
import { AdminLayout } from '@/components/AdminLayout'
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminCourseForm from '@/pages/admin/AdminCourseForm'
import AdminStudents from '@/pages/admin/AdminStudents'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminAgenda from '@/pages/admin/AdminAgenda'
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
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="cursos" element={<AdminCourses />} />
            <Route path="cursos/novo" element={<AdminCourseForm />} />
            <Route path="cursos/:courseId" element={<AdminCourseForm />} />
            <Route path="alunos" element={<AdminStudents />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="agenda" element={<AdminAgenda />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
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
