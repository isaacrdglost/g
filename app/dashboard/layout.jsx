"use client";

import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import DashboardMapBg from "@/components/dashboard/DashboardMapBg";
import BotaoSuporte from "@/components/suporte/BotaoSuporte";

function DashboardInner({ children }) {
  const { colapsada } = useSidebar();
  const sidebarWidth = colapsada ? "68px" : "228px";

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "#FAF8F5", "--sidebar-width": sidebarWidth }}
    >
      <Sidebar />
      <DashboardMapBg />
      <BotaoSuporte />

      <div className="dash-content flex flex-col flex-1 min-h-screen" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <Topbar />
        </div>

        <main className="flex-1 dash-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <ToastProvider>
        <SidebarProvider>
          <DashboardInner>{children}</DashboardInner>
        </SidebarProvider>
      </ToastProvider>
    </DashboardProvider>
  );
}
