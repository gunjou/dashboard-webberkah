import { useEffect, useState } from "react";
import {
  FiFileText,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import Api from "../../../utils/Api";
import { formatCurrency } from "../../../utils/helper";
import ModalFinancialItems from "../../modal/ModalFinancialItems";

const FinancialSummaryPanel = () => {
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchFinancialSummary = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await Api.get("/work-item/dashboard/financial-summary");

      const result = response?.data?.data ?? response?.data;

      if (result?.success === false) {
        throw new Error(
          result.message || "Gagal mengambil ringkasan keuangan.",
        );
      }

      setFinancial(result?.data ?? result);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil ringkasan keuangan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const cards = [
    {
      key: "contract",
      label: "Nilai Kontrak",
      value: financial?.contract?.total_contract_value,
      detail: `${financial?.contract?.total_contracts ?? 0} kontrak`,
      icon: FiFileText,
      iconStyle:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      key: "unpaid",
      label: "Belum Dibayar",
      value: financial?.unpaid?.total_outstanding,
      detail: `${financial?.unpaid?.total_invoices ?? 0} invoice`,
      icon: FiClock,
      iconStyle:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      key: "unbilled",
      label: "Belum Ditagihkan",
      value: financial?.unbilled?.total_value,
      detail: `${financial?.unbilled?.total_work_items ?? 0} pekerjaan`,
      icon: FiAlertCircle,
      iconStyle:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
    {
      key: "paid",
      label: "Pembayaran Diterima",
      value: financial?.paid?.total_received,
      detail: `${financial?.paid?.total_invoices ?? 0} invoice lunas`,
      icon: FiCheckCircle,
      iconStyle:
        "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    },
  ];

  return (
    <>
      <section className="flex min-h-[185px] max-h-[185px] min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-200/60 bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <FiDollarSign size={17} className="shrink-0 text-emerald-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Ringkasan Nilai Kontrak &amp; Invoice
          </h2>
        </div>

        {error && (
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <span className="line-clamp-2">{error}</span>
            <button
              type="button"
              onClick={fetchFinancialSummary}
              className="shrink-0 font-semibold"
            >
              Coba lagi
            </button>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 xl:grid-cols-4 xl:grid-rows-1">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.key}
                type="button"
                disabled={!financial}
                onClick={() => setSelectedCategory(card.key)}
                className="flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40 sm:p-3.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 rounded-lg p-2 ${card.iconStyle}`}>
                    <Icon size={15} />
                  </span>
                  <p className="min-w-0 text-[10px] font-medium leading-tight text-gray-500 dark:text-gray-400 sm:text-xs">
                    {card.label}
                  </p>
                </div>

                {loading && !financial ? (
                  <div className="my-3 h-6 w-3/4 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <p
                    className="mt-3 whitespace-nowrap text-sm text-left font-bold tracking-tight text-gray-900 dark:text-white sm:text-base"
                    title={formatCurrency(card.value)}
                  >
                    {formatCurrency(card.value)}
                  </p>
                )}

                <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
                  {card.detail}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <ModalFinancialItems
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        title={cards.find((card) => card.key === selectedCategory)?.label || ""}
        items={
          selectedCategory ? financial?.[selectedCategory]?.items || [] : []
        }
      />
    </>
  );
};

export default FinancialSummaryPanel;
