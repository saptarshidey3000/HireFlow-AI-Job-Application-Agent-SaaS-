import { Suspense } from "react"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout activeStep={1}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
