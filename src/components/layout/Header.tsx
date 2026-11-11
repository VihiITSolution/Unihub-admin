import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminNotificationBell from '@/components/notifications/AdminNotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarOpen, menuButtonRef }) => {
  const { user } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Administrator';
  const initials = displayName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex h-[73px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <button ref={menuButtonRef} type="button" onClick={onMenuClick} className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"} aria-expanded={isSidebarOpen} aria-controls="admin-navigation">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-sm font-black text-white shadow-sm">U</div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">Unihub<span className="text-primary-600">.lk</span></h1>
              <p className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:block">Administration</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0 sm:gap-4">
          <ThemeToggle />
          <AdminNotificationBell />
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{initials || 'A'}</div>
            <div className="hidden sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-slate-700">{displayName}</p>
              <p className="text-xs text-slate-400">Admin account</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
