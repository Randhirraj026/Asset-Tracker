import { clsx } from 'clsx';

const styles: Record<string, string> = {
  IN_OFFICE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  OUTSIDE: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  RETURNED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  MAINTENANCE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  LOST: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  SUCCESS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  FAILURE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  IN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  OUT: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  OVERDUE: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', styles[status] || styles.RETURNED)}>
      {status.replace('_', ' ')}
    </span>
  );
}
