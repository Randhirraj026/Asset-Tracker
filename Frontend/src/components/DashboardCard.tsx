import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

export default function DashboardCard({ title, value, trend, icon: Icon }: DashboardCardProps) {
  return (
    <motion.div whileHover={{ y: -3 }} className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-bold">{value}</h3>
        </div>
        <span className="rounded-2xl bg-blue-600/10 p-3 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">{trend}</p>
    </motion.div>
  );
}
