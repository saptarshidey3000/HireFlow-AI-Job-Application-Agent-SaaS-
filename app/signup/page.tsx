import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <AuthLayout activeStep={1}>
      <SignupForm />
    </AuthLayout>
  )
}
