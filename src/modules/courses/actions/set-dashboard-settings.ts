import { setDashboardSettings } from '../course-service'

export default async (id: string, dashboard_settings: object) => (
  setDashboardSettings(id, dashboard_settings)
)
