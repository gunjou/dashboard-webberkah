import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Api from "../../utils/Api";

const STAGE_OPTIONS = [
  { value: "IDENTIFIED", label: "Identified" },
  { value: "QUOTATION", label: "Penawaran" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "IN_PROGRESS", label: "Dalam Pengerjaan" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "BA", label: "Berita Acara" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PAYMENT", label: "Pembayaran" },
  { value: "CLOSED", label: "Closed" },
];

const HEALTH_CONFIG = {
  EXPIRED: {
    label: "Terlambat",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
    description: "Deadline telah terlewati.",
  },
  DELAYED: {
    label: "Terlambat",
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
    description: "Pekerjaan melewati target.",
  },
  DUE_SOON: {
    label: "Segera Jatuh Tempo",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
    description: "Deadline sudah mendekat.",
  },
  AT_RISK: {
    label: "Berisiko",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
    description: "Pekerjaan perlu mendapat perhatian.",
  },
  ON_TRACK: {
    label: "ON Track",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
    description: "Pekerjaan masih dalam batas aman.",
  },
};

const formatDate = (value) => {
  if (!value) return "-";

  // Memproses YYYY-MM-DD sebagai tanggal lokal agar tidak bergeser
  // ke hari sebelumnya akibat konversi timezone UTC.
  const datePart = String(value).slice(0, 10);
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") return "0%";

  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";

  return `${number.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })}%`;
};

const formatDaysToDeadline = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const days = Number(value);
  if (!Number.isFinite(days)) return "-";

  if (days < 0) {
    return `${Math.abs(days)} hari terlambat`;
  }

  if (days === 0) {
    return "Jatuh tempo hari ini";
  }

  return `${days} hari lagi`;
};

const getHealthInfo = (item) => {
  const rawStatus =
    typeof item?.health_status === "string"
      ? item.health_status
      : typeof item?.health === "string"
        ? item.health
        : "";

  const status = rawStatus.trim().toUpperCase();
  const config = HEALTH_CONFIG[status];

  if (!config) return null;

  const days =
    item?.days_to_deadline === null ||
    item?.days_to_deadline === undefined ||
    item?.days_to_deadline === ""
      ? null
      : Number(item.days_to_deadline);

  let description = config.description;

  if (Number.isFinite(days)) {
    if (days < 0) {
      description = `Deadline terlewati ${Math.abs(days)} hari.`;
    } else if (days === 0) {
      description = "Deadline jatuh tempo hari ini.";
    } else {
      description = `${days} hari menuju deadline.`;
    }
  }

  return {
    ...config,
    status,
    description,
  };
};

const getStageLabel = (stage) => {
  return (
    STAGE_OPTIONS.find((option) => option.value === stage)?.label ||
    String(stage || "-").replaceAll("_", " ")
  );
};

const getStageClass = (stage) => {
  const classes = {
    IDENTIFIED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    QUOTATION:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    CONTRACT:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    IN_PROGRESS:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
    COMPLETED:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    BA: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    INVOICE:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    PAYMENT:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    CLOSED:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  };

  return (
    classes[stage] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
  );
};

const DetailField = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 break-words text-xs font-semibold text-gray-800 dark:text-gray-100">
      {value === null || value === undefined || value === "" ? "-" : value}
    </p>
  </div>
);

const DetailSection = ({ title, children, className = "" }) => (
  <section
    className={`rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 ${className}`}
  >
    <h3 className="mb-3 text-xs font-black text-gray-800 dark:text-gray-100">
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  </section>
);

