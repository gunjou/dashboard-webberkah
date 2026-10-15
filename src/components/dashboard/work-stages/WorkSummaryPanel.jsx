import { useEffect, useState } from "react";
import Api from "../../../utils/Api";
import { FiPieChart } from "react-icons/fi";

const WorkSummaryPanel = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await Api.get("/work-item/dashboard/summary");
      const result = response?.data;

      if (result?.success === false) {
        throw new Error(
          result.message || "Gagal mengambil monitoring pekerjaan.",
        );
      }

      setSummary(result?.data ?? result);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil monitoring pekerjaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const total = summary?.total_active ?? 0;

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:p-5">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiPieChart size={17} className="shrink-0 text-purple-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Sebaran Pekerjaan
          </h2>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Tender
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Maintenance
          </span>
        </div>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400">
          <span className="truncate">{error}</span>
          <button
            type="button"
            onClick={fetchSummary}
            className="shrink-0 font-semibold"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center gap-2">
          {loading && !summary ? (
            <>
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 flex-1 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </>
          ) : (
            <>
              <div className="w-8 shrink-0 text-left">
                <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">
                  {summary?.tender ?? 0}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {(total > 0
                    ? ((summary?.tender ?? 0) / total) * 100
                    : 0
                  ).toFixed(0)}
                  %
                </p>
              </div>

              <div className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                {total > 0 && (
                  <>
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${((summary?.tender ?? 0) / total) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${((summary?.maintenance ?? 0) / total) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>

              <div className="w-8 shrink-0 text-right">
                <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white">
                  {summary?.maintenance ?? 0}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {(total > 0
                    ? ((summary?.maintenance ?? 0) / total) * 100
                    : 0
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default WorkSummaryPanel;
