import { Wallet } from "lucide-react";
import { formatCurrency, useCurrencyVisibility } from "../../utils/helper";
import { INVOICE_BUCKET_META, safeArray, safeNumber, shortDate } from "./constants";
import { Empty, Panel, ReminderBadge } from "./ui";

export default function InvoicePotentialPanel({ data }) {
  const { isCurrencyHidden } = useCurrencyVisibility();

  const total = safeNumber(data?.total_potential);
  const buckets = safeArray(data?.buckets);
  const items = safeArray(data?.items);

  return (
    <Panel
      title="Potensi Uang Masuk"
      subtitle="Sisa tagihan invoice berjalan (termasuk PPN)"
      icon={Wallet}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Ringkasan & pembagian per jatuh tempo */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total potensi
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-custom-merah-terang dark:text-red-300">
            {formatCurrency(total, isCurrencyHidden)}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            dari {safeNumber(data?.total_invoices)} invoice belum lunas
          </p>

          {/* Stacked bar komposisi */}
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {total > 0 &&
              buckets.map((bucket) => {
                const amount = safeNumber(bucket.total_amount);
                if (!amount) return null;
                return (
                  <div
                    key={bucket.key}
                    title={bucket.label}
                    className={INVOICE_BUCKET_META[bucket.key]?.bar || "bg-gray-400"}
                    style={{ width: `${(amount / total) * 100}%` }}
                  />
                );
              })}
          </div>

          <ul className="mt-3 space-y-2">
            {buckets.map((bucket) => {
              const meta = INVOICE_BUCKET_META[bucket.key] || {};
              return (
                <li key={bucket.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.bar}`} />
                    <span className="truncate">{bucket.label}</span>
                    <span className="text-gray-400">({safeNumber(bucket.total_invoices)})</span>
                  </span>
                  <span className={`shrink-0 font-extrabold tabular-nums ${meta.text}`}>
                    {formatCurrency(bucket.total_amount, isCurrencyHidden)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Daftar invoice */}
        <div className="min-w-0">
          <InvoiceTable items={items} />
        </div>
      </div>
    </Panel>
  );
}

export function InvoiceTable({ items, maxHeight = "max-h-[320px]" }) {
  const { isCurrencyHidden } = useCurrencyVisibility();
  const rows = safeArray(items);

  if (!rows.length) return <Empty>Tidak ada invoice yang belum lunas.</Empty>;

  return (
    <div className={`${maxHeight} overflow-auto`}>
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-wider text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="py-2 pr-3 font-bold">Invoice</th>
            <th className="px-3 py-2 font-bold">Jatuh tempo</th>
            <th className="py-2 pl-3 text-right font-bold">Sisa tagihan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((item) => (
            <tr key={item.id_invoice}>
              <td className="max-w-[280px] py-2 pr-3">
                <p className="truncate font-bold text-gray-800 dark:text-gray-100">
                  {item.invoice_number || "Tanpa nomor"}
                </p>
                <p className="truncate text-[11px] text-gray-500 dark:text-gray-400" title={item.work_name}>
                  {item.client_name || "Klien —"} · {item.work_name}
                </p>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <p className="text-gray-700 dark:text-gray-200">{shortDate(item.due_date)}</p>
                <div className="mt-0.5">
                  <ReminderBadge level={item.reminder_level} days={item.days_to_deadline} />
                </div>
              </td>
              <td className="whitespace-nowrap py-2 pl-3 text-right font-extrabold tabular-nums text-gray-900 dark:text-white">
                {formatCurrency(item.outstanding_amount, isCurrencyHidden)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
