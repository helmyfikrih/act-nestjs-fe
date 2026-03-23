import { MainDashboard } from "@/components/dashboard/main-dashboard"

export default function ProjectDashboardPage({ params }: { params: { projectId: string } }) {
  // In a real app, we could fetch project specific stats here
  return <MainDashboard />
}
