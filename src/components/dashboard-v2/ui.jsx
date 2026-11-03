import { REMINDER_META, describeDays } from "./constants";

export function Panel({ title, subtitle, icon: Icon, action, children, className = "", bodyClassName = "" }) {
  return (
    <section
      className={`flex min-w-0 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-custom-merah-terang dark:bg-red-500/10">
              <Icon size={16} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-xs font-extrabold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className={`min-h-0 flex-1 p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

const KPI_TONES = {
  brand: "bg-red-50 text-custom-merah-terang dark:bg-red-500/10 dark:text-red-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  slate: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function Kpi({ label, value, note, icon: Icon, tone = "slate", highlight = false, onClick, compact = false, className = "" }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={onClick ? `Lihat detail ${label.toLowerCase()}` : undefined}
      className={`min-w-0 border text-left shadow-sm transition-all ${compact ? "rounded-xl px-3 py-2" : "rounded-2xl p-4"} ${className} ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-custom-merah-terang/40" : ""
      } ${
        highlight
          ? "border-transparent bg-gradient-to-br from-custom-merah to-custom-merah-terang text-white"
          : "border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}
    >
      <div className={`flex justify-between gap-2 ${compact ? "items-center" : "items-start"}`}>
        <p
          className={`truncate ${compact ? "text-[10px]" : "text-[11px]"} font-bold uppercase tracking-wider ${
            highlight ? "text-red-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {label}
        </p>
        {Icon && (
          <span
            className={`${compact ? "rounded-md p-1" : "rounded-xl p-2"} ${highlight ? "bg-white/15 text-white" : KPI_TONES[tone]}`}
          >
            <Icon size={compact ? 12 : 16} />
          </span>
        )}
      </div>
      <p
        className={`truncate ${compact ? "text-lg leading-6" : "mt-1 text-2xl"} font-black tabular-nums tracking-tight ${
          highlight ? "text-white" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      {note && (
        <p
          className={`truncate ${compact ? "text-[10px] leading-4" : "mt-1 text-[11px]"} ${
            highlight ? "text-red-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {note}
        </p>
      )}
      {onClick && !compact && (
        <p
          className={`mt-2 text-[11px] font-bold ${
            highlight ? "text-white" : "text-custom-merah-terang dark:text-red-300"
          }`}
        >
          Lihat detail →
        </p>
      )}
    </Wrapper>
  );
}

export function ReminderBadge({ level, days }) {
  if (!level) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-md border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Tanpa deadline
      </span>
    );
  }
  const meta = REMINDER_META[level] || REMINDER_META.ON_TRACK;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {level === "ON_TRACK" ? meta.label : describeDays(days)}
    </span>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800/60">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value || "ALL"}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              active
                ? "bg-custom-merah-terang text-white shadow-sm"
                : "text-gray-600 hover:text-custom-merah-terang dark:text-gray-300"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`ml-1.5 ${active ? "text-red-100" : "text-gray-400"}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Empty({ children = "Tidak ada data." }) {
  return (
    <div className="flex h-full min-h-24 items-center justify-center px-2 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
      {children}
    </div>
  );
}

export function ProgressBar({ value, behind = false }) {
  const width = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-full rounded-full ${behind ? "bg-amber-500" : "bg-custom-merah-terang"}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
