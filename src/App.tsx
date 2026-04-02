import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ObrasProvider } from "@/contexts/ObrasContext";
import { OrcamentoProvider } from "@/contexts/OrcamentoContext";
import { EstoqueProvider } from "@/contexts/EstoqueContext";
import { ObraSelectionProvider } from "@/contexts/ObraSelectionContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ObrasPage from "@/pages/ObrasPage";
import ObraDetalhePage from "@/pages/ObraDetalhePage";
import OrcamentoPage from "@/pages/OrcamentoPage";
import CronogramaPage from "@/pages/CronogramaPage";
import DiarioPage from "@/pages/DiarioPage";
import EstoquePage from "@/pages/EstoquePage";
import RelatoriosPage from "@/pages/RelatoriosPage";
import PerfilPage from "@/pages/PerfilPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ObrasProvider>
            <OrcamentoProvider>
              <EstoqueProvider>
                <ObraSelectionProvider>{children}</ObraSelectionProvider>
              </EstoqueProvider>
            </OrcamentoProvider>
          </ObrasProvider>
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
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/obras" element={<ProtectedRoute><ObrasPage /></ProtectedRoute>} />
        <Route path="/obras/:id" element={<ProtectedRoute><ObraDetalhePage /></ProtectedRoute>} />
        <Route path="/orcamento" element={<ProtectedRoute><OrcamentoPage /></ProtectedRoute>} />
        <Route path="/cronograma" element={<ProtectedRoute><CronogramaPage /></ProtectedRoute>} />
        <Route path="/diario" element={<ProtectedRoute><DiarioPage /></ProtectedRoute>} />
        <Route path="/estoque" element={<ProtectedRoute><EstoquePage /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
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
