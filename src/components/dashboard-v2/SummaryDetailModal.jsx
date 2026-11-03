import { useEffect } from "react";
import { X } from "lucide-react";

// Modal umum untuk menampilkan detail dari kartu summary V2
export default function SummaryDetailModal({ open, title, subtitle, icon: Icon, count, onClose, footer, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-custom-merah via-rose-500 to-custom-merah-terang" />

        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-custom-merah-terang dark:bg-red-500/10">
                <Icon size={18} />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 truncate text-base font-black text-gray-900 dark:text-white">
                {title}
                {count !== undefined && (
                  <span className="rounded-full bg-custom-merah-terang px-2 py-0.5 text-xs font-bold text-white">
                    {count}
                  </span>
                )}
              </h2>
              {subtitle && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-custom-merah-terang hover:text-custom-merah-terang dark:border-gray-700 dark:text-gray-400"
          >
            <X size={16} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
