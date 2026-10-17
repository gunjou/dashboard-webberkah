import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  FileText,
  RefreshCw,
  Users,
  Wallet,
  ReceiptText,
} from "lucide-react";
import Api from "../utils/Api";
import MainLayout from "../layouts/MainLayout";
import { formatCurrency } from "../utils/helper";

const ENDPOINTS = {
  summary: "/work-item/dashboard/summary",
  warnings: "/work-item/dashboard/warnings",
  finance: "/work-item/dashboard/financial-summary",
  attendance: "/dashboard/kehadiran-hari-ini",
};

const STAGE_ORDER = [
  "IDENTIFIED",
  "QUOTATION",
  "CONTRACT",
  "IN_PROGRESS",
  "COMPLETED",
  "BA",
  "INVOICE",
  "PAYMENT",
  "CLOSED",
];

const STAGE_LABELS = {
  IDENTIFIED: "Identified",
  QUOTATION: "Quotation",
  CONTRACT: "Contract",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BA: "BA",
  INVOICE: "Invoice",
  PAYMENT: "Payment",
  CLOSED: "Closed",
};

const STAGE_COLOURS = {
  IDENTIFIED: "bg-slate-400",
  QUOTATION: "bg-amber-500",
  CONTRACT: "bg-indigo-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  BA: "bg-rose-500",
  INVOICE: "bg-violet-500",
  PAYMENT: "bg-teal-500",
  CLOSED: "bg-slate-600",
};

