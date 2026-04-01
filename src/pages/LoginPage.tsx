import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HardHat, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const testUsers = [
  { email: 'gestor@teste.com', label: 'Gestor', desc: 'Acesso completo' },
  { email: 'funcionario@teste.com', label: 'Funcionário', desc: 'Acesso operacional' },
  { email: 'cliente@teste.com', label: 'Cliente', desc: 'Acompanhamento' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  const quickLogin = (testEmail: string) => {
    if (login(testEmail, '123456')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-primary text-primary-foreground p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <HardHat className="h-12 w-12" />
            <h1 className="text-4xl font-bold">ObraFácil</h1>
          </div>
          <p className="text-xl leading-relaxed opacity-90">
            Controle cronograma, orçamento, materiais e diário de obra em um só sistema.
          </p>
          <div className="pt-4 space-y-3 text-sm opacity-80">
            <p>✓ Cronograma visual com acompanhamento de etapas</p>
            <p>✓ Orçamento previsto × realizado</p>
            <p>✓ Diário de obra digital</p>
            <p>✓ Controle de estoque e materiais</p>
            <p>✓ Acesso diferenciado por perfil</p>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <HardHat className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ObraFácil</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Entrar no sistema</h2>
            <p className="text-muted-foreground text-sm mt-1">Organize sua obra em um só lugar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Entrar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Test users */}
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso rápido — usuários de teste</p>
            <div className="space-y-2">
              {testUsers.map(u => (
                <button
                  key={u.email}
                  onClick={() => quickLogin(u.email)}
                  className="w-full flex items-center justify-between p-2.5 rounded-md border border-border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.label}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Senha padrão: <span className="font-mono">123456</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
