import { FiX, FiFileText, FiCalendar, FiInbox } from "react-icons/fi";
import { formatCurrency } from "../../utils/helper";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDocumentNumber = (item, category) => {
  if (category === "contract") {
    return item.contract_number || item.work_number || "-";
  }

  return item.invoice_number || item.work_number || "-";
};

const getAmount = (item, category) => {
  switch (category) {
    case "contract":
      return item.total_contract_value ?? item.contract_value ?? 0;
    case "unbilled":
      return (
        item.total_value ??
        item.total_contract_value ??
        item.contract_value ??
        0
      );
    case "unpaid":
      return item.outstanding_amount ?? item.total_invoice ?? 0;
    case "paid":
      return item.total_received ?? item.total_invoice ?? 0;
    default:
      return 0;
  }
};

const getDate = (item, category) => {
  switch (category) {
    case "contract":
      return item.contract_date;
    case "unbilled":
      return item.deadline_date || item.target_end_date;
    case "unpaid":
      return item.due_date;
    case "paid":
      return item.invoice_date;
    default:
      return null;
  }
};

const getDateLabel = (category) => {
  switch (category) {
    case "contract":
      return "Tanggal kontrak";
    case "unbilled":
      return "Target penagihan";
    case "unpaid":
      return "Jatuh tempo";
    case "paid":
      return "Tanggal invoice";
    default:
      return "Tanggal";
  }
};

const ModalFinancialItems = ({
  isOpen,
  onClose,
  title,
  category,
  items = [],
  total = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="financial-modal-title"
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl bg-[#8A5F41]/10 p-2.5 text-[#8A5F41]">
              <FiFileText size={18} />
            </span>

            <div className="min-w-0">
              <h2
                id="financial-modal-title"
                className="truncate text-sm font-bold text-gray-800 dark:text-gray-100 sm:text-base"
              >
                {title}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {items.length} data pekerjaan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <FiX size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          {items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <span className="mb-3 rounded-full bg-gray-100 p-4 text-gray-400 dark:bg-gray-800">
                <FiInbox size={24} />
              </span>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Belum ada data
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Tidak ada pekerjaan pada kategori ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const amount = getAmount(item, category);
                const date = getDate(item, category);

                return (
                  <div
                    key={
                      item.id_contract ??
                      item.id_invoice ??
                      item.id_work_item ??
                      index
                    }
                    className="rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-100">
                          {item.work_name || "Nama pekerjaan tidak tersedia"}
                        </h3>

                        <p className="mt-1 break-words text-xs text-gray-500">
                          {getDocumentNumber(item, category)}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Klien: {item.client_name || "-"}
                        </p>
                      </div>

                      <div className="sm:min-w-[160px] sm:text-right">
                        <p className="text-[10px] text-gray-400">
                          {category === "unpaid"
                            ? "Sisa tagihan"
                            : category === "paid"
                              ? "Diterima"
                              : category === "contract"
                                ? "Nilai kontrak"
                                : "Nilai"}
                        </p>
                        <p className="mt-1 break-words text-base font-bold text-gray-800 dark:text-gray-100">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.work_type && (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item.work_type}
                          </span>
                        )}

                        {item.current_stage && (
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            {item.current_stage}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <FiCalendar size={12} />
                        <span>
                          {getDateLabel(category)}: {formatDate(date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg bg-custom-merah-terang px-4 py-2 text-xs font-semibold text-white transition hover:bg-custom-merah"
          >
            Tutup
          </button>

          <div className="min-w-0">
            <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
              Total {items.length} data
            </p>
            <p className="mt-0.5 break-words text-sm font-bold text-gray-800 dark:text-gray-100 sm:text-base">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalFinancialItems;
