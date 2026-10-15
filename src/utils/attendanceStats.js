// helpers/attendanceStats.js

import {
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

export const getAttendanceStats = (
  attendanceSummary,
  leaveCount = 0,
  sickCount = 0,
) => [
  {
    label: "Pegawai",
    value: attendanceSummary?.total_pegawai_aktif ?? 0,
    icon: FiUsers,
    color: "text-gray-600 dark:text-gray-300",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
  {
    label: "Hadir",
    value: attendanceSummary?.total_hadir ?? 0,
    icon: FiCheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    label: "Izin",
    value: leaveCount,
    icon: FiCalendar,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    label: "Sakit",
    value: sickCount,
    icon: FiAlertCircle,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    label: "Terlambat",
    value: attendanceSummary?.total_terlambat ?? 0,
    icon: FiClock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    label: "Alpha",
    value: attendanceSummary?.total_alpha ?? 0,
    icon: FiAlertCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
];
