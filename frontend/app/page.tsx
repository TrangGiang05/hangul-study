import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { HomeDashboard } from "../components/home/HomeDashboard";
import { getLessonProgressStats } from "../lib/progress";

export default async function Home() {
  const progressStats = await getLessonProgressStats();

  return (
    <DashboardLayout>
      <HomeDashboard initialProgressStats={progressStats} />
    </DashboardLayout>
  );
}
