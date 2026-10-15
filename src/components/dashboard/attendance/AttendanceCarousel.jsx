import { FiCheckCircle } from "react-icons/fi";

const AttendanceCarousel = ({ attentionItems, attentionIndex }) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="mb-1.5 flex shrink-0 items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Perlu Perhatian
        </p>

        {attentionItems.length > 0 && (
          <span className="font-mono text-[9px] font-bold tabular-nums text-gray-400">
            {attentionIndex + 1}/{attentionItems.length}
          </span>
        )}
      </div>

      {/* Attention Item */}
      {attentionItems.length > 0 ? (
        (() => {
          const item = attentionItems[attentionIndex % attentionItems.length];
          const employee = item.employee;
          const isLate = item.type === "LATE";

          return (
            <div
              key={`${item.type}-${employee.id_pegawai}`}
              className={[
                "relative flex h-[100px] w-full shrink-0 flex-col justify-between rounded-2xl border px-4 py-3 shadow-sm",
                "transition-all duration-300",
                isLate
                  ? "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:border-amber-900/40 dark:bg-amber-950/20"
                  : "border-red-200/80 bg-gradient-to-br from-red-50/80 to-rose-100/30 dark:border-red-900/40 dark:bg-red-950/20",
              ].join(" ")}
            >
              {/* Employee Information */}
              <div className="flex items-center gap-2.5">
                <img
                  src={employee.img_path}
                  alt={employee.nama_lengkap}
                  className="h-9 w-9 shrink-0 rounded-xl border border-white/60 object-cover shadow-xs dark:border-gray-700"
                  onError={(event) => {
                    event.currentTarget.style.visibility = "hidden";
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                    {employee.nama_panggilan || employee.nama_lengkap}
                  </p>

                  <p className="truncate text-[9px] font-medium text-gray-500 dark:text-gray-400">
                    {employee.nama_departemen || "Departemen —"}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-lg px-2 py-0.5 text-[8px] font-extrabold tracking-wide shadow-2xs",
                    isLate
                      ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                      : "bg-red-200/80 text-red-900 dark:bg-red-900/60 dark:text-red-200",
                  ].join(" ")}
                >
                  {isLate ? "TERLAMBAT" : "ALPHA"}
                </span>
              </div>

              {/* Attendance Details */}
              {isLate ? (
                <div className="flex items-end justify-between gap-2 border-t border-amber-200/40 pt-2 dark:border-amber-900/30">
                  <div>
                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                      Keterlambatan
                    </p>

                    <p className="text-base font-black leading-none text-amber-700 dark:text-amber-300">
                      {employee.menit_terlambat ?? 0}
                      <span className="ml-0.5 text-[9px] font-bold">menit</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                      Check-in
                    </p>

                    <p className="font-mono text-xs font-bold tabular-nums text-gray-800 dark:text-white">
                      {employee.jam_checkin || "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-t border-red-200/50 pt-2 dark:border-red-900/30">
                  <p className="text-[10px] font-semibold text-red-600/80 dark:text-red-400">
                    Belum tercatat hadir hari ini
                  </p>
                </div>
              )}

              {/* Carousel Indicators */}
              {attentionItems.length > 1 && (
                <div className="flex justify-center gap-1 pt-1">
                  {attentionItems.map((_, index) => (
                    <span
                      key={index}
                      className={[
                        "h-1 rounded-full transition-all duration-300",
                        index === attentionIndex
                          ? `w-3.5 ${isLate ? "bg-amber-500" : "bg-red-500"}`
                          : "w-1 bg-gray-300 dark:bg-gray-700",
                      ].join(" ")}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        /* Empty State */
        <div className="flex h-[145px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200/80 px-3 text-center dark:border-gray-800">
          <FiCheckCircle size={20} className="mb-1 text-emerald-500" />

          <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">
            Tidak ada perhatian khusus
          </p>

          <p className="text-[9px] text-gray-400">
            Semua pegawai hadir sesuai jadwal
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceCarousel;
