export const V2_ENDPOINTS = {
  monitoring: "/work-item/dashboard/v2/monitoring",
  reminders: "/work-item/dashboard/v2/reminders",
  invoicePotential: "/work-item/dashboard/v2/invoice-potential",
};

export const WORK_TYPE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "TENDER", label: "Tender" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export const STAGE_META = {
  IDENTIFIED: { label: "Identified", hint: "Peluang teridentifikasi", dot: "bg-slate-400" },
  QUOTATION: { label: "Quotation", hint: "Penawaran diajukan", dot: "bg-amber-500" },
  CONTRACT: { label: "Contract", hint: "Kontrak berjalan", dot: "bg-indigo-500" },
  COMPLETED: { label: "Completed", hint: "Menunggu BA", dot: "bg-emerald-500" },
  BA: { label: "BA", hint: "Menunggu invoice", dot: "bg-rose-500" },
  INVOICE: { label: "Invoice", hint: "Menunggu pembayaran", dot: "bg-violet-500" },
  PAYMENT: { label: "Payment", hint: "Pembayaran berjalan", dot: "bg-teal-500" },
};

// Urutan dari paling mendesak
export const REMINDER_LEVELS = ["OVERDUE", "TODAY", "H-3", "H-7", "H-14", "H-30"];

export const REMINDER_META = {
  OVERDUE: {
    label: "Terlambat",
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
    dot: "bg-red-600",
    bar: "bg-red-600",
  },
  TODAY: {
    label: "Hari ini",
    badge:
      "border-red-200 bg-red-50 text-custom-merah-terang dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
    dot: "bg-custom-merah-terang",
    bar: "bg-custom-merah-terang",
  },
  "H-3": {
    label: "H-3",
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  "H-7": {
    label: "H-7",
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  "H-14": {
    label: "H-14",
    badge:
      "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300",
    dot: "bg-yellow-400",
    bar: "bg-yellow-400",
  },
  "H-30": {
    label: "H-30",
    badge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
  },
  ON_TRACK: {
    label: "Aman",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
};

export const INVOICE_BUCKET_META = {
  OVERDUE: { bar: "bg-red-600", text: "text-red-700 dark:text-red-300" },
  THIS_WEEK: { bar: "bg-orange-500", text: "text-orange-700 dark:text-orange-300" },
  THIS_MONTH: { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  LATER: { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  NO_DUE_DATE: { bar: "bg-gray-400", text: "text-gray-500 dark:text-gray-400" },
};

export const safeArray = (value) => (Array.isArray(value) ? value : []);
export const safeNumber = (value) => Number(value || 0);

export const shortDate = (value) => {
  if (!value) return "—";
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });
};

export const describeDays = (days) => {
  if (days === null || days === undefined) return "Tanpa deadline";
  const value = Number(days);
  if (value < 0) return `${Math.abs(value)} hari terlambat`;
  if (value === 0) return "Jatuh tempo hari ini";
  return `${value} hari lagi`;
};
