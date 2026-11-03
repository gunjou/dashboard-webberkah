import { AlertTriangle } from "lucide-react";
import { STAGE_META, safeArray, safeNumber, shortDate } from "./constants";
import { Empty, ProgressBar, ReminderBadge } from "./ui";

// Stage yang menampilkan kolom kontrak mulai & berakhir menggantikan deadline
export const CONTRACT_COLUMN_STAGES = ["CONTRACT", "COMPLETED"];

export default function WorkMonitoringTable({ items, stage, maxHeight = "max-h-[520px]", emptyText }) {
  const rows = safeArray(items);
  const showContractColumns = CONTRACT_COLUMN_STAGES.includes(stage);
  if (!rows.length) return <Empty>{emptyText || "Tidak ada pekerjaan pada stage ini."}</Empty>;

  return (
    <div className={`${maxHeight} overflow-auto`}>
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead className="sticky top-0 z-10 bg-white text-[10px] uppercase tracking-wider text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="py-2 pr-3 font-bold">Pekerjaan</th>
            <th className="px-3 py-2 font-bold">Stage</th>
            <th className="w-36 px-3 py-2 font-bold">Progres</th>
            {showContractColumns ? (
              <>
                <th className="px-3 py-2 font-bold">Kontrak mulai</th>
                <th className="px-3 py-2 font-bold">Kontrak berakhir</th>
              </>
            ) : (
              <th className="px-3 py-2 font-bold">Deadline</th>
            )}
            <th className="px-3 py-2 text-right font-bold">Di stage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((item) => {
            const stage = STAGE_META[item.current_stage];
            return (
              <tr key={item.id_work_item} className="align-top hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                <td className="max-w-[320px] py-2.5 pr-3">
                  <p className="truncate font-bold text-gray-800 dark:text-gray-100" title={item.work_name}>
                    {item.work_name || item.work_number}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {item.client_name || "Klien —"} · PIC {item.internal_pic_name || "—"}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-gray-400" title={item.work_number}>
                    {item.work_number} ·{" "}
                    <span className="font-semibold">{item.work_type}</span>
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <span className={`h-1.5 w-1.5 rounded-full ${stage?.dot || "bg-gray-400"}`} />
                    {stage?.label || item.current_stage}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold tabular-nums text-gray-800 dark:text-gray-100">
                      {safeNumber(item.progress_percent)}%
                    </span>
                    {item.time_elapsed_percent !== null && item.time_elapsed_percent !== undefined && (
                      <span className="text-[10px] text-gray-400">
                        waktu {safeNumber(item.time_elapsed_percent).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <ProgressBar value={item.progress_percent} behind={item.is_behind_schedule} />
                  </div>
                  {item.is_behind_schedule && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      <AlertTriangle size={11} /> Tertinggal jadwal
                    </p>
                  )}
                </td>
                {showContractColumns ? (
                  <>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        {shortDate(item.contract_start_date)}
                      </p>
                      {item.contract_number && (
                        <p className="mt-1 max-w-[160px] truncate text-[10px] text-gray-400" title={item.contract_number}>
                          {item.contract_number}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        {shortDate(item.contract_end_date)}
                      </p>
                      <div className="mt-1">
                        <ReminderBadge level={item.contract_end_level} days={item.days_to_contract_end} />
                      </div>
                    </td>
                  </>
                ) : (
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{shortDate(item.deadline_date)}</p>
                    <div className="mt-1">
                      <ReminderBadge level={item.reminder_level} days={item.days_to_deadline} />
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-300">
                  {item.days_in_stage === null || item.days_in_stage === undefined
                    ? "—"
                    : `${item.days_in_stage} hari`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
