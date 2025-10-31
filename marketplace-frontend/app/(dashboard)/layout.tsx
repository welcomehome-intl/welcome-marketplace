import { DashboardLayout } from "../components/layout/dashboard-layout"

// Disable static rendering for all dashboard pages
export const dynamic = 'force-dynamic'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}