import { useSyncExternalStore } from "react";

let currencyHidden = true;
const currencyListeners = new Set();

const subscribeCurrency = (listener) => {
  currencyListeners.add(listener);

  return () => currencyListeners.delete(listener);
};

const getCurrencyHidden = () => currencyHidden;

export const setCurrencyHidden = (hidden) => {
  if (currencyHidden === hidden) return;

  currencyHidden = hidden;
  currencyListeners.forEach((listener) => listener());
};

export const useCurrencyVisibility = () => {
  const isCurrencyHidden = useSyncExternalStore(
    subscribeCurrency,
    getCurrencyHidden,
    getCurrencyHidden,
  );

  return {
    isCurrencyHidden,
    toggleCurrencyVisibility: () => setCurrencyHidden(!getCurrencyHidden()),
  };
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value, hidden = currencyHidden) => {
  if (hidden) return "Rp ••••••";

  return currencyFormatter.format(value || 0);
};

export const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
