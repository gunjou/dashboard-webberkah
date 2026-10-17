import { useCallback, useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Api from "../utils/Api";
import { getAttendanceStats } from "../utils/attendanceStats";

import ModalStageWorkItems from "../components/modal/ModalStageWorkItems";
import ModalAttendanceEmployees from "../components/modal/ModalAttendanceEmployees";

import WorkStagesPanel from "../components/dashboard/work-stages/WorkStagesPanel";
import AttendancePanel from "../components/dashboard/attendance/AttendancePanel";
import WarningsPanel from "../components/dashboard/warnings/WarningsPanel";
import FinancialSummaryPanel from "../components/dashboard/financial/FinancialSummaryPanel";
import WorkSummaryPanel from "../components/dashboard/work-stages/WorkSummaryPanel";

const Dashboard = ({ onSwitchDashboard, isExecutiveDashboard }) => {
  // ==================================================
  // 1. STATE
  // ==================================================

  // Work Summary
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Attendance
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");
  const [attentionIndex, setAttentionIndex] = useState(0);

  // Warnings
  const [warnings, setWarnings] = useState({
    EXPIRED: { total: 0, items: [] },
    DUE_SOON: { total: 0, items: [] },
  });
  const [warningsLoading, setWarningsLoading] = useState(true);
  const [warningsError, setWarningsError] = useState("");
  const [activeWarningTab, setActiveWarningTab] = useState("EXPIRED");

  // Modal: Work Stages
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedHealth, setSelectedHealth] = useState(null);

  // Modal: Attendance
  const [attendanceModal, setAttendanceModal] = useState({
    isOpen: false,
    type: "LATE",
    employees: [],
  });

  // ==================================================
  // 2. DERIVED DATA
  // ==================================================

  // Attendance Data
  const attendanceData = attendance?.data;
  const attendanceSummary = attendance?.meta?.summary;

  const lateEmployees = attendanceData?.terlambat || [];
  const alphaEmployees = attendanceData?.alpha || [];
  const activeEmployees = attendanceData?.pegawai_aktif || [];
  const presentEmployees = attendanceData?.hadir || [];
  const leaveEmployees = attendanceData?.izin || [];

  const sickCount = attendanceSummary?.izin_detail?.SAKIT ?? 0;

  const leaveCount =
    (attendanceSummary?.izin_detail?.IZIN ?? 0) +
    (attendanceSummary?.izin_detail?.CUTI ?? 0);

  const attendanceStats = getAttendanceStats(
    attendanceSummary,
    leaveCount,
    sickCount,
  );

  // Attendance Attention Carousel
  const attentionItems = [
    ...lateEmployees.map((employee) => ({
      type: "LATE",
      employee,
    })),
    ...alphaEmployees.map((employee) => ({
      type: "ALPHA",
      employee,
    })),
  ];

  // ==================================================
  // 3. FETCH FUNCTIONS
  // ==================================================

  // Fetch Work Summary
  const fetchSummary = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await Api.get("/work-item/dashboard/summary");

      if (response.data.success) {
        setSummary(response.data.data);
      } else {
        setError(
          response.data.message || "Gagal mengambil ringkasan pekerjaan.",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data monitoring pekerjaan.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch Attendance
  const fetchAttendance = useCallback(async () => {
    setAttendanceLoading(true);
    setAttendanceError("");

    try {
      const response = await Api.get("/dashboard/kehadiran-hari-ini");

      if (response.data.success) {
        setAttendance(response.data);
      } else {
        setAttendanceError(
          response.data.message || "Gagal mengambil data kehadiran.",
        );
      }
    } catch (err) {
      setAttendanceError(
        err.response?.data?.message || "Gagal mengambil data kehadiran.",
      );
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  // Fetch Warnings
  const fetchWarnings = useCallback(async () => {
    setWarningsLoading(true);
    setWarningsError("");

    try {
      const response = await Api.get("/work-item/dashboard/warnings");

      if (response.data.success) {
        const data = response.data.data || {};
        const expired = data.EXPIRED || { total: 0, items: [] };
        const dueSoon = data.DUE_SOON || { total: 0, items: [] };

        setWarnings({
          EXPIRED: expired,
          DUE_SOON: dueSoon,
        });

        // Prioritaskan warning EXPIRED, kemudian DUE_SOON.
        setActiveWarningTab(
          expired.total > 0
            ? "EXPIRED"
            : dueSoon.total > 0
              ? "DUE_SOON"
              : "EXPIRED",
        );
      } else {
        setWarningsError(
          response.data.message || "Gagal mengambil data warning.",
        );
      }
    } catch (err) {
      setWarningsError(
        err.response?.data?.message || "Gagal mengambil data warning.",
      );
    } finally {
      setWarningsLoading(false);
    }
  }, []);

  // ==================================================
  // 4. EVENT HANDLERS
  // ==================================================

  // Work Stage Modal
  const openStageModal = useCallback((stage, health = null) => {
    setSelectedStage(stage);
    setSelectedHealth(health);
  }, []);

  const closeStageModal = useCallback(() => {
    setSelectedStage(null);
    setSelectedHealth(null);
  }, []);

  // Attendance Modal
  const openAttendanceModal = useCallback((type, employees) => {
    setAttendanceModal({
      isOpen: true,
      type,
      employees: employees ?? [],
    });
  }, []);

  const closeAttendanceModal = useCallback(() => {
    setAttendanceModal((current) => ({
      ...current,
      isOpen: false,
    }));
  }, []);

  // ==================================================
  // 5. EFFECTS
  // ==================================================

  // Initial Data Fetch
  useEffect(() => {
    fetchSummary();
    fetchAttendance();
    fetchWarnings();
  }, [fetchSummary, fetchAttendance, fetchWarnings]);

  // Reset Attention Carousel Index
  useEffect(() => {
    setAttentionIndex(0);
  }, [attentionItems.length]);

  // Auto Rotate Attention Carousel
  useEffect(() => {
    if (attentionItems.length <= 1) return;

    const interval = setInterval(() => {
      setAttentionIndex((current) => (current + 1) % attentionItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [attentionItems.length]);

  // ==================================================
  // 6. RENDER
  // ==================================================

  return (
    <MainLayout
      title="Dashboard"
      description="Monitoring pekerjaan, keuangan, dan kehadiran"
      onRefresh={() => fetchSummary(true)}
      refreshing={refreshing}
      onSwitchDashboard={onSwitchDashboard}
      isExecutiveDashboard={isExecutiveDashboard}
    >
      {/* 1. WORK STAGES & ATTENDANCE */}
      <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-4">
        {/* Work Stages: 3/4 */}
        <aside className="min-w-0 xl:col-span-3">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => fetchSummary()}
                className="shrink-0 text-xs font-bold text-red-600 underline dark:text-red-400"
              >
                Coba lagi
              </button>
            </div>
          )}

          <WorkStagesPanel
            summary={summary}
            openStageModal={openStageModal}
            loading={loading}
          />
        </aside>

        {/* Attendance: 1/4 */}
        <aside className="min-w-0 xl:col-span-1">
          <AttendancePanel
            attendance={attendance}
            attendanceLoading={attendanceLoading}
            attendanceError={attendanceError}
            fetchAttendance={fetchAttendance}
            attendanceStats={attendanceStats}
            openAttendanceModal={openAttendanceModal}
            activeEmployees={activeEmployees}
            presentEmployees={presentEmployees}
            leaveEmployees={leaveEmployees}
            lateEmployees={lateEmployees}
            alphaEmployees={alphaEmployees}
            attentionItems={attentionItems}
            attentionIndex={attentionIndex}
          />
        </aside>
      </section>

      {/* 2. WORK & INVOICE WARNINGS */}
      <section className="mt-4 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-5">
        {/* Warning Panel: 2/5 */}
        <aside className="min-w-0 xl:col-span-2">
          <WarningsPanel
            warnings={warnings}
            warningsLoading={warningsLoading}
            warningsError={warningsError}
            fetchWarnings={fetchWarnings}
            activeWarningTab={activeWarningTab}
            setActiveWarningTab={setActiveWarningTab}
          />
        </aside>

        {/* Additional Dashboard Content: 3/5 */}
        <aside className="min-w-0 xl:col-span-3">
          <div className="grid h-full min-w-0 gap-3">
            <div className="min-h-0">
              <FinancialSummaryPanel />
            </div>

            <div className="min-h-0">
              <WorkSummaryPanel />
            </div>
          </div>
        </aside>
      </section>

      {/* 3. MODALS */}
      <ModalStageWorkItems
        isOpen={Boolean(selectedStage)}
        onClose={closeStageModal}
        stage={selectedStage}
        healthFilter={selectedHealth}
      />

      <ModalAttendanceEmployees
        isOpen={attendanceModal.isOpen}
        onClose={closeAttendanceModal}
        type={attendanceModal.type}
        employees={attendanceModal.employees}
      />
    </MainLayout>
  );
};

export default Dashboard;
