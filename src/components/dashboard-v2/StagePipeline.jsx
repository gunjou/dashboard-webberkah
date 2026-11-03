import { REMINDER_LEVELS, REMINDER_META, STAGE_META, safeNumber } from "./constants";

// Kartu per stage: jumlah pekerjaan + sebaran reminder. Klik untuk memfilter daftar.
export default function StagePipeline({ stages, activeStage, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {stages.map((stage, index) => {
        const meta = STAGE_META[stage.stage] || { label: stage.label, hint: "", dot: "bg-gray-400" };
        const active = activeStage === stage.stage;
        const urgent =
          safeNumber(stage.reminder?.OVERDUE) + safeNumber(stage.reminder?.TODAY);
        const total = safeNumber(stage.total);

        return (
          <button
            key={stage.stage}
            type="button"
            onClick={() => onSelect(active ? "ALL" : stage.stage)}
            className={`group relative min-w-0 rounded-2xl border p-3 text-left transition-all ${
              active
                ? "border-custom-merah-terang bg-red-50/60 ring-2 ring-custom-merah-terang/20 dark:bg-red-500/10"
                : "border-gray-200/80 bg-white hover:border-custom-cerah dark:border-gray-800 dark:bg-gray-900"
            } ${total === 0 ? "opacity-60" : ""}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-gray-400">{String(index + 1).padStart(2, "0")}</span>
              {urgent > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                  {urgent}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
              <p className="truncate text-xs font-extrabold text-gray-800 dark:text-gray-100">
                {meta.label}
              </p>
            </div>
            <p className="mt-1 text-3xl font-black tabular-nums leading-none text-gray-900 dark:text-white">
              {total}
            </p>
            <p className="mt-1 truncate text-[10px] text-gray-500 dark:text-gray-400">{meta.hint}</p>

            {/* Sebaran reminder per tingkat */}
            <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              {total > 0 &&
                REMINDER_LEVELS.map((level) => {
                  const count = safeNumber(stage.reminder?.[level]);
                  if (!count) return null;
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
            {safeNumber(stage.behind_schedule) > 0 && (
              <p className="mt-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                {stage.behind_schedule} tertinggal jadwal
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
