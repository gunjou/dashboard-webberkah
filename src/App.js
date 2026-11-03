import { useCallback, useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ExecutiveMonitoringDashboard from "./pages/ExecutiveMonitoringDashboard";
import DashboardV2 from "./pages/DashboardV2";
import SecretCodeOverlay from "./components/access/SecretCodeOverlay";
import { getValidDashboardToken, clearDashboardToken } from "./utils/auth";

import "./App.css";

const DEFAULT_DASHBOARD = "V2";

const DASHBOARD_TO_VIEW = {
  MAIN: "main",
  EXECUTIVE: "executive",
  V2: "v2",
};

const readDashboardFromUrl = () => {
  const view = new URLSearchParams(window.location.search).get("view");
  const match = Object.entries(DASHBOARD_TO_VIEW).find(
    ([, value]) => value === view?.toLowerCase(),
  );
  return match ? match[0] : DEFAULT_DASHBOARD;
};

function App() {
  const [hasAccess, setHasAccess] = useState(() =>
    Boolean(getValidDashboardToken()),
  );

  const [activeDashboard, setActiveDashboard] = useState(readDashboardFromUrl);

  // Sinkronkan dashboard aktif ke URL (?view=v2 / ?view=main / ?view=executive)
  useEffect(() => {
    const url = new URL(window.location.href);
    const currentView = url.searchParams.get("view");
    const view = DASHBOARD_TO_VIEW[activeDashboard];

    if (currentView === view) return;

    url.searchParams.set("view", view);

    // Load pertama tanpa ?view (atau view tidak valid): ganti URL tanpa menambah history
    const isValidView = Object.values(DASHBOARD_TO_VIEW).includes(currentView);
    if (isValidView) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [activeDashboard]);

  // Tombol back/forward browser
  useEffect(() => {
    const handlePopState = () => setActiveDashboard(readDashboardFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const lockDashboard = useCallback(() => {
    clearDashboardToken();
    setHasAccess(false);
  }, []);

  const handleAccessGranted = useCallback(() => {
    setHasAccess(Boolean(getValidDashboardToken()));
  }, []);

  const toggleDashboard = useCallback(() => {
    setActiveDashboard((current) =>
      current === "MAIN" ? "EXECUTIVE" : "MAIN",
    );
  }, []);

  const toggleDashboardV2 = useCallback(() => {
    setActiveDashboard((current) => (current === "V2" ? "MAIN" : "V2"));
  }, []);

  useEffect(() => {
    if (!hasAccess) return;

    const session = getValidDashboardToken();

    if (!session) {
      setHasAccess(false);
      return;
    }

    const timeout = window.setTimeout(
      lockDashboard,
      Math.max(0, session.expiresAt - Date.now()),
    );

    const handleStorageChange = (event) => {
      if (event.key === "token" || event.key === null) {
        if (!getValidDashboardToken()) {
          setHasAccess(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [hasAccess, lockDashboard]);

  useEffect(() => {
    const handleAccessExpired = () => lockDashboard();

    window.addEventListener("dashboard:access-expired", handleAccessExpired);

    return () => {
      window.removeEventListener(
        "dashboard:access-expired",
        handleAccessExpired,
      );
    };
  }, [lockDashboard]);

  return (
    <div className="min-h-screen">
      {hasAccess ? (
        activeDashboard === "V2" ? (
          <DashboardV2
            onSwitchDashboard={toggleDashboard}
            isExecutiveDashboard={false}
            onToggleDashboardV2={toggleDashboardV2}
            isDashboardV2={true}
          />
        ) : activeDashboard === "MAIN" ? (
          <Dashboard
            onSwitchDashboard={toggleDashboard}
            isExecutiveDashboard={false}
            onToggleDashboardV2={toggleDashboardV2}
          />
        ) : (
          <ExecutiveMonitoringDashboard
            onSwitchDashboard={toggleDashboard}
            isExecutiveDashboard={true}
            onToggleDashboardV2={toggleDashboardV2}
          />
        )
      ) : (
        <SecretCodeOverlay onAccessGranted={handleAccessGranted} />
      )}
    </div>
  );
}

export default App;
