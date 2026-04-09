import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Index from "@/pages/Index";
import OnboardingPage from "@/pages/OnboardingPage";
import PainelObraPage from "@/pages/PainelObraPage";
import ObrasPage from "@/pages/ObrasPage";
import OrcamentoPage from "@/pages/OrcamentoPage";
import CustoRealPage from "@/pages/CustoRealPage";
import CronogramaPage from "@/pages/CronogramaPage";
import DiarioPage from "@/pages/DiarioPage";
import EstoquePage from "@/pages/EstoquePage";
import PerfilPage from "@/pages/PerfilPage";
import EquipePage from "@/pages/EquipePage";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminCompaniesPage from "@/pages/admin/AdminCompaniesPage";
import AdminPlansPage from "@/pages/admin/AdminPlansPage";
import AdminAddonsPage from "@/pages/admin/AdminAddonsPage";

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <BrowserRouter>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Index />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* APP PROTEGIDO */}
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PainelObraPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/obras"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ObrasPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orcamento"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <OrcamentoPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/custo-real"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CustoRealPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cronograma"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CronogramaPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/diario"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DiarioPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/estoque"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EstoquePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PerfilPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* NOVA ROTA EQUIPE */}
            <Route
              path="/equipe"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EquipePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="addons" element={<AdminAddonsPage />} />
            </Route>

          </Routes>

          <Toaster />
        </BrowserRouter>
      </CompanyProvider>
    </AuthProvider>
  );
}
