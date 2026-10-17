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
    shortLabel: "Expired",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    icon: FiAlertCircle,
  },
  DUE_SOON: {
    label: "Due Soon",
    shortLabel: "Due Soon",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    icon: FiClock,
  },
  ON_TRACK: {
    label: "On Track",
    shortLabel: "On Track",
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

  const stageCode = (
    stage.stage ??
    stage.code ??
    stage.key ??
    ""
  ).toUpperCase();

  const isContractStage = ["CONTRACT", "COMPLETED"].includes(stageCode);

  const total = filteredItems.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-modal-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Compact Header */}
        <header className="shrink-0 border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
          <div className="flex items-center gap-3">
            {/* Title */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-custom-merah/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-custom-merah-terang">
                  <FiBriefcase size={11} />
                  Tahapan Pekerjaan
                </span>

                {healthConfig && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-bold ${healthConfig.className}`}
                  >
                    <healthConfig.icon size={11} />
                    {healthConfig.label}
                  </span>
                )}
              </div>

              <h2
                id="stage-modal-title"
                className="truncate text-base font-extrabold text-gray-900 dark:text-white sm:text-lg"
              >
                {stage.label}
              </h2>
            </div>

            {/* Inline Summary */}
            <div className="hidden shrink-0 items-center gap-1.5 md:flex">
              <div className="flex items-center w-24 gap-3 rounded-lg border px-2.5 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                <FiBriefcase size={13} />
                <div>
                  <p className="text-[9px] font-medium leading-tight opacity-80">
                    Total
                  </p>
                  <p className="text-sm font-extrabold leading-tight tabular-nums">
                    {total}
                  </p>
                </div>
              </div>

              {Object.entries(HEALTH_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const count = stage.health?.[key] ?? 0;

                return (
                  <div
                    key={key}
                    className={`flex items-center w-24 gap-3 rounded-lg border px-2.5 py-1.5 ${config.className}`}
                    title={config.label}
                  >
                    <Icon size={13} />
                    <div>
                      <p className="text-[9px] font-medium leading-tight opacity-80">
                        {config.shortLabel}
                      </p>
                      <p className="text-sm font-extrabold leading-tight tabular-nums">
                        {count}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Inline Summary: Mobile */}
          <div className="mt-3 grid grid-cols-4 gap-1.5 md:hidden">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-[9px] text-gray-500 dark:text-gray-400">
                Total
              </p>
              <p className="text-sm font-extrabold tabular-nums text-gray-900 dark:text-white">
                {total}
              </p>
            </div>

            {Object.entries(HEALTH_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = stage.health?.[key] ?? 0;

              return (
                <div
                  key={key}
                  className={`min-w-0 rounded-lg border px-2 py-1.5 ${config.className}`}
                >
                  <div className="flex items-center gap-1">
                    <Icon size={10} />
                    <p className="truncate text-[9px] font-semibold">
                      {config.shortLabel}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm font-extrabold tabular-nums">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </header>

        {/* Compact List */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/50 p-3 dark:bg-gray-950/20 sm:p-4">
          {filteredItems.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-5 text-center dark:border-gray-700 dark:bg-gray-900">
              <FiBriefcase size={22} className="mb-2 text-gray-400" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Tidak ada pekerjaan
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {healthFilter
                  ? `Tidak ada pekerjaan dengan health ${
                      healthConfig?.label || healthFilter
                    } pada tahap ${stage.label}.`
                  : `Belum ada pekerjaan pada tahap ${stage.label}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item, index) => {
                const itemHealth = getItemHealth(item);
                const config = HEALTH_CONFIG[itemHealth];
                const HealthIcon = config?.icon;

                const stageDate = getStageDate(
                  item,
                  stage.stage ?? stage.code ?? stage.key,
                );

                return (
                  <article
                    key={item.id_work_item ?? item.work_number ?? index}
                    className={[
                      "rounded-xl border px-3 py-2.5 transition-colors",
                      config
                        ? config.className
                        : "border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      {/* Work Information */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold tracking-wide text-custom-merah-terang">
                            {item.work_number || "Nomor pekerjaan —"}
                          </span>

                          {config && HealthIcon && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-bold leading-tight border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900`}
                            >
                              <HealthIcon size={10} />
                              {config.label}
                            </span>
                          )}
                        </div>

                        <h3 className="truncate text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                          {item.work_name ||
                            item.nama_pekerjaan ||
                            "Nama pekerjaan —"}
                        </h3>

                        <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                          {item.client_name ||
                            item.nama_client ||
                            item.client?.client_name ||
                            item.client?.name ||
                            "Klien —"}
                          {item.client_pic_name
                            ? ` · PIC: ${item.client_pic_name}`
                            : ""}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="w-14 shrink-0 text-right sm:w-20">
                        <p className="text-[9px] text-gray-400">Progress</p>
                        <p className="text-xs font-extrabold tabular-nums text-gray-800 dark:text-gray-200">
                          {item.progress_percent ?? 0}%
                        </p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Number(item.progress_percent ?? 0)),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stage Date */}

                      {/* Stage Date */}
                      <div className="w-[120px] shrink-0 border-l border-gray-100 pl-2 dark:border-gray-800 sm:w-40 sm:pl-3">
                        {isContractStage ? (
                          <div className="space-y-2">
                            <div>
                              <p className="flex items-center gap-1 text-[9px] text-gray-400">
                                <FiCalendar size={10} className="shrink-0" />
                                <span>Tanggal mulai kontrak</span>
                              </p>
                              <p className="mt-0.5 text-[10px] font-bold text-gray-800 dark:text-gray-200 sm:text-xs">
                                {formatDate(item.contract_start_date) || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="flex items-center gap-1 text-[9px] text-gray-400">
                                <FiCalendar size={10} className="shrink-0" />
                                <span>Tanggal akhir kontrak</span>
                              </p>
                              <p className="mt-0.5 text-[10px] font-bold text-gray-800 dark:text-gray-200 sm:text-xs">
                                {formatDate(item.contract_end_date) || "-"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="flex items-center gap-1 text-[9px] text-gray-400">
                              <FiCalendar size={10} className="shrink-0" />
                              <span className="truncate">
                                {stageDate.label}
                              </span>
                            </p>
                            <p className="mt-1 text-[10px] font-bold text-gray-800 dark:text-gray-200 sm:text-xs">
                              {formatDate(stageDate.date) || "-"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900 sm:px-5">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
            Menampilkan{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {total}
            </span>{" "}
            pekerjaan
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-custom-merah-terang px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
          >
            Tutup
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ModalStageWorkItems;
