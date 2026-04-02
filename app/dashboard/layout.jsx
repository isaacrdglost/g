import { DashboardProvider } from "@/lib/dashboard-context";
import { ToastProvider } from "@/lib/toast-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <ToastProvider>
        <div
          className="flex min-h-screen"
          style={{ backgroundColor: "#E8E8E4", padding: "12px 12px 12px 0" }}
        >
          <Sidebar />

          <div
            className="flex flex-col flex-1"
            style={{
              marginLeft: 228,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <Topbar />

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
