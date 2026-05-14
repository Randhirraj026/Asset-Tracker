import { Bell, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-slate-100/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="btn-secondary !p-2 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={18} /></button>
        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="control w-full max-w-xl pl-10" placeholder="Search assets, employees, logs" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn-secondary !p-2" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="btn-secondary !p-2" aria-label="Notifications"><Bell size={18} /></button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
          <button className="btn-secondary !p-2" onClick={logout} aria-label="Logout"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}
