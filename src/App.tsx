import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ObrasProvider } from "@/contexts/ObrasContext";
import { OrcamentoProvider } from "@/contexts/OrcamentoContext";
import { EstoqueProvider } from "@/contexts/EstoqueContext";
import { CustoRealProvider } from "@/contexts/CustoRealContext";
import { ObraSelectionProvider } from "@/contexts/ObraSelectionContext";
import { CompanyProvider, useCompany } from "@/contexts/CompanyContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";

import ObrasPage from "@/pages/ObrasPage";
import ObraDetalhePage from "@/pages/ObraDetalhePage";
import OrcamentoPage from "@/pages/OrcamentoPage";
import CustoRealPage from "@/pages/CustoRealPage";
import CronogramaPage from "@/pages/CronogramaPage";
import DiarioPage from "@/pages/DiarioPage";
import EstoquePage from "@/pages/EstoquePage";
import PainelObraPage from "@/pages/PainelObraPage";
import EquipePage from "@/pages/EquipePage";
import PerfilPage from "@/pages/PerfilPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminCompaniesPage from "@/pages/admin/AdminCompaniesPage";
import AdminPlansPage from "@/pages/admin/AdminPlansPage";
import AdminAddonsPage from "@/pages/admin/AdminAddonsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { needsOnboarding, loading: companyLoading } = useCompany();

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding && user?.role !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/painel" replace />;
  }

  return <LoginPage />;
}

function OnboardingRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const { needsOnboarding, loading: companyLoading } = useCompany();

  if (loading || companyLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!needsOnboarding) return <Navigate to="/painel" replace />;

  return <OnboardingPage />;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CompanyProvider>
            <ObrasProvider>
              <OrcamentoProvider>
                <EstoqueProvider>
                  <CustoRealProvider>
                    <ObraSelectionProvider>{children}</ObraSelectionProvider>
                  </CustoRealProvider>
                </EstoqueProvider>
              </OrcamentoProvider>
            </ObrasProvider>
          </CompanyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/painel" element={<ProtectedRoute><PainelObraPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PainelObraPage /></ProtectedRoute>} />
        <Route path="/obras" element={<ProtectedRoute><ObrasPage /></ProtectedRoute>} />
        <Route path="/obras/:id" element={<ProtectedRoute><ObraDetalhePage /></ProtectedRoute>} />
        <Route path="/orcamento" element={<ProtectedRoute><OrcamentoPage /></ProtectedRoute>} />
        <Route path="/custo-real" element={<ProtectedRoute><CustoRealPage /></ProtectedRoute>} />
        <Route path="/cronograma" element={<ProtectedRoute><CronogramaPage /></ProtectedRoute>} />
        <Route path="/diario" element={<ProtectedRoute><DiarioPage /></ProtectedRoute>} />
        <Route path="/estoque" element={<ProtectedRoute><EstoquePage /></ProtectedRoute>} />
        <Route path="/equipe" element={<ProtectedRoute><EquipePage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/companies" replace />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="addons" element={<AdminAddonsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
