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
import Sobre from '@/pages/Sobre'
import TreatmentDetail from '@/pages/TreatmentDetail'
import Blog from '@/pages/Blog'
import BlogDetail from '@/pages/BlogDetail'
import Agendar from '@/pages/Agendar'
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
import PublicFaq from '@/pages/PublicFaq'
import AdminFaqs from '@/pages/admin/AdminFaqs'
import AdminSiteFaqs from '@/pages/admin/AdminSiteFaqs'
import AdminTestimonials from '@/pages/admin/AdminTestimonials'
import AdminCommunity from '@/pages/admin/AdminCommunity'
import AdminCertificates from '@/pages/admin/AdminCertificates'
import AdminContacts from '@/pages/admin/AdminContacts'
import AdminCertifications from '@/pages/admin/AdminCertifications'
import AdminAboutContent from '@/pages/admin/AdminAboutContent'
import AdminTreatments from '@/pages/admin/AdminTreatments'
import AdminTreatmentCategories from '@/pages/admin/AdminTreatmentCategories'
import AdminBlog from '@/pages/admin/AdminBlog'
import CourseDetail from '@/pages/CourseDetail'
import CourseDetailsPage from '@/pages/CourseDetailsPage'
import CursosPage from '@/pages/CursosPage'
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
            <Route path="/faq" element={<PublicFaq />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/tratamentos/:slug" element={<TreatmentDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/agendar" element={<Agendar />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/cursos/:courseId" element={<CourseDetailsPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="cursos" element={<AdminCourses />} />
              <Route path="cursos/novo" element={<AdminCourseForm />} />
              <Route path="cursos/:courseId" element={<AdminCourseForm />} />
              <Route path="tratamentos" element={<AdminTreatments />} />
              <Route path="categorias-tratamentos" element={<AdminTreatmentCategories />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="alunos" element={<AdminStudents />} />
              <Route path="liberacoes" element={<AdminAccessReleases />} />
              <Route path="configuracoes" element={<AdminConfigHub />} />
              <Route path="paginas" element={<AdminPageConfig />} />
              <Route path="depoimentos" element={<AdminTestimonials />} />
              <Route path="agenda" element={<AdminAgenda />} />
              <Route path="faqs" element={<AdminFaqs />} />
              <Route path="site-faqs" element={<AdminSiteFaqs />} />
              <Route path="comunidade" element={<AdminCommunity />} />
              <Route path="certificados" element={<AdminCertificates />} />
              <Route path="contatos" element={<AdminContacts />} />
              <Route path="certificacoes" element={<AdminCertifications />} />
              <Route path="sobre-conteudo" element={<AdminAboutContent />} />
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
