import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SiAdguard } from "react-icons/si";

import LogoBerkah from "../../assets/logo_large.png";
import Api from "../../utils/Api";
import SwalHelper from "../../utils/Swal";

const SecretCodeOverlay = ({ onAccessGranted }) => {
  // ==================================================
  // 1. STATE
  // ==================================================

  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // ==================================================
  // 2. EVENT HANDLERS
  // ==================================================

  // Handle Access Code Submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!accessCode.trim()) {
      await SwalHelper.warning("Silakan masukkan kode akses terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const response = await Api.post("/auth/dashboard/access", {
        access_code: accessCode.trim(),
      });

      const result = response.data;

      if (
        result.success &&
        result.data?.access_token &&
        result.data?.access_type === "dashboard"
      ) {
        localStorage.setItem("token", result.data.access_token);
        onAccessGranted();
        return;
      }

      await SwalHelper.error(result.message || "Kode akses tidak valid.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Gagal memverifikasi kode akses. Silakan coba kembali.";

      await SwalHelper.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // 3. RENDER
  // ==================================================

  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-full items-center justify-center overflow-hidden bg-gray-950/75 px-4 py-4 backdrop-blur-xl">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-custom-merah/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-rose-600/10 blur-3xl" />

      <div className="relative my-auto w-full max-w-sm shrink-0">
        <div className="overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/90 shadow-2xl shadow-black/40 backdrop-blur-2xl dark:border-gray-800/80 dark:bg-gray-900/90">
          <div className="px-6 py-6 sm:px-10 sm:py-8">
            {/* Logo Container */}
            <div className="mb-8 flex justify-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-red-100 p-4 shadow-inner dark:border-red-500/20 dark:from-red-500/10 dark:to-red-900/20">
                <div className="absolute inset-0 animate-pulse rounded-3xl bg-white" />

                <img
                  src={LogoBerkah}
                  alt="Logo Berkah"
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-8 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1 dark:border-red-500/20 dark:bg-red-500/10">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-custom-merah-terang">
                  Dashboard - Berkah Angsana
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Akses Dashboard
              </h1>

              <p className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Masukkan kode akses rahasia Anda untuk masuk ke panel informasi
                bisnis.
              </p>
            </div>

            {/* Access Code Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="access-code"
                  className="mb-2 block text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300"
                >
                  KODE AKSES
                </label>

                <div className="group relative">
                  <input
                    id="access-code"
                    type={showCode ? "text" : "password"}
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    autoFocus
                    disabled={loading}
                    className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-5 pr-14 text-base font-semibold tracking-wider text-gray-800 outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:border-custom-merah-terang focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:focus:bg-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCode((previous) => !previous)}
                    disabled={loading}
                    aria-label={
                      showCode ? "Sembunyikan secret code" : "Lihat secret code"
                    }
                    title={
                      showCode ? "Sembunyikan secret code" : "Lihat secret code"
                    }
                    className="absolute inset-y-0 right-4 flex items-center justify-center text-gray-400 transition-colors hover:text-custom-merah-terang disabled:opacity-50 dark:text-gray-400"
                  >
                    {showCode ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !accessCode.trim()}
                className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-custom-merah-terang px-6 text-sm font-bold text-white shadow-xl shadow-red-500/25 transition-all duration-300 hover:bg-custom-merah hover:shadow-red-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <>
                    <span>Tampilkan Dashboard</span>
                    <FaArrowRightLong className="transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500">
              <SiAdguard className="text-sm text-custom-merah-terang" />
              <span>Akses diamankan dengan enkripsi sistem</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs font-medium tracking-wider text-white/70">
          © {new Date().getFullYear()} Outlook-Project. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default SecretCodeOverlay;
