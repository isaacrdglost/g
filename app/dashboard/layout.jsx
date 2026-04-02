import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <ToastProvider>
        <div className="flex min-h-screen" style={{ backgroundColor: "#F7F7F5" }}>
          <Sidebar />

          <div
            className="flex flex-col flex-1 min-h-screen"
            style={{ marginLeft: 228 }}
          >
            <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <Topbar />
            </div>

            <main
              className="flex-1"
              style={{
                backgroundColor: "#F7F7F5",
                padding: "28px 32px",
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </DashboardProvider>
  );
}
