import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  BriefcaseBusiness,
  ListChecks,
  RefreshCw,
  TimerOff,
  Wallet,
} from "lucide-react";
import Api from "../utils/Api";
import MainLayout from "../layouts/MainLayout";
import { formatCurrency, useCurrencyVisibility } from "../utils/helper";
import {
  REMINDER_LEVELS,
  STAGE_META,
  V2_ENDPOINTS,
  WORK_TYPE_OPTIONS,
  safeArray,
  safeNumber,
} from "../components/dashboard-v2/constants";
import { Kpi, Panel, SegmentedControl } from "../components/dashboard-v2/ui";
import StageList from "../components/dashboard-v2/StageList";
import WorkMonitoringTable, {
  CONTRACT_COLUMN_STAGES,
} from "../components/dashboard-v2/WorkMonitoringTable";
import ReminderPanel from "../components/dashboard-v2/ReminderPanel";
import InvoicePotentialPanel, {
  InvoiceTable,
} from "../components/dashboard-v2/InvoicePotentialPanel";
import SummaryDetailModal from "../components/dashboard-v2/SummaryDetailModal";

const REFRESH_INTERVAL = 60_000;

// Stage yang langsung terbuka saat halaman dibuka / direfresh
const DEFAULT_STAGE = "CONTRACT";

