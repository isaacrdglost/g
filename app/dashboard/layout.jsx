import { DashboardProvider } from "@/lib/dashboard-context";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-col flex-1" style={{ marginLeft: 216 }}>
          <Topbar />

          <main
            className="flex-1"
            style={{
              backgroundColor: "#F7F7F5",
              padding: "24px 28px",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
