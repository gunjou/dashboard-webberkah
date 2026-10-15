import { useEffect } from "react";
import {
  FiX,
  FiBriefcase,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";
import { formatDate } from "../../utils/helper";

const HEALTH_CONFIG = {
  EXPIRED: {
    label: "Expired",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    icon: FiAlertCircle,
  },
  DUE_SOON: {
    label: "Due Soon",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    icon: FiClock,
  },
  ON_TRACK: {
    label: "On Track",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: FiCheckCircle,
  },
};

const getItemHealth = (item) => {
  const value =
    item.health_status ??
    item.health ??
    item.health_level ??
    item.health_status_code;

  if (typeof value === "string") {
    return value.toUpperCase();
  }

  if (value && typeof value === "object") {
    return (
      value.status ??
      value.code ??
      value.level ??
      value.health_status ??
      ""
    )
      .toString()
      .toUpperCase();
  }

  return "";
};

// Menentukan tanggal acuan berdasarkan stage pekerjaan.
const getStageDate = (item, stage) => {
  const stageCode = (
    typeof stage === "string"
      ? stage
      : (stage?.stage ?? stage?.code ?? stage?.key ?? "")
  ).toUpperCase();

  const dateConfig = {
    IDENTIFIED: {
      date: item.completion_date,
      label: "Target selesai",
    },
    QUOTATION: {
      date: item.proposal_valid_until,
      label: "Penawaran berlaku",
    },
    CONTRACT: {
      date: item.contract_end_date,
      label: "Kontrak berakhir",
    },
    COMPLETED: {
      date: item.contract_end_date,
      label: "Kontrak berakhir",
    },
    BA: {
      date: item.contract_end_date,
      label: "Kontrak berakhir",
    },
    INVOICE: {
      date: item.invoice_due_date,
      label: "Jatuh tempo",
    },
    PAYMENT: {
      date: item.invoice_due_date,
      label: "Jatuh tempo",
    },
  };

  return (
    dateConfig[stageCode] ?? {
      date: item.target_end_date,
      label: "Target selesai",
    }
  );
};

const ModalStageWorkItems = ({
  isOpen,
  onClose,
  stage,
  healthFilter = null,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stage) return null;

  const items = stage.items || [];

  const filteredItems = healthFilter
    ? items.filter((item) => getItemHealth(item) === healthFilter)
    : items;

  const healthConfig = healthFilter ? HEALTH_CONFIG[healthFilter] : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-modal-title"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:p-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-custom-merah/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-custom-merah-terang">
                <FiBriefcase size={12} />
                Tahapan Pekerjaan
              </span>

              {healthConfig && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${healthConfig.className}`}
                >
                  <healthConfig.icon size={12} />
                  {healthConfig.label}
                </span>
              )}
            </div>

            <h2
              id="stage-modal-title"
              className="text-lg font-black text-gray-900 dark:text-white sm:text-xl"
            >
              {stage.label}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {healthFilter
                ? `Pekerjaan dengan kondisi ${healthConfig?.label || healthFilter}`
                : "Daftar seluruh pekerjaan pada tahapan ini"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 border-b border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/30 sm:grid-cols-4 sm:px-6">
          <div className="rounded-xl border border-gray-200/70 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-[10px] font-semibold text-gray-400">
              Total ditampilkan
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-gray-900 dark:text-white">
              {filteredItems.length}
            </p>
          </div>

          {Object.entries(HEALTH_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = stage.health?.[key] ?? 0;

            return (
              <div
                key={key}
                className="rounded-xl border border-gray-200/70 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="shrink-0" />
                  <p className="truncate text-[10px] font-semibold text-gray-400">
                    {config.label}
                  </p>
                </div>
                <p className="mt-1 text-xl font-black tabular-nums text-gray-900 dark:text-white">
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* List pekerjaan */}
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-5 text-center dark:border-gray-700">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                <FiBriefcase size={22} />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Tidak ada pekerjaan
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-400">
                {healthFilter
                  ? `Tidak ada pekerjaan dengan health ${healthConfig?.label || healthFilter} pada tahap ${stage.label}.`
                  : `Belum ada pekerjaan pada tahap ${stage.label}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => {
                const itemHealth = getItemHealth(item);
                const config = HEALTH_CONFIG[itemHealth];
                const HealthIcon = config?.icon;

                // Gunakan stage pekerjaan yang sedang ditampilkan.
                const stageDate = getStageDate(
                  item,
                  stage.stage ?? stage.code ?? stage.key,
                );

                return (
                  <article
                    key={item.id_work_item ?? item.work_number ?? index}
                    className="rounded-2xl border border-gray-200/80 bg-white p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold tracking-wide text-custom-merah-terang">
                            {item.work_number || "Nomor pekerjaan —"}
                          </span>

                          {config && HealthIcon && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-bold ${config.className}`}
                            >
                              <HealthIcon size={11} />
                              {config.label}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.work_name ||
                            item.nama_pekerjaan ||
                            "Nama pekerjaan —"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {item.client_name ||
                            item.nama_client ||
                            item.client?.client_name ||
                            item.client?.name ||
                            "Klien —"}
                          {item.client_pic_name
                            ? ` - Pak ${item.client_pic_name}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                          <p className="text-[9px] text-gray-400">Progress</p>
                          <p className="text-xs font-bold tabular-nums text-gray-800 dark:text-gray-200">
                            {item.progress_percent ?? 0}%
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                          <p className="flex items-center gap-1 text-[9px] text-gray-400">
                            <FiCalendar size={10} />
                            {stageDate.label}
                          </p>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {formatDate(stageDate.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30 sm:px-6">
          <p className="text-[10px] text-gray-400">
            Menampilkan {filteredItems.length} pekerjaan
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-custom-merah-terang px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
          >
            Tutup
          </button>
        </div>
      </section>
    </div>
  );
};

export default ModalStageWorkItems;
