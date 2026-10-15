import { FiAlertCircle, FiCalendar } from "react-icons/fi";
import AttendanceCarousel from "./AttendanceCarousel";

const AttendancePanel = ({
  attendance,
  attendanceLoading,
  attendanceError,
  fetchAttendance,
  attendanceStats,
  openAttendanceModal,
  activeEmployees,
  presentEmployees,
  leaveEmployees,
  lateEmployees,
  alphaEmployees,
  attentionItems,
  attentionIndex,
}) => {
  return (
    <section className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95">
      {/* Header */}
      <div className="mb-2.5 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <FiCalendar size={17} className="shrink-0 text-blue-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Kehadiran Hari Ini
          </h2>
        </div>

        <div className="rounded-xl border border-red-200/60 bg-red-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-custom-merah-terang shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
          ABSENSI
        </div>
      </div>

      {attendanceLoading && !attendance ? (
        <div
          className="flex flex-1 flex-col animate-pulse"
          role="status"
          aria-label="Memuat data kehadiran"
        >
          {/* Skeleton Statistik Kehadiran */}
          <div className="grid shrink-0 grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[42px] flex-col justify-between rounded-xl border border-gray-100/80 bg-gray-50/70 px-2 py-1.5 dark:border-gray-800/80 dark:bg-gray-800/40"
              >
                <div className="h-2 w-12 max-w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-end">
                  <div className="h-4 w-6 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Pemisah */}
          <div className="my-2 shrink-0 border-t border-gray-100 dark:border-gray-800/80" />

          {/* Skeleton Carousel Perhatian */}
          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/30">
            {/* Header Carousel */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Informasi Pegawai */}
            <div className="flex items-start gap-3">
              <div className="h-5 w-10 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700" />

              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Informasi Tambahan */}
            {/* <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
            </div> */}

            {/* Indikator Carousel */}
            <div className="mt-auto flex justify-center gap-1.5 pt-4">
              <div className="h-1.5 w-5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ) : attendanceError && !attendance ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <FiAlertCircle size={20} className="mb-1 text-red-500" />
          <p className="text-[11px] text-gray-500">{attendanceError}</p>
          <button
            type="button"
            onClick={fetchAttendance}
            className="mt-1 text-[11px] font-bold text-custom-merah-terang hover:underline"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          {/* Summary Compact */}
          <div className="grid shrink-0 grid-cols-3 gap-1.5">
            {attendanceStats.map((stat) => {
              const Icon = stat.icon;

              const attendanceActions = {
                Pegawai: () => openAttendanceModal("ALL", activeEmployees),
                Hadir: () => openAttendanceModal("PRESENT", presentEmployees),
                Izin: () => openAttendanceModal("IZIN", leaveEmployees),
                Sakit: () =>
                  openAttendanceModal(
                    "SAKIT",
                    leaveEmployees.filter(
                      (employee) => employee.status_izin === "SAKIT",
                    ),
                  ),
                Terlambat: () => openAttendanceModal("LATE", lateEmployees),
                Alpha: () => openAttendanceModal("ALPHA", alphaEmployees),
              };

              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={attendanceActions[stat.label]}
                  className="group relative flex flex-col justify-between rounded-xl border border-gray-100/80 bg-gray-50/60 px-2 py-1.5 text-left transition-colors hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-merah-terang dark:border-gray-800/80 dark:bg-gray-800/40 dark:hover:bg-gray-800"
                >
                  <Icon
                    size={11}
                    className={`absolute left-[-2px] top-[-4px] z-10 shrink-0 opacity-80 group-hover:opacity-100 ${stat.color}`}
                  />

                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[8px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {stat.label}
                    </span>

                    <span className="mt-0.5 font-mono text-base font-black leading-none tabular-nums text-gray-800 dark:text-white">
                      {stat.value}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pemisah Tipis */}
          <div className="my-2 shrink-0 border-t border-gray-100 dark:border-gray-800/80" />

          {/* Carousel Terlambat + Alpha */}
          <AttendanceCarousel
            attentionItems={attentionItems}
            attentionIndex={attentionIndex}
          />
        </>
      )}
    </section>
  );
};

export default AttendancePanel;
