import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import { SidebarProvider } from "@/lib/sidebar-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <ToastProvider>
        <SidebarProvider>
          <div className="flex min-h-screen" style={{ backgroundColor: "#F7F7F5" }}>
            <Sidebar />

            <div className="dash-content flex flex-col flex-1 min-h-screen">
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
