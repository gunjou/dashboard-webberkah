/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from "react";
import { FiGitBranch, FiTrendingUp } from "react-icons/fi";

const WorkItemsList = ({ summary, loading }) => {
  const stages = summary?.stages ?? [];

  const stageLabels = useMemo(
    () =>
      Object.fromEntries(
        stages.map((stage) => [
          String(stage.stage ?? "").toUpperCase(),
          stage.label ?? stage.stage,
        ]),
      ),
    [stages],
  );

  const items = useMemo(() => {
    const uniqueItems = new Map();

    stages.forEach((stage) => {
      (stage.items ?? []).forEach((item) => {
        const stageCode = String(
          item.current_stage ?? item.stage ?? stage.stage ?? "",
        ).toUpperCase();

        const key =
          item.id_work_item ??
          item.work_number ??
          `${item.work_name}-${stageCode}`;

        if (!uniqueItems.has(key)) {
          uniqueItems.set(key, {
            ...item,
            current_stage: stageCode,
          });
        }
      });
    });

    // Dukung juga response yang menyediakan daftar item terpisah.
    const directItems = summary?.work_items ?? summary?.items ?? [];

    directItems.forEach((item) => {
      const stageCode = String(
        item.current_stage ?? item.stage ?? "",
      ).toUpperCase();
      const key =
        item.id_work_item ??
        item.work_number ??
        `${item.work_name}-${stageCode}`;

      uniqueItems.set(key, {
        ...item,
        current_stage: stageCode,
      });
    });

    return Array.from(uniqueItems.values());
  }, [summary, stages]);

  if (loading && items.length === 0) {
    return (
      <div
        className="max-h-[260px] space-y-2 overflow-hidden"
        role="status"
        aria-label="Memuat daftar pekerjaan"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[62px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center px-4 text-center text-xs text-gray-500 dark:text-gray-400">
        {summary?.total_active > 0
          ? "Ringkasan jumlah tersedia, tetapi detail pekerjaan belum disertakan oleh API."
          : "Belum ada pekerjaan aktif."}
      </div>
    );
  }

  return (
    <div className="max-h-[160px] space-y-2 overflow-y-auto pr-1">
      {items.map((item, index) => {
        const rawProgress = Number(item.progress_percent ?? 0);
        const progress = Number.isFinite(rawProgress)
          ? Math.min(100, Math.max(0, rawProgress))
          : 0;

        const stageCode = item.current_stage;
        const stageLabel =
          stageLabels[stageCode] ??
          item.stage_label ??
          stageCode ??
          "Belum ditentukan";

        return (
          <article
            key={
              item.id_work_item ??
              item.work_number ??
              `${item.work_name}-${index}`
            }
            className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/50"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-800 dark:text-gray-100">
                  {item.work_name || "Tanpa nama pekerjaan"}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {item.work_number || "Nomor pekerjaan belum tersedia"}
                  {item.client_name ? ` · ${item.client_name}` : ""}
                </p>
              </div>

              <span className="inline-flex max-w-[48%] shrink-0 items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[9px] font-bold text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300 sm:text-[10px]">
                <FiGitBranch size={11} className="shrink-0" />
                <span className="truncate">{stageLabel}</span>
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {item.work_type && (
                  <span
                    className={[
                      "shrink-0 rounded-md px-1.5 py-1 text-[9px] font-bold",
                      item.work_type === "TENDER"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                    ].join(" ")}
                  >
                    {item.work_type}
                  </span>
                )}

                {item.internal_pic_name && (
                  <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                    PIC: {item.internal_pic_name}
                  </span>
                )}
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold tabular-nums text-gray-600 dark:text-gray-300">
                <FiTrendingUp size={11} />
                {progress}%
              </span>
            </div>

            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default WorkItemsList;
