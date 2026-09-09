import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Administrator';
  const initials = displayName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex h-[73px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-sm font-black text-white shadow-sm">U</div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">Unihub<span className="text-primary-600">.lk</span></h1>
              <p className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:block">Administration</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800" aria-label="Notifications">
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-500 ring-2 ring-white" />
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
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
