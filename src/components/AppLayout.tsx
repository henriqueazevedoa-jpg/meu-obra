import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, DollarSign, CalendarDays,
  BookOpen, Package, User, LogOut, Menu, X, HardHat, Receipt, Shield, Users
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const gestorLinks = [
  { to: '/painel', label: 'Painel da Obra', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/custo-real', label: 'Custo Real', icon: Receipt },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/equipe', label: 'Equipe', icon: Users },
];

const funcionarioLinks = [
  { to: '/painel', label: 'Painel da Obra', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
];

const clienteLinks = [
  { to: '/painel', label: 'Painel da Obra', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/custo-real', label: 'Custo Real', icon: Receipt },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário', icon: BookOpen },
];

// Bottom tab bar: show most-used items for field work
const mobileGestorTabs = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/_more', label: 'Mais', icon: Menu },
];

const mobileFuncionarioTabs = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/_more', label: 'Mais', icon: Menu },
];

const mobileClienteTabs = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/_more', label: 'Mais', icon: Menu },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Plataforma', icon: Shield },
  { to: '/painel', label: 'Painel da Obra', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/custo-real', label: 'Custo Real', icon: Receipt },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/equipe', label: 'Equipe', icon: Users },
];

const roleLabels: Record<string, string> = { admin: 'Admin', gestor: 'Gestor', funcionario: 'Funcionário', cliente: 'Cliente' };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : user.role === 'gestor' ? gestorLinks : user.role === 'funcionario' ? funcionarioLinks : clienteLinks;
  const mobileTabs = user.role === 'gestor' ? mobileGestorTabs : user.role === 'funcionario' ? mobileFuncionarioTabs : mobileClienteTabs;
  const mobileTabRoutes = mobileTabs.filter(t => t.to !== '/_more').map(t => t.to);
  const moreLinks = links.filter(l => !mobileTabRoutes.includes(l.to));

  const isActiveRoute = (to: string) => {
    if (to === '/_more') return moreLinks.some(l => location.pathname === l.to) || moreMenuOpen;
    return location.pathname === to;
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border">
          <HardHat className="h-7 w-7 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-primary-foreground">ObraFácil</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.to
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Link to="/perfil" className="flex items-center gap-3 mb-3 px-2 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[user.role]}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-sidebar z-30 flex items-center justify-between px-4 safe-area-top print:hidden" data-print-hide>
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-sidebar-primary" />
          <span className="text-sm font-bold text-sidebar-primary-foreground">ObraFácil</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/perfil" className="text-sidebar-foreground p-1">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Mobile "More" overlay */}
      {moreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-foreground/50" onClick={() => setMoreMenuOpen(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-2" />
            <nav className="py-2 px-4 space-y-1">
              {moreLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMoreMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <Link
                to="/perfil"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-foreground hover:bg-muted"
              >
                <User className="h-5 w-5" />
                Perfil
              </Link>
              <button
                onClick={() => { logout(); setMoreMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
            <div className="h-4" />
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {mobileTabs.map(tab => {
            const active = isActiveRoute(tab.to);
            if (tab.to === '/_more') {
              return (
                <button
                  key={tab.to}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => setMoreMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-12 pb-16 lg:pt-0 lg:pb-0 min-h-screen">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
