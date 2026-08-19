import { Inngest } from "inngest"

export type InngestEvents = {
  "job/application.detect-fields": {
    data: {
      applicationId: string
      userId: string
      jobUrl: string
      jobId?: string | null
    }
  }
  "job/application.submit": {
    data: {
      applicationId: string
      userId: string
    }
  }
}

export const inngest = new Inngest({
  id: "hireflow",
  isDev:
    process.env.NODE_ENV === "development" ||
    process.env.INNGEST_DEV === "1" ||
    process.env.INNGEST_DEV === "true",
})
