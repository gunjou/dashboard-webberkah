import { useCallback, useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ExecutiveMonitoringDashboard from "./pages/ExecutiveMonitoringDashboard";
import SecretCodeOverlay from "./components/access/SecretCodeOverlay";
import { getValidDashboardToken, clearDashboardToken } from "./utils/auth";

import "./App.css";

function App() {
  const [hasAccess, setHasAccess] = useState(() =>
    Boolean(getValidDashboardToken()),
  );

  const [activeDashboard, setActiveDashboard] = useState("MAIN");

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
        activeDashboard === "MAIN" ? (
          <Dashboard
            onSwitchDashboard={toggleDashboard}
            isExecutiveDashboard={false}
          />
        ) : (
          <ExecutiveMonitoringDashboard
            onSwitchDashboard={toggleDashboard}
            isExecutiveDashboard={true}
          />
        )
      ) : (
        <SecretCodeOverlay onAccessGranted={handleAccessGranted} />
      )}
    </div>
  );
}

export default App;
