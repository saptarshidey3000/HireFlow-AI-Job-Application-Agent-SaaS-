import { getUserApplications } from "@/lib/actions/applications"
import { ApplicationStatusClient } from "@/components/application-status/application-status-client"

export const dynamic = "force-dynamic"

export default async function ApplicationStatusPage() {
  const result = await getUserApplications()
  const applications = result.success ? result.data : []

  return <ApplicationStatusClient initialApplications={applications} />
}
