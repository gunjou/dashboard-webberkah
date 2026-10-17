const WorkStageCards = ({ summary, openStageModal, loading }) => {
  const stages = summary?.stages ?? [];

  return (
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
                "relative flex h-[145px] w-[145px] shrink-0 cursor-pointer flex-col justify-between",
                "px-4 py-3 sm:w-[138px]",
                index === 0 ? "pl-3" : "pl-6",
                index === stages.length - 1 ? "pr-3" : "pr-5",
                "bg-gray-50/80 text-gray-700 transition-colors hover:brightness-[0.98] dark:bg-gray-800/80 dark:text-gray-200",
                stage.total > 0 ? "bg-red-50/90 dark:bg-red-950/40" : "",
              ].join(" ")}
              style={{
                clipPath:
                  index === 0
                    ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                    : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
              }}
            >
              <span className="pb-1 text-3xl font-extrabold leading-none tabular-nums text-gray-900 dark:text-white">
                {loading ? "—" : (stage.total ?? 0)}
              </span>

              {!loading && (expired > 0 || dueSoon > 0 || onTrack > 0) && (
                <div className="flex min-h-6 flex-wrap items-center gap-1">
                  {expired > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openStageModal(stage, "EXPIRED");
                      }}
                      title={`${expired} pekerjaan melewati batas waktu`}
                      className="inline-flex max-w-full items-center gap-1 rounded-md border border-red-200 bg-red-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-red-700 dark:border-red-900 dark:bg-red-950/70 dark:text-red-300"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                      EXPIRED {expired}
                    </button>
                  )}

                  {dueSoon > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openStageModal(stage, "DUE_SOON");
                      }}
                      title={`${dueSoon} pekerjaan mendekati batas waktu`}
                      className="inline-flex max-w-full items-center gap-1 rounded-md border border-amber-200 bg-amber-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-amber-800 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      DUE SOON {dueSoon}
                    </button>
                  )}

                  {onTrack > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openStageModal(stage, "ON_TRACK");
                      }}
                      title={`${onTrack} pekerjaan berjalan sesuai jadwal`}
                      className="inline-flex max-w-full items-center gap-1 rounded-md border border-emerald-200 bg-emerald-100 px-1.5 py-1 text-[9px] font-extrabold leading-none text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      ON TRACK {onTrack}
                    </button>
                  )}
                </div>
              )}

              <span className="mt-2 truncate text-sm font-bold">
                {stage.label}
              </span>
            </div>
          );
        })}

        {loading &&
          stages.length === 0 &&
          Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-[145px] w-[145px] shrink-0 animate-pulse bg-gray-100 px-4 py-3 dark:bg-gray-800"
              style={{
                clipPath:
                  index === 0
                    ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                    : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)",
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default WorkStageCards;
