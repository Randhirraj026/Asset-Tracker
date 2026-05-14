import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm">
      <span className="text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button className="btn-secondary !px-3" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        <button className="btn-secondary !px-3" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
