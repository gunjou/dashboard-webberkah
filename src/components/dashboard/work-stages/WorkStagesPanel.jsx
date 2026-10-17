import { FiGitBranch, FiArrowRight } from "react-icons/fi";

import WorkStageCards from "./WorkStageCards";
import ModalWorkItemList from "../../modal/ModalWorkItemList";
import { useState } from "react";

const WorkStagesPanel = ({ summary, openStageModal, loading }) => {
  const [isWorkListOpen, setIsWorkListOpen] = useState(false);

  return (
    <>
      <section className="min-h-[160px] min-w-0 space-y-4">
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-2">
              <FiGitBranch size={17} className="shrink-0 text-amber-500" />

              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Tahapan Pekerjaan
              </h2>

              <span className="whitespace-nowrap rounded-xl border border-custom-merah-terang bg-custom-merah-terang/10 px-2 py-1 text-xs font-black text-custom-merah-terang tabular-nums">
                {loading ? "—" : (summary?.total_active ?? 0)} Aktif
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsWorkListOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-custom-merah-terang hover:bg-custom-merah-terang/5 hover:text-custom-merah-terang focus:outline-none focus:ring-2 focus:ring-custom-merah-terang/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-custom-merah-terang dark:hover:text-custom-merah-terang sm:text-sm"
            >
              Detail
              <FiArrowRight size={14} />
            </button>
          </div>

          <WorkStageCards
            summary={summary}
            openStageModal={openStageModal}
            loading={loading}
          />
        </div>
      </section>

      <ModalWorkItemList
        isOpen={isWorkListOpen}
        onClose={() => setIsWorkListOpen(false)}
      />
    </>
  );
};

export default WorkStagesPanel;
