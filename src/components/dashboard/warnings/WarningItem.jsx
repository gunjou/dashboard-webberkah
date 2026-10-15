import { formatCurrency, formatDate } from "../../../utils/helper";

const WarningItem = ({ item, activeWarningTab }) => {
  const isExpired = activeWarningTab === "EXPIRED";
  const isInvoice = item.warning_type === "INVOICE";

  const days = Number(item.days_to_deadline ?? 0);

  const deadlineText =
    days < 0
      ? `Terlambat ${Math.abs(days)} hari`
      : days === 0
        ? "Jatuh tempo hari ini"
        : `${days} hari lagi`;

  const progress = Math.min(
    100,
    Math.max(0, Number(item.progress_percent) || 0),
  );

  return (
    <article
      className={`min-w-0  min-h-[200px] max-h-[200px] rounded-xl border p-3 transition ${
        isExpired
          ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/10"
          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/10"
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded-md px-1.5 py-1 text-[9px] font-black uppercase tracking-wide ${
              isInvoice
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
            }`}
          >
            {isInvoice ? "Invoice" : "Pekerjaan"}
          </span>
          <h3 className="mt-2 line-clamp-1 text-xs font-bold leading-5 text-gray-900 dark:text-white sm:text-sm">
            {item.work_name || "Pekerjaan tanpa nama"}
          </h3>
          <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
            {item.work_number || "-"}
            {item.client_name ? ` · ${item.client_name}` : ""}
            {item.client_pic_name ? ` · Pak ${item.client_pic_name}` : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-md px-1.5 py-1 text-right text-[9px] font-bold ${
            isExpired
              ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
          }`}
        >
          {deadlineText}
        </span>
      </div>

      {isInvoice && (
        <div className="mt-3 rounded-lg bg-white/80 p-2.5 dark:bg-gray-900/70">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {item.invoice_number || "Invoice"}
            </span>

            <span className="text-right text-xs font-bold text-gray-800 dark:text-gray-200">
              {formatCurrency(item.outstanding_amount)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              Jatuh tempo
            </span>

            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
              {formatDate(item.deadline_date)}
            </span>
          </div>
        </div>
      )}

      {!isInvoice && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-200/70 pt-2 dark:border-gray-700/70">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Tenggat pekerjaan
          </span>

          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
            {formatDate(item.deadline_date)}
          </span>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Progres
          </span>

          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
            {progress}%
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isExpired ? "bg-red-500" : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </article>
  );
};

export default WarningItem;
