import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ThemeProvider } from '@/hooks/use-theme'
import { DashboardLayout } from '@/components/DashboardLayout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Landing from '@/pages/Landing'
import { AdminLayout } from '@/components/AdminLayout'
import AdminCourses from '@/pages/admin/AdminCourses'
import AdminCourseForm from '@/pages/admin/AdminCourseForm'
import AdminStudents from '@/pages/admin/AdminStudents'
import AdminAccessReleases from '@/pages/admin/AdminAccessReleases'

import AdminConfigHub from '@/pages/admin/AdminConfigHub'
import AdminPageConfig from '@/pages/admin/AdminPageConfig'
import AdminAgenda from '@/pages/admin/AdminAgenda'
import Products from '@/pages/Products'
import Purchases from '@/pages/Purchases'
import Community from '@/pages/Community'
import Faq from '@/pages/Faq'
import AdminFaqs from '@/pages/admin/AdminFaqs'
import AdminTestimonials from '@/pages/admin/AdminTestimonials'
import CourseDetail from '@/pages/CourseDetail'
import CourseDetailsPage from '@/pages/CourseDetailsPage'
import Profile from '@/pages/Profile'
import Certificates from '@/pages/Certificates'
import NotFound from '@/pages/NotFound'

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cursos/:courseId" element={<CourseDetailsPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="cursos" element={<AdminCourses />} />
              <Route path="cursos/novo" element={<AdminCourseForm />} />
              <Route path="cursos/:courseId" element={<AdminCourseForm />} />
              <Route path="alunos" element={<AdminStudents />} />
              <Route path="liberacoes" element={<AdminAccessReleases />} />
              <Route path="configuracoes" element={<AdminConfigHub />} />
              <Route path="paginas" element={<AdminPageConfig />} />

              <Route path="depoimentos" element={<AdminTestimonials />} />
              <Route path="agenda" element={<AdminAgenda />} />
              <Route path="faqs" element={<AdminFaqs />} />
            </Route>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Index />} />
              <Route path="produtos" element={<Products />} />
              <Route path="compras" element={<Purchases />} />
              <Route path="comunidade" element={<Community />} />
              <Route path="faq" element={<Faq />} />
              <Route path="profile" element={<Profile />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="curso/:courseId" element={<CourseDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
)

export default App
