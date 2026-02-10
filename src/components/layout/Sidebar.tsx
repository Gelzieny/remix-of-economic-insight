import { BarChart3, Newspaper, Moon, Sun, LogOut, Menu, X, User, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardSettingsDialog } from '@/components/dashboard/DashboardSettingsDialog';

const navItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: Newspaper, label: 'Notícias', path: '/noticias' },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const displayName = profile.display_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitials = displayName.slice(0, 2).toUpperCase();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Economic Insights
          </span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-10 w-10 text-sidebar-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              'min-h-[44px]' // Touch-friendly minimum height
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 px-3 py-2 min-h-[44px]">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-sidebar-foreground/70" />
            ) : (
              <Sun className="h-4 w-4 text-sidebar-foreground/70" />
            )}
            <span className="text-sm text-sidebar-foreground/70">
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Alternar tema"
          />
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px]">
          <Avatar className="h-9 w-9 flex-shrink-0">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="Avatar" />
            ) : null}
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Meu Perfil */}
        <NavLink
          to="/perfil"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            'min-h-[44px]'
          )}
          activeClassName="bg-sidebar-accent text-sidebar-primary"
        >
          <User className="h-5 w-5 flex-shrink-0" />
          Meu Perfil
        </NavLink>

        {/* Configurações */}
        <DashboardSettingsDialog />

        <Separator className="bg-sidebar-border/50" />

        {/* Sair */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-3 min-h-[44px] text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Sair da Conta
        </Button>
      </div>
    </>
  );

  // Mobile: hamburger button + overlay sheet
  if (isMobile) {
    return (
      <>
        {/* Fixed top bar with hamburger */}
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-semibold text-foreground">
              Economic Insights
            </span>
          </div>
        </header>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Slide-in sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-[60] flex h-screen w-[280px] max-w-[85vw] flex-col bg-sidebar transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {sidebarContent}
    </aside>
  );
}
