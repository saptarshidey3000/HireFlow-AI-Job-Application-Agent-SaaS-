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
  eventKey: process.env.INNGEST_EVENT_KEY,
})
