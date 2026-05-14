import Modal from './Modal';

export default function ConfirmDialog({ open, title, description, onCancel, onConfirm }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}
