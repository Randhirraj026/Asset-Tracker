import { Bell, KeyRound, Moon, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold md:text-3xl">Settings</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Profile, password, notifications, and visual preferences.</p></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel rounded-2xl p-6"><div className="mb-4 flex items-center gap-3"><UserRound className="text-blue-600" /><h2 className="text-lg font-bold">Profile Settings</h2></div><div className="grid gap-4 md:grid-cols-2"><input className="control" defaultValue="Asset Admin" /><input className="control" defaultValue="admin@company.com" /><input className="control md:col-span-2" defaultValue="Administrator" /></div></section>
        <section className="glass-panel rounded-2xl p-6"><div className="mb-4 flex items-center gap-3"><KeyRound className="text-blue-600" /><h2 className="text-lg font-bold">Password Change</h2></div><div className="grid gap-4"><input className="control" type="password" placeholder="Current password" /><input className="control" type="password" placeholder="New password" /><button className="btn-primary w-fit">Update Password</button></div></section>
        <section className="glass-panel rounded-2xl p-6"><div className="mb-4 flex items-center gap-3"><Bell className="text-blue-600" /><h2 className="text-lg font-bold">Notifications</h2></div><div className="space-y-3 text-sm"><label className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">Overdue alerts<input type="checkbox" defaultChecked /></label><label className="flex items-center justify-between rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">Daily scan digest<input type="checkbox" defaultChecked /></label></div></section>
        <section className="glass-panel rounded-2xl p-6"><div className="mb-4 flex items-center gap-3"><Moon className="text-blue-600" /><h2 className="text-lg font-bold">Theme</h2></div><button className="btn-secondary" onClick={toggleTheme}>Current: {theme === 'dark' ? 'Dark' : 'Light'}</button></section>
      </div>
    </div>
  );
}
