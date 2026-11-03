import { ChevronRight } from "lucide-react";
import { REMINDER_LEVELS, REMINDER_META, STAGE_META, safeNumber } from "./constants";

// Versi ringkas (vertikal) dari StagePipeline untuk kolom samping
export default function StageList({ stages, activeStage, onSelect }) {
  const maxTotal = Math.max(1, ...stages.map((stage) => safeNumber(stage.total)));

  return (
    <ul className="space-y-1">
      {stages.map((stage) => {
        const meta = STAGE_META[stage.stage] || { label: stage.label, hint: "", dot: "bg-gray-400" };
        const active = activeStage === stage.stage;
        const total = safeNumber(stage.total);
        const urgent = safeNumber(stage.reminder?.OVERDUE) + safeNumber(stage.reminder?.TODAY);

        return (
          <li key={stage.stage}>
            <button
              type="button"
              onClick={() => onSelect(active ? "ALL" : stage.stage)}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                active
                  ? "border-custom-merah-terang bg-red-50/70 dark:bg-red-500/10"
                  : "border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-gray-800/50"
              } ${total === 0 ? "opacity-60" : ""}`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`truncate text-xs font-extrabold ${
                      active ? "text-custom-merah-terang dark:text-red-300" : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {meta.label}
                  </p>
                  {urgent > 0 && (
                    <span
                      title={`${urgent} terlambat / jatuh tempo hari ini`}
                      className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-4 text-white"
                    >
                      {urgent}
                    </span>
                  )}
                  {safeNumber(stage.behind_schedule) > 0 && (
                    <span
                      title={`${stage.behind_schedule} tertinggal jadwal`}
                      className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold leading-4 text-white"
                    >
                      {stage.behind_schedule}
                    </span>
                  )}
                </div>

                {/* Bar panjang = jumlah relatif, warna = sebaran reminder */}
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="flex h-full" style={{ width: `${(total / maxTotal) * 100}%` }}>
                    {total > 0 &&
                      [...REMINDER_LEVELS, "ON_TRACK"].map((level) => {
                        const count =
                          level === "ON_TRACK"
                            ? total -
                              REMINDER_LEVELS.reduce((sum, key) => sum + safeNumber(stage.reminder?.[key]), 0)
                            : safeNumber(stage.reminder?.[level]);
                        if (count <= 0) return null;
                        return (
                          <div
                            key={level}
                            title={`${REMINDER_META[level].label}: ${count}`}
                            className={REMINDER_META[level].bar}
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>

              <span className="w-7 shrink-0 text-right text-lg font-black tabular-nums text-gray-900 dark:text-white">
                {total}
              </span>
              <ChevronRight
                size={14}
                className={`shrink-0 ${active ? "text-custom-merah-terang" : "text-gray-300 group-hover:text-gray-500"}`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
