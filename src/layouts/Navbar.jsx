import { useEffect, useState } from "react";
import {
  FiClock,
  FiMoon,
  FiSun,
  FiMaximize,
  FiMinimize,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import LogoBerkah from "../assets/logo_large.png";
import LogoBerkahWhite from "../assets/logo_white.png";
import { useCurrencyVisibility } from "../utils/helper";

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );

  const { isCurrencyHidden, toggleCurrencyVisibility } =
    useCurrencyVisibility();

  // Realtime clock
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  // Dark mode
  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    document.documentElement.classList.toggle("dark", nextMode);
    setDarkMode(nextMode);
  };

  // Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Gagal mengubah mode fullscreen:", error);
    }
  };

  // Lock dashboard and return to access overlay
  const handleLockDashboard = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("dashboard:access-expired"));
  };

  const formattedTime = [
    currentTime.getHours(),
    currentTime.getMinutes(),
    currentTime.getSeconds(),
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Tombol aksi umum dengan efek hover dan transisi yang halus
  const actionButtonClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200/80 bg-gray-50/50 text-gray-600 transition-all duration-200 hover:border-custom-merah-terang hover:bg-red-50/50 hover:text-custom-merah-terang active:scale-95 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-custom-merah-terang dark:hover:bg-red-500/10 dark:hover:text-custom-merah-terang";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-2xl transition-colors dark:border-gray-800/60 dark:bg-gray-900/80">
      {/* Garis aksen gradien di bagian atas navbar */}
      <div className="h-1 bg-gradient-to-r from-custom-merah via-rose-500 to-custom-merah-terang" />

      <div className="mx-auto flex min-h-[76px] max-w-[1800px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand / Logo Section */}
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center ">
            {/* Light Mode Logo */}
            <img
              src={LogoBerkah}
              alt="Logo Berkah Angsana"
              className="h-full w-full object-contain dark:hidden"
            />

            {/* Dark Mode Logo */}
            <img
              src={LogoBerkahWhite}
              alt="Logo Berkah Angsana"
              className="hidden h-full w-full object-contain dark:block"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-black tracking-tight text-gray-900 dark:text-white sm:text-base">
              Dashboard Berkah Angsana
            </h1>
            <p className="mt-0.5 hidden text-xs font-semibold text-gray-500 dark:text-gray-400 sm:block">
              Monitoring Pekerjaan, Kontrak, Invoice &amp; Absensi
            </p>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          {/* Realtime Clock Widget */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200/80 bg-gray-50/50 px-3.5 py-2 shadow-inner dark:border-gray-800 dark:bg-gray-800/50 sm:px-4">
            <FiClock className="shrink-0 text-base text-custom-merah-terang animate-pulse" />
            <div className="text-right">
              <p className="font-mono text-xs font-bold tabular-nums text-gray-800 dark:text-white sm:text-sm">
                {formattedTime}
              </p>
              <p className="hidden text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:block">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Toggle Visibility Nominal */}
          <button
            type="button"
            onClick={toggleCurrencyVisibility}
            aria-label={
              isCurrencyHidden ? "Tampilkan nominal" : "Sembunyikan nominal"
            }
            title={
              isCurrencyHidden ? "Tampilkan nominal" : "Sembunyikan nominal"
            }
            className={actionButtonClass}
          >
            {isCurrencyHidden ? <FiEyeOff size={19} /> : <FiEye size={19} />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Aktifkan light mode" : "Aktifkan dark mode"}
            title={darkMode ? "Light mode" : "Dark mode"}
            className={actionButtonClass}
          >
            {darkMode ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={
              isFullscreen ? "Keluar fullscreen" : "Aktifkan fullscreen"
            }
            title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
            className={actionButtonClass}
          >
            {isFullscreen ? <FiMinimize size={19} /> : <FiMaximize size={19} />}
          </button>

          {/* Lock Dashboard Button */}
          <button
            type="button"
            onClick={handleLockDashboard}
            aria-label="Kunci dashboard"
            title="Kunci dashboard"
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-custom-merah-terang text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:bg-custom-merah hover:shadow-red-500/40 active:scale-95"
          >
            <FiLock
              size={19}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
