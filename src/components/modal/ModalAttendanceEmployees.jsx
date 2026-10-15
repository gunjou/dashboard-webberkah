import { useEffect } from "react";
import {
  FiX,
  FiUsers,
  FiClock,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";

const ATTENDANCE_CONFIG = {
  ALL: {
    label: "Semua Pegawai Aktif",
    description: "Daftar seluruh pegawai aktif.",
    icon: FiUsers,
    color: "text-gray-600 bg-gray-100 dark:bg-gray-800",
  },
  PRESENT: {
    label: "Pegawai Hadir",
    description: "Daftar pegawai yang tercatat hadir hari ini.",
    icon: FiUsers,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  },
  LATE: {
    label: "Terlambat",
    description: "Daftar pegawai yang datang terlambat hari ini.",
    icon: FiClock,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  },
  ALPHA: {
    label: "Alpha",
    description: "Daftar pegawai yang tidak hadir tanpa keterangan.",
    icon: FiAlertCircle,
    color: "text-red-600 bg-red-50 dark:bg-red-950/30",
  },
  SAKIT: {
    label: "Sakit",
    description: "Daftar pegawai yang izin karena sakit.",
    icon: FiCalendar,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  },
  IZIN: {
    label: "Izin",
    description: "Daftar pegawai yang sedang izin.",
    icon: FiCalendar,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
  },
  CUTI: {
    label: "Cuti",
    description: "Daftar pegawai yang sedang cuti.",
    icon: FiCalendar,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  },
};

// Sesuai field dari API kehadiran
const getEmployeeName = (employee) =>
  employee.nama_lengkap ||
  employee.nama_panggilan ||
  employee.nama_pegawai ||
  employee.nama ||
  employee.employee_name ||
  employee.name ||
  "Nama tidak tersedia";

const getEmployeeId = (employee) =>
  employee.id_pegawai ??
  employee.id_employee ??
  employee.employee_id ??
  employee.nip ??
  employee.id;

const getEmployeePosition = (employee) =>
  employee.nama_departemen ||
  employee.nama_jabatan ||
  employee.jabatan ||
  employee.position_name ||
  employee.position ||
  "";

const getEmployeeTime = (employee) =>
  employee.jam_checkin ||
  employee.jam_masuk ||
  employee.check_in ||
  employee.attendance_time ||
  employee.waktu_masuk ||
  null;

const getEmployeeNote = (employee) =>
  employee.keterangan || employee.notes || employee.reason || "";

const ModalAttendanceEmployees = ({
  isOpen,
  onClose,
  type = "LATE",
  employees = [],
}) => {
  const config = ATTENDANCE_CONFIG[type] || ATTENDANCE_CONFIG.LATE;
  const Icon = config.icon;
  const employeeList = Array.isArray(employees) ? employees : [];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-modal-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-3 ${config.color}`}>
              <Icon size={21} />
            </div>

            <div>
              <h2
                id="attendance-modal-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                {config.label}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {config.description}
              </p>

              <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                {employeeList.length} pegawai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Employee list */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {employeeList.length > 0 ? (
            <div className="space-y-3">
              {employeeList.map((employee, index) => {
                const employeeKey =
                  getEmployeeId(employee) ?? `${type}-${index}`;
                const time = getEmployeeTime(employee);
                const position = getEmployeePosition(employee);
                const note = getEmployeeNote(employee);

                return (
                  <div
                    key={`${employeeKey}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <FiUsers size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {getEmployeeName(employee)}
                      </p>

                      {employee.nip && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          NIP: {employee.nip}
                        </p>
                      )}

                      {position && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {position}
                        </p>
                      )}

                      {(time || note || employee.status_pegawai) && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {time && (
                            <span className="inline-flex items-center gap-1.5">
                              <FiClock size={13} />
                              {time}
                            </span>
                          )}

                          {note && (
                            <span className="inline-flex items-center gap-1.5">
                              <FiCalendar size={13} />
                              {note}
                            </span>
                          )}

                          {employee.status_pegawai && (
                            <span>Status: {employee.status_pegawai}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-4 text-gray-400 dark:bg-gray-800">
                <FiUsers size={28} />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Tidak ada pegawai
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tidak ada data pegawai dalam kategori{" "}
                {config.label.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-custom-merah px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAttendanceEmployees;