export default function DashboardV2(layoutProps) {
  const { isCurrencyHidden } = useCurrencyVisibility();

  const [workType, setWorkType] = useState("");
  const [activeStage, setActiveStage] = useState(DEFAULT_STAGE);
  const [data, setData] = useState({
    monitoring: null,
    reminders: null,
    invoice: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [detailKey, setDetailKey] = useState(null);

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const params = workType ? { work_type: workType } : {};

      try {
        const [monitoringRes, remindersRes, invoiceRes] = await Promise.all([
          Api.get(V2_ENDPOINTS.monitoring, { params }),
          Api.get(V2_ENDPOINTS.reminders, { params }),
          Api.get(V2_ENDPOINTS.invoicePotential, { params }),
        ]);

        setData({
          monitoring: monitoringRes.data?.data || {},
          reminders: remindersRes.data?.data || {},
          invoice: invoiceRes.data?.data || {},
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
    },
    [workType],
  );

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(
      () => loadDashboard(true),
      REFRESH_INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const summary = data.monitoring?.summary || {};
  const stages = safeArray(data.monitoring?.stages);
  const reminderCount = data.reminders?.level_count || {};

  const stageItems = useMemo(() => {
    if (activeStage === "ALL")
      return stages.flatMap((stage) => safeArray(stage.items));
    const items = safeArray(
      stages.find((stage) => stage.stage === activeStage)?.items,
    );
    if (!CONTRACT_COLUMN_STAGES.includes(activeStage)) return items;
    // Urutkan dari kontrak yang paling dekat berakhir
    return [...items].sort(
      (a, b) =>
        (a.days_to_contract_end ?? Infinity) -
        (b.days_to_contract_end ?? Infinity),
    );
  }, [stages, activeStage]);

  // Daftar pekerjaan di balik tiap kartu summary
  const allWorkItems = useMemo(
    () => stages.flatMap((stage) => safeArray(stage.items)),
    [stages],
  );

  const summaryDetails = useMemo(() => {
    const byDeadline = (items) =>
      [...items].sort(
        (a, b) =>
          (a.days_to_deadline ?? Infinity) - (b.days_to_deadline ?? Infinity),
      );

    return {
      active: {
        title: "Pekerjaan Aktif",
        subtitle: "Semua pekerjaan yang belum closed",
        icon: BriefcaseBusiness,
        type: "work",
        items: byDeadline(allWorkItems),
        emptyText: "Tidak ada pekerjaan aktif.",
      },
      attention: {
        title: "Perlu Perhatian",
        subtitle: "Deadline 30 hari ke depan atau sudah terlambat",
        icon: BellRing,
        type: "work",
        items: byDeadline(
          allWorkItems.filter((item) =>
            REMINDER_LEVELS.includes(item.reminder_level),
          ),
        ),
        emptyText: "Tidak ada pekerjaan yang perlu perhatian.",
      },
      overdue: {
        title: "Terlambat",
        subtitle: "Pekerjaan yang sudah melewati deadline stage-nya",
        icon: TimerOff,
        type: "work",
        items: byDeadline(
          allWorkItems.filter((item) => item.reminder_level === "OVERDUE"),
        ),
        emptyText: "Tidak ada pekerjaan yang terlambat.",
      },
      behind: {
        title: "Tertinggal Jadwal",
        subtitle:
          "Progres lebih kecil dari persentase waktu kontrak yang berjalan",
        icon: AlertTriangle,
        type: "work",
        items: allWorkItems
          .filter((item) => item.is_behind_schedule)
          .sort(
            (a, b) =>
              safeNumber(a.progress_percent) -
              safeNumber(a.time_elapsed_percent) -
              (safeNumber(b.progress_percent) -
                safeNumber(b.time_elapsed_percent)),
          ),
        emptyText: "Tidak ada pekerjaan yang tertinggal jadwal.",
        stage: "CONTRACT", // tampilkan kolom kontrak mulai & berakhir
      },
      invoice: {
        title: "Potensi Invoice",
        subtitle: "Sisa tagihan invoice yang belum lunas (termasuk PPN)",
        total: data.invoice?.total_potential,
        icon: Wallet,
        type: "invoice",
        items: safeArray(data.invoice?.items),
      },
    };
  }, [allWorkItems, data.invoice]);

  const activeDetail = detailKey ? summaryDetails[detailKey] : null;
  const closeDetail = useCallback(() => setDetailKey(null), []);

  const urgentReminders =
    safeNumber(reminderCount.OVERDUE) + safeNumber(reminderCount.TODAY);

  return (
    <MainLayout {...layoutProps}>
      <>
        <div className="space-y-4">
          {/* Header halaman */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-custom-merah-terang">
                Dashboard Direksi · V2
              </p>
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Monitoring Pekerjaan & Potensi Invoice
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                options={WORK_TYPE_OPTIONS}
                value={workType}
                onChange={(value) => {
                  setWorkType(value);
                  setActiveStage(DEFAULT_STAGE);
                }}
              />
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-custom-merah-terang hover:text-custom-merah-terang disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                Muat ulang
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <span className="flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </span>
              <button
                type="button"
                onClick={() => loadDashboard()}
                className="font-bold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm font-semibold text-gray-500">
              <RefreshCw className="animate-spin" size={18} /> Memuat
              dashboard...
            </div>
          ) : (
            <>
              {/* Baris 1: tabel pekerjaan (utama) + ringkasan di samping */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Wrapper relatif: tinggi baris ditentukan kolom samping */}
                <div className="relative min-w-0 xl:order-1">
                  <Panel
                    title={
                      activeStage === "ALL"
                        ? "Semua Pekerjaan Aktif"
                        : `Stage ${STAGE_META[activeStage]?.label || activeStage}`
                    }
                    subtitle={
                      CONTRACT_COLUMN_STAGES.includes(activeStage)
                        ? "Diurutkan dari akhir kontrak terdekat"
                        : "Diurutkan dari deadline terdekat"
                    }
                    icon={BriefcaseBusiness}
                    className="h-full xl:absolute xl:inset-0"
                    bodyClassName="flex flex-col"
                    action={
                      activeStage !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => setActiveStage("ALL")}
                          className="text-xs font-bold text-custom-merah-terang hover:underline"
                        >
                          Tampilkan semua
                        </button>
                      )
                    }
                  >
                    <WorkMonitoringTable
                      items={stageItems}
                      stage={activeStage}
                      // Di layar lebar tinggi tabel mengikuti kolom samping (KPI + posisi pekerjaan)
                      maxHeight="max-h-[70vh] xl:max-h-none xl:min-h-0 xl:flex-1"
                    />
                  </Panel>
                </div>

                <aside className="space-y-3 xl:order-2">
                  {/* KPI ringkas */}
                  <div className="grid grid-cols-2 gap-2">
                    <Kpi
                      compact
                      label="Pekerjaan aktif"
                      onClick={() => setDetailKey("active")}
                      value={safeNumber(summary.total_active)}
                      note={`${safeNumber(summary.tender)} tender · ${safeNumber(summary.maintenance)} maint.`}
                      icon={BriefcaseBusiness}
                      tone="slate"
                    />
                    <Kpi
                      compact
                      label="Tertinggal jadwal"
                      onClick={() => setDetailKey("behind")}
                      value={safeNumber(summary.behind_schedule)}
                      note="Progres < waktu"
                      icon={AlertTriangle}
                      tone="amber"
                    />
                    <Kpi
                      compact
                      label="Perlu perhatian"
                      onClick={() => setDetailKey("attention")}
                      value={safeNumber(summary.need_attention)}
                      note="≤ 30 hari / terlambat"
                      icon={BellRing}
                      tone="amber"
                    />
                    <Kpi
                      compact
                      label="Terlambat"
                      onClick={() => setDetailKey("overdue")}
                      value={safeNumber(summary.overdue)}
                      note={`${urgentReminders} reminder mendesak`}
                      icon={TimerOff}
                      tone="red"
                    />
                    <Kpi
                      compact
                      className="col-span-2"
                      label="Potensi invoice"
                      onClick={() => setDetailKey("invoice")}
                      value={formatCurrency(
                        data.invoice?.total_potential,
                        isCurrencyHidden,
                      )}
                      note={`${safeNumber(data.invoice?.total_invoices)} invoice belum lunas · klik untuk detail`}
                      icon={Wallet}
                      highlight
                    />
                  </div>

                  {/* Posisi pekerjaan ringkas */}
                  <Panel
                    title="Posisi Pekerjaan"
                    subtitle="Klik stage untuk memfilter tabel"
                    icon={ListChecks}
                  >
                    <StageList
                      stages={stages}
                      activeStage={activeStage}
                      onSelect={setActiveStage}
                    />
                  </Panel>
                </aside>
              </div>

              {/* Baris 2: reminder + potensi invoice */}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <ReminderPanel data={data.reminders} />
                <InvoicePotentialPanel data={data.invoice} />
              </div>

              <p className="px-1 text-right text-[11px] text-gray-400">
                Auto-refresh setiap 60 detik ·{" "}
                {lastUpdated
                  ? `Terakhir diperbarui ${lastUpdated.toLocaleTimeString("id-ID")}`
                  : "Belum diperbarui"}
              </p>
            </>
          )}
        </div>
        <SummaryDetailModal
          open={Boolean(activeDetail)}
          title={activeDetail?.title}
          subtitle={activeDetail?.subtitle}
          icon={activeDetail?.icon}
          count={activeDetail?.items.length}
          onClose={closeDetail}
          footer={
            activeDetail?.type === "invoice" && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-custom-merah to-custom-merah-terang px-4 py-2 text-white shadow-lg shadow-red-500/20">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <Wallet size={20} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-100">
                      Total potensi uang masuk
                    </p>
                    <p className="text-xs text-red-100">
                      dari {activeDetail.items.length} invoice belum lunas
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-black tabular-nums tracking-tight text-white drop-shadow-sm">
                  {formatCurrency(activeDetail.total, isCurrencyHidden)}
                </p>
              </div>
            )
          }
        >
          {activeDetail?.type === "invoice" ? (
            <InvoiceTable items={activeDetail.items} maxHeight="max-h-none" />
          ) : (
            activeDetail && (
              <WorkMonitoringTable
                items={activeDetail.items}
                stage={activeDetail.stage}
                maxHeight="max-h-none"
                emptyText={activeDetail.emptyText}
              />
            )
          )}
        </SummaryDetailModal>
      </>
    </MainLayout>
  );
}