const HEALTH = {
  EXPIRED: {
    label: "Terlambat",
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  DUE_SOON: {
    label: "Segera jatuh tempo",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  ON_TRACK: {
    label: "Aman",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

// const money = (value) =>
//   new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     maximumFractionDigits: 0,
//   }).format(Number(value || 0));

// const compactMoney = (value) => {
//   const amount = Number(value || 0);
//   if (amount >= 1_000_000_000)
//     return `Rp ${(amount / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
//   if (amount >= 1_000_000)
//     return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
//   return money(amount);
// };

const date = (value) => {
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

const safeArray = (value) => (Array.isArray(value) ? value : []);
const safeNumber = (value) => Number(value || 0);

function Panel({ title, icon: Icon, action, children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex min-h-10 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={15} className="shrink-0 text-[#A91D24]" />}
          <h2 className="truncate text-[11px] font-extrabold uppercase tracking-[0.09em] text-slate-700">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Kpi({ label, value, note, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-800",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {Icon && (
          <span className={`rounded-lg p-1.5 ${tones[tone]}`}>
            <Icon size={15} />
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-xl font-black leading-6 tracking-tight text-slate-900">
        {value}
      </p>
      {note && (
        <p className="mt-1 truncate text-[10px] text-slate-500">{note}</p>
      )}
    </div>
  );
}

function Empty({ children = "Tidak ada data." }) {
  return (
    <div className="px-2 py-5 text-center text-xs text-slate-400">
      {children}
    </div>
  );
}

function HealthBadge({ status, days }) {
  const meta = HEALTH[status] || HEALTH.ON_TRACK;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status === "EXPIRED"
        ? `${Math.abs(safeNumber(days))} hari terlambat`
        : status === "DUE_SOON"
          ? `${safeNumber(days)} hari lagi`
          : meta.label}
    </span>
  );
}

function ProjectRows({ items, limit = 5 }) {
  const rows = safeArray(items).slice(0, limit);
  if (!rows.length) return <Empty />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((item) => (
        <div
          key={item.id_work_item}
          className="flex min-w-0 items-start gap-2 py-2 first:pt-0 last:pb-0"
        >
          <div
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STAGE_COLOURS[item.current_stage] || "bg-slate-400"}`}
          />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[11px] font-bold text-slate-800"
              title={item.work_name}
            >
              {item.work_name || item.work_number}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {item.work_number} · {item.client_name || "Klien —"} ·{" "}
              {item.internal_pic_name || "PIC —"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                {STAGE_LABELS[item.current_stage] || item.current_stage || "—"}
              </span>
              {item.health_status && (
                <HealthBadge
                  status={item.health_status}
                  days={item.days_to_deadline}
                />
              )}
              {item.deadline_date && (
                <span className="text-[9px] text-slate-400">
                  Deadline {date(item.deadline_date)}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-extrabold text-slate-700">
              {safeNumber(item.progress_percent)}%
            </p>
            <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#A91D24]"
                style={{
                  width: `${Math.min(100, Math.max(0, safeNumber(item.progress_percent)))}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
      {items.length > limit && (
        <p className="pt-2 text-[10px] text-slate-400">
          +{items.length - limit} pekerjaan lainnya
        </p>
      )}
    </div>
  );
}

function FinanceList({ items, type }) {
  const rows = safeArray(items).slice(0, 4);
  if (!rows.length) return <Empty />;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((item, index) => {
        const amount =
          type === "contract"
            ? item.total_contract_value
            : type === "unbilled"
              ? item.total_contract_value
              : type === "paid"
                ? item.total_received
                : (item.outstanding_amount ?? item.total_invoice);
        const reference =
          type === "contract"
            ? item.contract_number
            : type === "unbilled"
              ? item.ba_number
              : item.invoice_number;
        return (
          <div
            key={`${reference || item.id_work_item || item.id_invoice}-${index}`}
            className="flex items-start justify-between gap-2 py-2 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p
                className="truncate text-[10px] font-bold text-slate-800"
                title={item.work_name}
              >
                {item.work_name || item.work_number}
              </p>
              <p className="mt-0.5 truncate text-[9px] text-slate-500">
                {reference || item.work_number || "Tanpa nomor"} ·{" "}
                {item.client_name || "Klien —"}
              </p>
            </div>
            <p className="shrink-0 text-[10px] font-extrabold text-slate-800">
              {formatCurrency(amount)}
            </p>
          </div>
        );
      })}
      {items.length > 4 && (
        <p className="pt-2 text-[10px] text-slate-400">
          +{items.length - 4} data lainnya
        </p>
      )}
    </div>
  );
}

function AttendancePeople({ title, people, emptyText }) {
  const rows = safeArray(people).slice(0, 4);
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
        {title}{" "}
        <span className="text-slate-400">({safeArray(people).length})</span>
      </p>
      {rows.length ? (
        <div className="space-y-1.5">
          {rows.map((person) => (
            <div
              key={`${person.id_pegawai}-${person.nip}`}
              className="flex min-w-0 items-center gap-2"
            >
              {person.img_path ? (
                <img
                  src={person.img_path}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full bg-slate-100 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                  {(person.nama_panggilan || person.nama_lengkap || "?").slice(
                    0,
                    1,
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold text-slate-700">
                  {person.nama_panggilan || person.nama_lengkap}
                </p>
                <p className="truncate text-[9px] text-slate-400">
                  {person.nama_departemen || "Departemen —"}
                </p>
              </div>
              {person.jam_checkin && (
                <span className="shrink-0 text-[9px] font-semibold text-slate-500">
                  {person.jam_checkin}
                </span>
              )}
              {Number(person.menit_terlambat) > 0 && (
                <span className="shrink-0 rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-700">
                  +{person.menit_terlambat}m
                </span>
              )}
            </div>
          ))}
          {safeArray(people).length > 4 && (
            <p className="text-[9px] text-slate-400">
              +{people.length - 4} pegawai lainnya
            </p>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-slate-400">
          {emptyText || "Tidak ada data"}
        </p>
      )}
    </div>
  );
}

export default function ExecutiveMonitoringDashboard({
  onSwitchDashboard,
  isExecutiveDashboard,
}) {
  const [data, setData] = useState({
    summary: null,
    warnings: null,
    finance: null,
    attendance: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeStage, setActiveStage] = useState("ALL");

  const loadDashboard = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [summaryRes, warningsRes, financeRes, attendanceRes] =
        await Promise.all([
          Api.get(ENDPOINTS.summary),
          Api.get(ENDPOINTS.warnings),
          Api.get(ENDPOINTS.finance),
          Api.get(ENDPOINTS.attendance),
        ]);
      setData({
        summary: summaryRes.data?.data || {},
        warnings: warningsRes.data?.data || {},
        finance: financeRes.data?.data || {},
        attendance: attendanceRes.data?.data || {},
        attendanceMeta: attendanceRes.data?.meta || {},
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Dashboard gagal dimuat. Periksa koneksi atau sesi login.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(() => loadDashboard(true), 60_000);
    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const summary = data.summary || {};
  const warnings = data.warnings || {};
  const finance = data.finance || {};
  const attendance = data.attendance || {};
  const attendanceMeta = data.attendanceMeta || {};
  const attendanceSummary = attendanceMeta.summary || {};
  const stages = safeArray(summary.stages)
    .slice()
    .sort(
      (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
    );
  const stageItems = useMemo(() => {
    if (activeStage === "ALL")
      return stages.flatMap((stage) => safeArray(stage.items));
    return stages
      .filter((stage) => stage.stage === activeStage)
      .flatMap((stage) => safeArray(stage.items));
  }, [stages, activeStage]);

  const expiredItems = safeArray(warnings.EXPIRED?.items);
  const dueSoonItems = safeArray(warnings.DUE_SOON?.items);
  const totalPresent = safeNumber(attendanceSummary.total_hadir);
  const activeEmployees = safeNumber(attendanceSummary.total_pegawai_aktif);
  const attendancePercent = activeEmployees
    ? Math.min(100, (totalPresent / activeEmployees) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <RefreshCw className="animate-spin" size={18} /> Memuat detail
          dashboard...
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      title="Dashboard-Lengkap"
      description="Monitoring pekerjaan, keuangan, dan kehadiran"
      refreshing={refreshing}
      onSwitchDashboard={onSwitchDashboard}
      isExecutiveDashboard={isExecutiveDashboard}
    >
      <main className="min-h-screen  p-3 text-slate-800 md:p-4">
        <div className="mx-auto max-w-[1920px] space-y-3">
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <span className="flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </span>
              <button
                onClick={() => loadDashboard()}
                className="font-bold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
            <Kpi
              label="Pekerjaan Aktif"
              value={safeNumber(summary.total_active)}
              note={`${safeNumber(summary.tender)} tender · ${safeNumber(summary.maintenance)} maintenance`}
              icon={BriefcaseBusiness}
            />
            <Kpi
              label="Nilai Kontrak"
              value={formatCurrency(finance.contract?.total_contract_value)}
              note={`${safeNumber(finance.contract?.total_contracts)} kontrak · ${safeNumber(finance.contract?.total_work_items)} pekerjaan`}
              icon={FileText}
              tone="blue"
            />
            <Kpi
              label="Belum Ditagih"
              value={formatCurrency(finance.unbilled?.total_value)}
              note={`${safeNumber(finance.unbilled?.total_work_items)} pekerjaan dengan BA`}
              icon={ArrowUpRight}
              tone="amber"
            />
            <Kpi
              label="Outstanding Invoice"
              value={formatCurrency(finance.unpaid?.total_outstanding)}
              note={`${safeNumber(finance.unpaid?.total_invoices)} invoice belum lunas`}
              icon={Wallet}
              tone="red"
            />
            <Kpi
              label="Sudah Diterima"
              value={formatCurrency(finance.paid?.total_received)}
              note={`${safeNumber(finance.paid?.total_invoices)} invoice pada kategori paid`}
              icon={Banknote}
              tone="green"
            />
            <Kpi
              label="Deadline Bermasalah"
              value={safeNumber(warnings.EXPIRED?.total)}
              note={`${safeNumber(warnings.DUE_SOON?.total)} mendekati deadline`}
              icon={AlertTriangle}
              tone="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <div className="space-y-3 xl:col-span-7">
              <Panel
                title="Project Pipeline"
                icon={BriefcaseBusiness}
                action={
                  <span className="text-[10px] text-slate-400">
                    {stages.length} tahap
                  </span>
                }
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
                  {stages.map((stage) => {
                    const total = safeNumber(stage.total);
                    const maxTotal = Math.max(
                      1,
                      ...stages.map((s) => safeNumber(s.total)),
                    );
                    const health = stage.health || {};
                    return (
                      <button
                        key={stage.stage}
                        onClick={() =>
                          setActiveStage(
                            activeStage === stage.stage ? "ALL" : stage.stage,
                          )
                        }
                        className={`min-w-0 rounded-lg border p-2 text-left transition ${activeStage === stage.stage ? "border-[#A91D24] bg-red-50/60 ring-1 ring-[#A91D24]/20" : "border-slate-100 bg-slate-50/70 hover:border-slate-300"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[10px] font-bold text-slate-600">
                            {stage.label ||
                              STAGE_LABELS[stage.stage] ||
                              stage.stage}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {total}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${STAGE_COLOURS[stage.stage] || "bg-slate-500"}`}
                            style={{ width: `${(total / maxTotal) * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[9px]">
                          {safeNumber(health.EXPIRED) > 0 && (
                            <span className="font-bold text-red-600">
                              {health.EXPIRED} expired
                            </span>
                          )}
                          {safeNumber(health.DUE_SOON) > 0 && (
                            <span className="font-bold text-amber-700">
                              {health.DUE_SOON} due soon
                            </span>
                          )}
                          {safeNumber(health.ON_TRACK) > 0 && (
                            <span className="text-emerald-700">
                              {health.ON_TRACK} aman
                            </span>
                          )}
                          {!safeNumber(health.EXPIRED) &&
                            !safeNumber(health.DUE_SOON) &&
                            !safeNumber(health.ON_TRACK) && (
                              <span className="text-slate-400">
                                Belum ada indikator deadline
                              </span>
                            )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Panel>

              <Panel
                title="Daftar Pekerjaan"
                icon={CalendarClock}
                action={
                  <select
                    value={activeStage}
                    onChange={(e) => setActiveStage(e.target.value)}
                    className="max-w-36 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] outline-none"
                  >
                    <option value="ALL">Semua tahap</option>
                    {stages.map((s) => (
                      <option key={s.stage} value={s.stage}>
                        {s.label || STAGE_LABELS[s.stage]}
                      </option>
                    ))}
                  </select>
                }
              >
                <ProjectRows items={stageItems} limit={8} />
              </Panel>

              <Panel
                title="Deadline & Warning"
                icon={AlertTriangle}
                action={
                  <span className="text-[10px] text-slate-400">
                    {expiredItems.length + dueSoonItems.length} item contoh
                  </span>
                }
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                        Expired / terlambat
                      </p>
                      <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-700">
                        {safeNumber(warnings.EXPIRED?.total)}
                      </span>
                    </div>
                    <ProjectRows items={expiredItems} limit={4} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        Due soon
                      </p>
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
                        {safeNumber(warnings.DUE_SOON?.total)}
                      </span>
                    </div>
                    <ProjectRows items={dueSoonItems} limit={4} />
                  </div>
                </div>
              </Panel>
            </div>

            <div className="space-y-3 xl:col-span-5">
              <Panel title="Financial Monitoring" icon={Wallet}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Nilai kontrak
                    </p>
                    <p className="mt-1 text-base font-black text-slate-900">
                      {formatCurrency(finance.contract?.total_contract_value)}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      {safeNumber(finance.contract?.total_contracts)} kontrak
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      Belum ditagih
                    </p>
                    <p className="mt-1 text-base font-black text-amber-900">
                      {formatCurrency(finance.unbilled?.total_value)}
                    </p>
                    <p className="text-[9px] text-amber-800">
                      {safeNumber(finance.unbilled?.total_work_items)} pekerjaan
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-red-700">
                      Belum dibayar
                    </p>
                    <p className="mt-1 text-base font-black text-red-800">
                      {formatCurrency(finance.unpaid?.total_outstanding)}
                    </p>
                    <p className="text-[9px] text-red-700">
                      {safeNumber(finance.unpaid?.total_invoices)} invoice
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                      Diterima (kategori paid)
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-900">
                      {formatCurrency(finance.paid?.total_received)}
                    </p>
                    <p className="text-[9px] text-emerald-800">
                      {safeNumber(finance.paid?.total_invoices)} invoice
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                      <FileText size={12} /> Kontrak terbaru
                    </p>
                    <FinanceList
                      items={finance.contract?.items}
                      type="contract"
                    />
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                      <ReceiptText size={12} /> BA belum ditagih
                    </p>
                    <FinanceList
                      items={finance.unbilled?.items}
                      type="unbilled"
                    />
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                      <ArrowDownRight size={12} /> Invoice outstanding
                    </p>
                    <FinanceList items={finance.unpaid?.items} type="unpaid" />
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      <CheckCircle2 size={12} /> Pembayaran diterima
                    </p>
                    <FinanceList items={finance.paid?.items} type="paid" />
                  </div>
                </div>
              </Panel>

              <Panel
                title="Attendance Today"
                icon={Users}
                action={
                  <span className="text-[10px] text-slate-400">
                    {date(attendanceMeta.tanggal)}
                  </span>
                }
              >
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Hadir hari ini
                    </p>
                    <p className="mt-0.5 text-2xl font-black leading-none text-slate-900">
                      {totalPresent}
                      <span className="ml-1 text-sm font-semibold text-slate-400">
                        / {activeEmployees}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-700">
                    {attendancePercent.toFixed(0)}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${attendancePercent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-2">
                    <p className="text-[9px] font-bold text-amber-800">
                      Terlambat
                    </p>
                    <p className="text-lg font-black text-amber-900">
                      {safeNumber(attendanceSummary.total_terlambat)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-2">
                    <p className="text-[9px] font-bold text-blue-800">Izin</p>
                    <p className="text-lg font-black text-blue-900">
                      {safeNumber(attendanceSummary.total_izin)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-100 bg-red-50 p-2">
                    <p className="text-[9px] font-bold text-red-800">Alpha</p>
                    <p className="text-lg font-black text-red-900">
                      {safeNumber(attendanceSummary.total_alpha)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AttendancePeople
                    title="Terlambat"
                    people={attendance.terlambat}
                    emptyText="Tidak ada keterlambatan"
                  />
                  <AttendancePeople
                    title="Alpha"
                    people={attendance.alpha}
                    emptyText="Tidak ada pegawai alpha"
                  />
                  <AttendancePeople
                    title="Izin"
                    people={attendance.izin}
                    emptyText="Tidak ada pengajuan izin"
                  />
                  <AttendancePeople
                    title="Hadir (contoh)"
                    people={attendance.hadir}
                    emptyText="Belum ada data hadir"
                  />
                </div>
              </Panel>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 text-[9px] text-slate-400">
            <span className="flex items-center gap-1">
              <Activity size={11} /> Executive Monitoring · Data bersumber dari
              API operasional
            </span>
            <span>
              Auto-refresh setiap 60 detik ·{" "}
              {lastUpdated
                ? `Terakhir diperbarui ${lastUpdated.toLocaleTimeString("id-ID")}`
                : "Belum diperbarui"}
            </span>
          </footer>
        </div>
      </main>
    </MainLayout>
  );
}
