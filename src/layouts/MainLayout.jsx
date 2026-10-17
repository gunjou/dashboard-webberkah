import React from "react";
import Navbar from "./Navbar";

const MainLayout = ({
  children,
  title,
  description,
  onRefresh,
  refreshing = false,
  lastUpdated = null,
  onSwitchDashboard,
  isExecutiveDashboard = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50/70 font-poppins dark:bg-gray-900">
      <Navbar
        title={title}
        description={description}
        onRefresh={onRefresh}
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onSwitchDashboard={onSwitchDashboard}
        isExecutiveDashboard={isExecutiveDashboard}
      />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5 lg:px-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
