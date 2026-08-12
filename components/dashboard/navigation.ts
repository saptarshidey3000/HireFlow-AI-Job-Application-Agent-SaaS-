import {
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  FileText,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const mainNavigation: NavItem[] = [
  { label: "Jobs", href: "/dashboard/jobs", icon: BriefcaseBusiness },
  { label: "Resume", href: "/dashboard/resume", icon: FileText },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  {
    label: "Application Status",
    href: "/dashboard/application-status",
    icon: ClipboardCheck,
  },
]

export const footerNavigation: NavItem[] = [
  {
    label: "Billing / Credits",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  { label: "Profile Settings", href: "/dashboard/settings", icon: Settings },
]

export const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/jobs": "Jobs",
  "/dashboard/resume": "Resume",
  "/dashboard/profile": "Profile",
  "/dashboard/application-status": "Application Status",
  "/dashboard/billing": "Billing / Credits",
  "/dashboard/settings": "Profile Settings",
}
