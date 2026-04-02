import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import { SidebarProvider } from "@/lib/sidebar-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import DashboardMapBg from "@/components/dashboard/DashboardMapBg";

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <ToastProvider>
        <SidebarProvider>
          <div className="flex min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
            <Sidebar />
            <DashboardMapBg />

            <div className="dash-content flex flex-col flex-1 min-h-screen" style={{ position: "relative", zIndex: 1 }}>
              <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <Topbar />
              </div>

              <main className="flex-1 dash-main">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </DashboardProvider>
  );
}