const HealthBadge = ({ item }) => {
  const health = getHealthInfo(item);

  if (!health) {
    return (
      <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
        Belum tersedia
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${health.className}`}
      >
        {health.label}
      </span>
      <p className="text-[10px] text-gray-500 dark:text-gray-400">
        {health.description}
      </p>
    </div>
  );
};

const ModalWorkItemList = ({ isOpen, onClose }) => {
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  // Mengambil data monitoring dan meratakan items dari semua stage.
  const fetchWorkItems = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await Api.get("/work-item/dashboard/summary");

      // Axios: response.data adalah objek respons dari backend.
      const payload = response?.data;
      const stages = payload?.data?.stages;

      if (payload?.success === false) {
        throw new Error(
          payload?.message || "Gagal mengambil data monitoring pekerjaan.",
        );
      }

      if (!Array.isArray(stages)) {
        throw new Error(
          "Format data API tidak sesuai: data.stages tidak ditemukan.",
        );
      }

      const items = stages.flatMap((stage) =>
        Array.isArray(stage?.items)
          ? stage.items.map((item) => ({
              ...item,
              // Gunakan stage dari item sebagai sumber utama.
              current_stage: item.current_stage || stage.stage,
            }))
          : [],
      );

      setWorkItems(items);

      // Jika item yang sedang dibuka tidak lagi tersedia, tutup detailnya.
      setExpandedId((currentId) =>
        items.some((item) => item.id_work_item === currentId)
          ? currentId
          : null,
      );
    } catch (err) {
      console.error("Gagal mengambil daftar pekerjaan:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat daftar pekerjaan. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchWorkItems();
    }
  }, [isOpen, fetchWorkItems]);

  // Semua filter menggunakan array hasil flatten dari API.
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return workItems.filter((item) => {
      const matchesType = typeFilter === "ALL" || item.work_type === typeFilter;

      const matchesStage =
        stageFilter === "ALL" || item.current_stage === stageFilter;

      const searchableText = [
        item.work_number,
        item.work_name,
        item.client_name,
        item.internal_pic_name,
        item.client_pic_name,
        item.contract_number,
        item.invoice_number,
        item.proposal_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchableText.includes(keyword);

      return matchesType && matchesStage && matchesSearch;
    });
  }, [workItems, search, typeFilter, stageFilter]);

  const handleClose = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStageFilter("ALL");
    setExpandedId(null);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-item-modal-title"
        className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl dark:border-gray-700 dark:bg-gray-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang dark:bg-[#A77F60]/20 dark:text-[#D6B69A]">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h2
                id="work-item-modal-title"
                className="text-sm font-black text-gray-900 dark:text-gray-100 sm:text-base"
              >
                Monitoring Pekerjaan
              </h2>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Daftar pekerjaan, informasi kontrak, dan status health.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => fetchWorkItems({ silent: true })}
              disabled={loading || refreshing}
              title="Refresh data"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Tutup modal"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_180px_200px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari pekerjaan, klien, kontrak..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#A77F60] focus:ring-2 focus:ring-[#A77F60]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-[#A77F60] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="TENDER">Tender</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            <select
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-700 outline-none focus:border-[#A77F60] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="ALL">Semua Tahap</option>
              {STAGE_OPTIONS.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                />
                <p className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchWorkItems()}
                className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                Daftar Pekerjaan
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {loading
                  ? "Memuat data..."
                  : `${filteredItems.length} pekerjaan`}
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6">
                <RefreshCw size={22} className="animate-spin text-[#8A5F41]" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Memuat data pekerjaan...
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
                <Search
                  size={25}
                  className="text-gray-300 dark:text-gray-600"
                />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  Tidak ada pekerjaan ditemukan
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Coba ubah kata kunci atau filter yang digunakan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                      {[
                        "#",
                        "Pekerjaan",
                        "Klien",
                        "Jenis",
                        "Tahap",
                        "Progress",
                        "Target Selesai",
                        "Kondisi",
                        "",
                      ].map((heading, index) => (
                        <th
                          key={`${heading}-${index}`}
                          className="whitespace-nowrap px-4 py-3 text-[10px] font-black uppercase tracking-wide text-gray-500 dark:text-gray-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredItems.map((item, index) => {
                      const isExpanded = expandedId === item.id_work_item;
                      const health = getHealthInfo(item);

                      return (
                        <>
                          <tr
                            key={item.id_work_item}
                            onClick={() =>
                              setExpandedId((currentId) =>
                                currentId === item.id_work_item
                                  ? null
                                  : item.id_work_item,
                              )
                            }
                            className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                              isExpanded ? "bg-gray-50 dark:bg-gray-800/60" : ""
                            }`}
                          >
                            <td className="px-4 py-4 text-xs text-gray-400">
                              {index + 1}
                            </td>

                            <td className="max-w-[260px] px-4 py-4">
                              <p className="break-words text-xs font-bold text-gray-800 dark:text-gray-100">
                                {item.work_name || "-"}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                {item.work_number || "-"}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-300">
                              {item.client_name || "-"}
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                {item.work_type || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold ${getStageClass(item.current_stage)}`}
                              >
                                {getStageLabel(item.current_stage)}
                              </span>
                            </td>

                            <td className="min-w-[130px] px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                  <div
                                    className="h-full rounded-full bg-custom-merah-terang"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          Number(item.progress_percent) || 0,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                  {formatPercent(item.progress_percent)}
                                </span>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-600 dark:text-gray-300">
                              {formatDate(item.target_end_date)}
                            </td>

                            <td className="px-4 py-4">
                              {health ? (
                                <span
                                  className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${health.className}`}
                                >
                                  {health.label}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  Belum tersedia
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-gray-400">
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`${item.id_work_item}-detail`}>
                              <td
                                colSpan={9}
                                className="bg-gray-50/80 px-3 py-4 dark:bg-gray-800/30 sm:px-5"
                              >
                                <div className="space-y-4">
                                  {/* Health Monitoring */}
                                  <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-4 flex items-center gap-2">
                                      <AlertCircle
                                        size={16}
                                        className="text-amber-600 dark:text-amber-400"
                                      />
                                      <h3 className="text-xs font-black text-gray-800 dark:text-gray-100">
                                        Health Monitoring
                                      </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                      <div>
                                        <p className="mb-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                          Status Health
                                        </p>
                                        <HealthBadge item={item} />
                                      </div>

                                      <DetailField
                                        label="Tanggal Deadline"
                                        value={formatDate(item.deadline_date)}
                                      />

                                      <DetailField
                                        label="Sisa / Keterlambatan"
                                        value={formatDaysToDeadline(
                                          item.days_to_deadline,
                                        )}
                                      />
                                    </div>
                                  </section>

                                  {/* Informasi Pekerjaan */}
                                  <DetailSection title="Informasi Pekerjaan">
                                    <DetailField
                                      label="Nomor Pekerjaan"
                                      value={item.work_number}
                                    />
                                    <DetailField
                                      label="Nama Pekerjaan"
                                      value={item.work_name}
                                    />
                                    <DetailField
                                      label="Klien"
                                      value={item.client_name}
                                    />
                                    <DetailField
                                      label="Jenis Pekerjaan"
                                      value={item.work_type}
                                    />
                                    <DetailField
                                      label="PIC Internal"
                                      value={item.internal_pic_name}
                                    />
                                    <DetailField
                                      label="PIC Klien"
                                      value={item.client_pic_name}
                                    />
                                    <DetailField
                                      label="Tanggal Mulai Pekerjaan"
                                      value={formatDate(item.start_date)}
                                    />
                                    <DetailField
                                      label="Target Selesai Pekerjaan"
                                      value={formatDate(item.target_end_date)}
                                    />
                                    <DetailField
                                      label="Progress"
                                      value={formatPercent(
                                        item.progress_percent,
                                      )}
                                    />
                                    <DetailField
                                      label="Tanggal Selesai Aktual"
                                      value={formatDate(item.completion_date)}
                                    />
                                    <DetailField
                                      label="Tahap Saat Ini"
                                      value={getStageLabel(item.current_stage)}
                                    />
                                  </DetailSection>

                                  {/* Informasi Kontrak */}
                                  <DetailSection
                                    title="Informasi Kontrak"
                                    className="border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-950/20"
                                  >
                                    <DetailField
                                      label="Nomor Kontrak"
                                      value={item.contract_number}
                                    />
                                    <DetailField
                                      label="Tanggal Kontrak"
                                      value={formatDate(item.contract_date)}
                                    />
                                    <DetailField
                                      label="Awal Kontrak"
                                      value={formatDate(
                                        item.contract_start_date,
                                      )}
                                    />
                                    <DetailField
                                      label="Akhir Kontrak"
                                      value={formatDate(item.contract_end_date)}
                                    />
                                  </DetailSection>

                                  {/* Informasi Penawaran */}
                                  <DetailSection title="Informasi Penawaran">
                                    <DetailField
                                      label="Nomor Penawaran"
                                      value={item.proposal_number}
                                    />
                                    <DetailField
                                      label="Tanggal Penawaran"
                                      value={formatDate(item.proposal_date)}
                                    />
                                    <DetailField
                                      label="Berlaku Sampai"
                                      value={formatDate(item.valid_until)}
                                    />
                                  </DetailSection>

                                  {/* Informasi Invoice */}
                                  <DetailSection title="Informasi Invoice">
                                    <DetailField
                                      label="Nomor Invoice"
                                      value={item.invoice_number}
                                    />
                                    <DetailField
                                      label="Tanggal Invoice"
                                      value={formatDate(item.invoice_date)}
                                    />
                                    <DetailField
                                      label="Jatuh Tempo Invoice"
                                      value={formatDate(item.invoice_due_date)}
                                    />
                                  </DetailSection>

                                  {/* Catatan */}
                                  <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-2 flex items-center gap-2">
                                      <FileText
                                        size={14}
                                        className="text-gray-500"
                                      />
                                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        Catatan
                                      </p>
                                    </div>
                                    <p className="whitespace-pre-wrap break-words text-xs leading-5 text-gray-700 dark:text-gray-300">
                                      {item.notes || "-"}
                                    </p>
                                  </section>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-gray-500 dark:text-gray-400">
            <CalendarDays size={13} className="mt-0.5 shrink-0" />
            <p>
              Klik salah satu baris untuk melihat detail pekerjaan, periode
              kontrak, dan informasi health monitoring.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Menampilkan {filteredItems.length} pekerjaan
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-custom-merah-terang px-4 py-2 text-xs font-bold text-white transition hover:bg-custom-merah"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalWorkItemList;
