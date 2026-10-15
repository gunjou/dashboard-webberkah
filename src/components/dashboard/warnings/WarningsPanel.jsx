import { useCallback, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import WarningItem from "./WarningItem";

const WarningPanel = ({
  warnings,
  warningsLoading,
  warningsError,
  fetchWarnings,
  activeWarningTab,
  setActiveWarningTab,
}) => {
  const currentWarnings = warnings?.[activeWarningTab];
  const warningItems = currentWarnings?.items ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("down");

  const isExpired = activeWarningTab === "EXPIRED";

  const changeIndex = useCallback(
    (nextIndex, nextDirection = "down") => {
      if (!warningItems.length) return;

      setDirection(nextDirection);
      setActiveIndex((nextIndex + warningItems.length) % warningItems.length);
    },
    [warningItems.length],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [activeWarningTab, warningItems.length]);

  useEffect(() => {
    if (warningsLoading || warningsError || warningItems.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setDirection("down");
      setActiveIndex((current) => (current + 1) % warningItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeWarningTab, warningItems.length, warningsLoading, warningsError]);

  const handleTabChange = (tab) => {
    setActiveWarningTab(tab);
    setActiveIndex(0);
  };

  const currentItem = warningItems[activeIndex];

  return (
    <section className="h-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:p-5">
      {/* Compact Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FiAlertCircle size={17} className="shrink-0 text-red-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Warning Pekerjaan
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => handleTabChange("EXPIRED")}
              className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-bold transition ${
                activeWarningTab === "EXPIRED"
                  ? "bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <FiAlertCircle size={11} />
              Expired
              <span>{warnings?.EXPIRED?.total ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("DUE_SOON")}
              className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-bold transition ${
                activeWarningTab === "DUE_SOON"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-gray-700 dark:text-amber-400"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <FiClock size={11} />
              Due Soon
              <span>{warnings?.DUE_SOON?.total ?? 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning Content */}
      {warningsLoading ? (
        <div
          className="animate-pulse rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/30"
          role="status"
          aria-label="Memuat warning pekerjaan"
        >
          {/* Header Skeleton */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Work Name Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-4/5 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-3/5 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Invoice Details Skeleton */}
          <div className="mt-3 rounded-lg bg-white/80 p-3 dark:bg-gray-900/70">
            <div className="flex items-center justify-between gap-3">
              <div className="h-3 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="h-3 w-16 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Progress Skeleton */}
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-3 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-8 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ) : warningsError ? (
        <div className="rounded-xl bg-red-50 px-3 py-5 text-center dark:bg-red-950/20">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {warningsError}
          </p>

          <button
            type="button"
            onClick={fetchWarnings}
            className="mt-2 text-xs font-bold text-red-600 underline dark:text-red-400"
          >
            Coba lagi
          </button>
        </div>
      ) : warningItems.length === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 py-5 text-center dark:border-gray-700">
          <FiCheckCircle size={22} className="text-emerald-500" />

          <p className="mt-2 text-xs font-bold text-gray-800 dark:text-white">
            Tidak ada warning
          </p>

          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            {isExpired
              ? "Tidak ada pekerjaan atau invoice yang melewati tenggat."
              : "Tidak ada pekerjaan atau invoice yang mendekati tenggat."}
          </p>
        </div>
      ) : (
        <div className="flex min-w-0 items-stretch gap-2">
          {/* Vertical Indicator and Controls */}
          <div className="flex w-5 shrink-0 flex-col items-center">
            <button
              type="button"
              onClick={() => changeIndex(activeIndex - 1, "up")}
              aria-label="Warning sebelumnya"
              disabled={warningItems.length <= 1}
              className="rounded p-0.5 text-gray-400 transition hover:text-gray-700 disabled:opacity-30 dark:hover:text-white"
            >
              <FiChevronUp size={15} />
            </button>

            <div className="my-1 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5">
              {warningItems.map((item, index) => (
                <button
                  key={`${item.warning_type}-${item.id_work_item}-${item.id_invoice ?? "work"}`}
                  type="button"
                  onClick={() =>
                    changeIndex(index, index < activeIndex ? "up" : "down")
                  }
                  aria-label={`Lihat warning ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? `h-6 ${isExpired ? "bg-red-500" : "bg-amber-500"}`
                      : "h-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => changeIndex(activeIndex + 1, "down")}
              aria-label="Warning berikutnya"
              disabled={warningItems.length <= 1}
              className="rounded p-0.5 text-gray-400 transition hover:text-gray-700 disabled:opacity-30 dark:hover:text-white"
            >
              <FiChevronDown size={15} />
            </button>
          </div>

          {/* Single Warning Item */}
          <div className="min-w-0 flex-1">
            <div
              key={`${activeWarningTab}-${activeIndex}`}
              className={`animate-in fade-in duration-300 ${
                direction === "down"
                  ? "slide-in-from-bottom-2"
                  : "slide-in-from-top-2"
              }`}
            >
              <WarningItem
                item={currentItem}
                activeWarningTab={activeWarningTab}
              />
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[10px] text-gray-400">
                Warning {activeIndex + 1} dari {warningItems.length}
              </span>

              {warningItems.length > 1 && (
                <span className="text-[10px] text-gray-400">
                  Berganti otomatis
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WarningPanel;
