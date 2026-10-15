import React from "react";
import { FiGitBranch } from "react-icons/fi";

const WorkStagesPanel = ({ summary, openStageModal, loading }) => {
  const stages = summary?.stages || [];
  return (
    <section className="min-w-0 space-y-4 xl:col-span-3">
      <div className="h-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
          {/* Judul di Kiri */}
          <div className="flex items-center gap-2">
            <FiGitBranch size={17} className="shrink-0 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Tahapan Pekerjaan
            </h2>
          </div>

          {/* Total Pekerjaan Aktif di Kanan */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-gray-50/80 px-4 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Total Pekerjaan Aktif:
            </span>
            <span className="font-mono text-base font-black text-custom-merah-terang tabular-nums sm:text-lg">
              {summary?.total_active ?? 0}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-stretch gap-1">
            {stages.map((stage, index) => {
              const expired = stage.health?.EXPIRED ?? 0;
              const dueSoon = stage.health?.DUE_SOON ?? 0;
              const onTrack = stage.health?.ON_TRACK ?? 0;

              return (
                <div
                  key={stage.stage}
                  onClick={() => openStageModal(stage)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat pekerjaan tahap ${stage.label}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openStageModal(stage);
                    }
                  }}
                  className={[
                    "relative flex h-[145px] w-[145px] shrink-0 flex-col justify-between",
                    "px-4 py-3 sm:w-[138px]",
                    index === 0 ? "pl-3" : "pl-6",
                    index === stages.length - 1 ? "pr-3" : "pr-5",
                    "bg-gray-50/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-200",
                    "transition-colors",
                    stage.total > 0 ? "bg-red-50/90 dark:bg-red-950/40" : "",
                  ].join(" ")}
                  style={{
                    clipPath:
                      index === 0
                        ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
                  }}
                >
                  {/* Total dan nama stage */}
                  <span className="text-3xl pb-1 font-extrabold leading-none tabular-nums text-gray-900 dark:text-white">
                    {loading ? "—" : (stage.total ?? 0)}
                  </span>

                  {/* Health Warning Badges */}
                  {!loading && (expired > 0 || dueSoon > 0 || onTrack > 0) && (
                    <div className="flex min-h-6 flex-wrap items-center gap-1">
                      {expired > 0 && (
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            openStageModal(stage, "EXPIRED");
                          }}
                          title={`${expired} pekerjaan melewati batas waktu`}
                          className="inline-flex max-w-full items-center gap-1 rounded-md border border-red-200 bg-red-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-red-700 dark:border-red-900 dark:bg-red-950/70 dark:text-red-300"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                          <span className="truncate">EXPIRED</span>
                          <span>{expired}</span>
                        </span>
                      )}

                      {dueSoon > 0 && (
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            openStageModal(stage, "DUE_SOON");
                          }}
                          title={`${dueSoon} pekerjaan mendekati batas waktu`}
                          className="inline-flex max-w-full items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-amber-800 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span className="truncate">DUE SOON</span>
                          <span>{dueSoon}</span>
                        </span>
                      )}

                      {onTrack > 0 && (
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            openStageModal(stage, "ON_TRACK");
                          }}
                          title={`${onTrack} pekerjaan berjalan sesuai jadwal`}
                          className="inline-flex max-w-full items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="truncate">ON TRACK</span>
                          <span>{onTrack}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <span className="mt-2 truncate text-md font-bold sm:text-sm">
                    {stage.label}
                  </span>
                </div>
              );
            })}

            {loading && stages.length === 0 && (
              <div
                className="flex min-w-max items-stretch gap-1"
                aria-label="Memuat tahapan pekerjaan"
                role="status"
              >
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex h-[145px] w-[145px] shrink-0 animate-pulse flex-col justify-between bg-gray-50 px-4 py-3 dark:bg-gray-800/80"
                    style={{
                      clipPath:
                        index === 0
                          ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                          : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
                    }}
                  >
                    {/* Skeleton Total */}
                    <div className="h-8 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />

                    {/* Skeleton Health Badges */}
                    <div className="flex flex-wrap gap-1">
                      <div className="h-5 w-14 rounded-md bg-gray-200 dark:bg-gray-700" />
                      <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Skeleton Stage Name */}
                    <div className="h-4 w-24 max-w-full rounded-md bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkStagesPanel;
