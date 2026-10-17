import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  BriefcaseBusiness,
  CalendarDays,
  UserRound,
  Building2,
  CircleAlert,
  ClipboardList,
} from "lucide-react";

import Api from "../utils/Api";

const STAGE_LABELS = {
  IDENTIFIED: "Identifikasi",

  QUOTATION: "Penawaran",

  CONTRACT: "Kontrak",

  IN_PROGRESS: "Dalam Pengerjaan",

  COMPLETED: "Selesai Dikerjakan",

  BA: "Berita Acara",

  INVOICE: "Invoice",

  PAYMENT: "Pembayaran",

  CLOSED: "Closed",
};

const STAGE_STYLES = {
  IDENTIFIED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",

  QUOTATION: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",

  CONTRACT:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",

  IN_PROGRESS:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",

  COMPLETED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",

  BA: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",

  INVOICE:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",

  PAYMENT:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",

  CLOSED:
    "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(date);
};

const formatPercent = (value) => {
  const number = Number(value ?? 0);

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(number)}%`;
};

const getStageLabel = (stage) => {
  if (!stage) return "-";

  return STAGE_LABELS[stage] ?? stage.replaceAll("_", " ");
};

const getStageStyle = (stage) => {
  return (
    STAGE_STYLES[stage] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  );
};

const getHealthInfo = (item) => {
  const health = String(item.health_status ?? item.health ?? "").toUpperCase();

  if (health === "DELAYED" || health === "TERLAMBAT") {
    return {
      label: "Terlambat",

      className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    };
  }

  if (health === "AT_RISK" || health === "BERISIKO") {
    return {
      label: "Berisiko",

      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }

  if (health === "ON_TRACK" || health === "AMAN") {
    return {
      label: "Sesuai Target",

      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    };
  }

  return null;
};

const WorkItemListPage = () => {
  const [workItems, setWorkItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [stageFilter, setStageFilter] = useState("ALL");

  const [expandedItems, setExpandedItems] = useState({});

  const fetchWorkItems = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await Api.get("/work-item/dashboard/summary");

      const payload = response?.data;

      // Mendukung beberapa bentuk respons API.

      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.work_items)
            ? payload.work_items
            : Array.isArray(payload?.items)
              ? payload.items
              : [];

      setWorkItems(items);
    } catch (err) {
      console.error("Gagal mengambil daftar pekerjaan:", err);

      setError(
        err?.response?.data?.message ||
          "Gagal memuat daftar pekerjaan. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return workItems.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.work_number,

          item.work_name,

          item.client_name,

          item.internal_pic_name,

          item.client_pic_name,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()

            .includes(keyword),
        );

      const matchesType =
        typeFilter === "ALL" ||
        String(item.work_type ?? "").toUpperCase() === typeFilter;

      const matchesStage =
        stageFilter === "ALL" ||
        String(item.current_stage ?? "").toUpperCase() === stageFilter;

      return matchesSearch && matchesType && matchesStage;
    });
  }, [workItems, search, typeFilter, stageFilter]);

  const toggleExpanded = (id) => {
    setExpandedItems((previous) => ({
      ...previous,

      [id]: !previous[id],
    }));
  };

  const totalItems = filteredItems.length;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden text-gray-800 dark:text-gray-100">
      {/* Filter dan pencarian */}

      <section className="shrink-0 space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <BriefcaseBusiness size={17} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black text-gray-900 dark:text-white">
                Daftar Pekerjaan
              </h2>

              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Monitoring pekerjaan berdasarkan tahap proses.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchWorkItems({ silent: true })}
            disabled={loading || refreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />

            <span>{refreshing ? "Memuat..." : "Refresh"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px_180px]">
          <div className="relative min-w-0">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor, nama pekerjaan, klien..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="ALL">Semua Jenis</option>

            <option value="TENDER">Tender</option>

            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="ALL">Semua Tahap</option>

            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Pesan error tetap berada di dalam layout, bukan di luar area modal. */}

      {error && (
        <div
          role="alert"
          className="mb-3 flex shrink-0 items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          <CircleAlert size={15} className="mt-0.5 shrink-0" />

          <span className="min-w-0 flex-1">{error}</span>

          <button
            type="button"
            onClick={() => fetchWorkItems()}
            className="shrink-0 font-bold underline underline-offset-2"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Kartu tabel: mengambil sisa tinggi yang tersedia. */}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Header tabel */}

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:px-4">
          <div className="flex items-center gap-2">
            <ClipboardList
              size={16}
              className="text-amber-700 dark:text-amber-400"
            />

            <span className="text-xs font-black text-gray-800 dark:text-gray-100">
              Data Pekerjaan
            </span>
          </div>

          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {totalItems} pekerjaan
          </span>
        </div>

        {/* Hanya area ini yang melakukan scroll. */}

        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="w-10 px-3 py-3 text-center text-[10px] font-black uppercase tracking-wide text-gray-500">
                  #
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Pekerjaan
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Klien
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Jenis
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Tahap
                </th>

                <th className="w-44 px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Progress
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Target Selesai
                </th>

                <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500">
                  Kondisi
                </th>

                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <RefreshCw size={15} className="animate-spin" />
                      Memuat daftar pekerjaan...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ClipboardList size={28} strokeWidth={1.5} />

                      <p className="text-xs font-semibold">
                        {error
                          ? "Data belum dapat ditampilkan."
                          : "Tidak ada pekerjaan yang sesuai dengan filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const itemId = item.id_work_item ?? item.work_number ?? index;

                  const isExpanded = Boolean(expandedItems[itemId]);

                  const progress = Math.min(
                    100,

                    Math.max(0, Number(item.progress_percent ?? 0)),
                  );

                  const health = getHealthInfo(item);

                  return (
                    <Fragment key={itemId}>
                      <tr
                        key={itemId}
                        className="transition hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-3 py-3 text-center text-[11px] text-gray-400">
                          {index + 1}
                        </td>

                        <td className="max-w-[280px] px-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-black text-gray-800 dark:text-gray-100">
                              {item.work_name || "-"}
                            </p>

                            <p className="mt-1 truncate font-mono text-[10px] text-gray-500">
                              {item.work_number || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="max-w-[200px] px-3 py-3">
                          <div className="flex min-w-0 items-start gap-1.5">
                            <Building2
                              size={13}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <span className="truncate text-[11px] text-gray-600 dark:text-gray-300">
                              {item.client_name || "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-black ${
                              String(item.work_type).toUpperCase() === "TENDER"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                            }`}
                          >
                            {item.work_type || "-"}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-bold ${getStageStyle(
                              item.current_stage,
                            )}`}
                          >
                            {getStageLabel(item.current_stage)}
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-amber-600 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <span className="w-10 text-right text-[10px] font-bold tabular-nums text-gray-600 dark:text-gray-300">
                              {formatPercent(progress)}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300">
                            <CalendarDays
                              size={13}
                              className="shrink-0 text-gray-400"
                            />

                            {formatDate(item.target_end_date)}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          {health ? (
                            <span
                              className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-bold ${health.className}`}
                            >
                              {health.label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(itemId)}
                            aria-label={
                              isExpanded
                                ? "Tutup detail pekerjaan"
                                : "Lihat detail pekerjaan"
                            }
                            aria-expanded={isExpanded}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
                          >
                            {isExpanded ? (
                              <ChevronDown size={15} />
                            ) : (
                              <ChevronRight size={15} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr
                          key={`${itemId}-detail`}
                          className="bg-gray-50/70 dark:bg-gray-800/30"
                        >
                          <td colSpan={9} className="px-5 py-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">
                                  PIC Internal
                                </p>

                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-200">
                                  <UserRound
                                    size={13}
                                    className="shrink-0 text-gray-400"
                                  />

                                  {item.internal_pic_name || "-"}
                                </div>
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">
                                  PIC Klien
                                </p>

                                <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-200">
                                  {item.client_pic_name || "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">
                                  Tanggal Mulai
                                </p>

                                <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-200">
                                  {formatDate(item.start_date)}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">
                                  Tanggal Selesai
                                </p>

                                <p className="mt-1 text-[11px] text-gray-700 dark:text-gray-200">
                                  {formatDate(item.completion_date)}
                                </p>
                              </div>

                              <div className="sm:col-span-2 lg:col-span-4">
                                <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">
                                  Catatan
                                </p>

                                <p className="mt-1 whitespace-pre-wrap break-words text-[11px] text-gray-600 dark:text-gray-300">
                                  {item.notes || "Tidak ada catatan."}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tetap di bawah; tidak ikut scroll tabel. */}

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-3 py-2.5 dark:border-gray-800 sm:px-4">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Menampilkan{" "}
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {filteredItems.length}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {workItems.length}
            </span>{" "}
            pekerjaan
          </p>

          {(search || typeFilter !== "ALL" || stageFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");

                setTypeFilter("ALL");

                setStageFilter("ALL");
              }}
              className="text-[10px] font-bold text-amber-700 hover:underline dark:text-amber-400"
            >
              Reset filter
            </button>
          )}
        </footer>
      </section>
    </div>
  );
};

export default WorkItemListPage;
