import { useMemo, useState } from "react";
import { BellRing, BriefcaseBusiness, ReceiptText } from "lucide-react";
import { formatCurrency, useCurrencyVisibility } from "../../utils/helper";
import { REMINDER_LEVELS, REMINDER_META, STAGE_META, safeArray, shortDate } from "./constants";
import { Empty, Panel, ReminderBadge } from "./ui";

export default function ReminderPanel({ data }) {
  const { isCurrencyHidden } = useCurrencyVisibility();
  const [level, setLevel] = useState("ALL");

  const items = safeArray(data?.items);
  const levelCount = data?.level_count || {};

  const filtered = useMemo(
    () => (level === "ALL" ? items : items.filter((item) => item.reminder_level === level)),
    [items, level],
  );

  return (
    <Panel
      title="Reminder"
      subtitle="Pekerjaan & invoice berdasarkan jarak ke due date"
      icon={BellRing}
      className="h-full"
      action={
        <span className="rounded-full bg-custom-merah-terang px-2.5 py-0.5 text-xs font-bold text-white">
          {items.length}
        </span>
      }
    >
      {/* Filter per tingkat reminder */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <LevelChip active={level === "ALL"} onClick={() => setLevel("ALL")} label="Semua" count={items.length} />
        {REMINDER_LEVELS.map((key) => (
          <LevelChip
            key={key}
            active={level === key}
            onClick={() => setLevel(key)}
            label={REMINDER_META[key].label}
            count={levelCount[key] || 0}
            dot={REMINDER_META[key].dot}
          />
        ))}
      </div>

      {filtered.length ? (
        <ul className="max-h-[520px] space-y-2 overflow-auto pr-1">
          {filtered.map((item) => {
            const isInvoice = item.reminder_type === "INVOICE";
            const TypeIcon = isInvoice ? ReceiptText : BriefcaseBusiness;
            return (
              <li
                key={`${item.reminder_type}-${item.id_invoice || item.id_work_item}`}
                className={`rounded-xl border-l-4 border-y border-r border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40 ${
                  item.reminder_level === "OVERDUE" || item.reminder_level === "TODAY"
                    ? "!border-l-custom-merah-terang"
                    : "!border-l-amber-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800 dark:text-gray-100">
                    <TypeIcon size={13} className="shrink-0 text-custom-merah-terang" />
                    {item.message}
                  </p>
                  <ReminderBadge level={item.reminder_level} days={item.days_to_deadline} />
                </div>
                <p className="mt-1 truncate text-xs text-gray-700 dark:text-gray-200" title={item.work_name}>
                  {item.work_name || item.work_number}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{item.client_name || "Klien —"}</span>
                  <span>·</span>
                  <span>{STAGE_META[item.current_stage]?.label || item.current_stage}</span>
                  <span>·</span>
                  <span>Deadline {shortDate(item.deadline_date)}</span>
                  {item.internal_pic_name && (
                    <>
                      <span>·</span>
                      <span>PIC {item.internal_pic_name}</span>
                    </>
                  )}
                </div>
                {isInvoice && (
                  <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    {item.invoice_number} · Sisa tagihan{" "}
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(item.outstanding_amount, isCurrencyHidden)}
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>Tidak ada reminder untuk tingkat ini.</Empty>
      )}
    </Panel>
  );
}

function LevelChip({ active, onClick, label, count, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-bold transition-colors ${
        active
          ? "border-custom-merah-terang bg-custom-merah-terang text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-custom-cerah dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
      <span className={active ? "text-red-100" : "text-gray-400"}>{count}</span>
    </button>
  );
}
