import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Building2, DollarSign, CalendarDays,
  BookOpen, Package, BarChart3, User, LogOut, Menu, X, HardHat
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const gestorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário de Obra', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const funcionarioLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário de Obra', icon: BookOpen },
  { to: '/estoque', label: 'Estoque', icon: Package },
];

const clienteLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: Building2 },
  { to: '/orcamento', label: 'Orçamento', icon: DollarSign },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/diario', label: 'Diário de Obra', icon: BookOpen },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const roleLabels = { gestor: 'Gestor', funcionario: 'Funcionário', cliente: 'Cliente' };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links = user.role === 'gestor' ? gestorLinks : user.role === 'funcionario' ? funcionarioLinks : clienteLinks;

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

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-sidebar-primary" />
          <span className="text-base font-bold text-sidebar-primary-foreground">ObraFácil</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground p-1">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-sidebar border-b border-sidebar-border shadow-lg" onClick={e => e.stopPropagation()}>
            <nav className="py-2 px-3 space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.to
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <Link
                to="/perfil"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <User className="h-5 w-5" />
                Perfil
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent w-full"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
