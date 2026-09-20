import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { HomeDashboard } from "../components/home/HomeDashboard";

export default function Home() {
  return (
    <DashboardLayout>
      <HomeDashboard />
    </DashboardLayout>
  );
}
