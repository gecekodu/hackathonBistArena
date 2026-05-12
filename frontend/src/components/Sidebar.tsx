import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Briefcase,
  Trophy,
  Brain,
  Bitcoin,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

export type NavPage = 'dashboard' | 'trade' | 'crypto' | 'market' | 'portfolio' | 'leaderboard' | 'coach';

type SidebarProps = {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
};

type NavItem = {
  id: NavPage;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Genel Bakış', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { id: 'trade', label: 'İşlem Yap', icon: <ArrowLeftRight className="h-[18px] w-[18px]" /> },
  { id: 'crypto', label: 'Kripto', icon: <Bitcoin className="h-[18px] w-[18px]" /> },
  { id: 'market', label: 'Piyasa', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { id: 'portfolio', label: 'Portföy', icon: <Briefcase className="h-[18px] w-[18px]" /> },
  { id: 'leaderboard', label: 'Liderlik', icon: <Trophy className="h-[18px] w-[18px]" /> },
  { id: 'coach', label: 'AI Koç', icon: <Brain className="h-[18px] w-[18px]" /> },
];

export function Sidebar({ activePage, onNavigate, mobileOpen, onMobileToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={onMobileToggle}
        className="fixed top-4 left-4 z-50 lg:hidden arena-btn arena-btn-ghost !p-2.5 !rounded-xl bg-white shadow-card"
        aria-label="Menü"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-sm"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: '#1e293b' }}
        className={`fixed top-0 left-0 z-40 h-full w-[260px] shadow-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
              }}
              className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-4 pb-6 space-y-2">
          <div className="border-t border-white/10 pt-4 mb-2" />
          <button className="sidebar-link">
            <Settings className="h-[18px] w-[18px]" />
            <span>Ayarlar</span>
          </button>
          <div className="mt-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-xs text-slate-400">Platform Durumu</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-sm font-medium text-emerald-400">Aktif</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
