import type { PlatformInfo, SupportedPlatform } from "@/lib/browserbase/types"

const PLATFORM_SIGNATURES: Array<{
  platform: SupportedPlatform
  name: string
  urlPatterns: RegExp[]
  domSelectors: string[]
  formSelector?: string
  submitSelector?: string
}> = [
  {
    platform: "greenhouse",
    name: "Greenhouse",
    urlPatterns: [
      /greenhouse\.io/i,
      /gh_jid=/i,
      /gh_src=/i,
      /boards\.greenhouse\.io/i,
    ],
    domSelectors: [
      "#application_form",
      "form#application",
      "[id*='greenhouse']",
      "div.application-field",
      "#grnhse_app",
    ],
    formSelector: "#application_form, form#application, form",
    submitSelector: "#submit_app, input[type='submit'], button[type='submit']",
  },
  {
    platform: "lever",
    name: "Lever",
    urlPatterns: [
      /lever\.co/i,
      /jobs\.lever\.co/i,
    ],
    domSelectors: [
      ".application-form",
      "form#application-form",
      "[data-qa='application-form']",
      ".lever-application-form",
    ],
    formSelector: ".application-form, form#application-form, form",
    submitSelector: "button[type='submit'], #btn-submit, [data-qa='btn-submit']",
  },
  {
    platform: "workable",
    name: "Workable",
    urlPatterns: [
      /workable\.com/i,
      /apply\.workable\.com/i,
    ],
    domSelectors: [
      "[data-ui='application-form']",
      "form[data-ui='application-form']",
      ".workable-form",
    ],
    formSelector: "[data-ui='application-form'], form",
    submitSelector: "button[data-ui='submit-application'], button[type='submit']",
  },
  {
    platform: "ashby",
    name: "Ashby",
    urlPatterns: [
      /ashbyhq\.com/i,
      /jobs\.ashbyhq\.com/i,
    ],
    domSelectors: [
      "[data-ashby-application-form]",
      ".ashby-application-form",
      "form[id*='ashby']",
    ],
    formSelector: "[data-ashby-application-form], form",
    submitSelector: "button[type='submit']",
  },
  {
    platform: "smartrecruiters",
    name: "SmartRecruiters",
    urlPatterns: [
      /smartrecruiters\.com/i,
      /jobs\.smartrecruiters\.com/i,
    ],
    domSelectors: [
      "form#st-apply-form",
      "[data-qa='apply-form']",
    ],
    formSelector: "form#st-apply-form, form",
    submitSelector: "button#st-submit, button[type='submit']",
  },
  {
    platform: "bamboohr",
    name: "BambooHR",
    urlPatterns: [
      /bamboohr\.com/i,
    ],
    domSelectors: [
      "#applicationForm",
      "form#applicationForm",
    ],
    formSelector: "#applicationForm, form",
    submitSelector: "button[type='submit'], input[type='submit']",
  },
]

export function detectPlatformFromUrl(url: string): PlatformInfo {
  try {
    const cleanUrl = url.trim()
    for (const signature of PLATFORM_SIGNATURES) {
      if (signature.urlPatterns.some((pattern) => pattern.test(cleanUrl))) {
        return {
          platform: signature.platform,
          name: signature.name,
          isSupported: true,
          formSelector: signature.formSelector,
          submitSelector: signature.submitSelector,
        }
      }
    }
  } catch {
    // ignore parse error
  }

  return {
    platform: "generic",
    name: "Standard Application",
    isSupported: true,
    formSelector: "form",
    submitSelector: "button[type='submit'], input[type='submit']",
  }
}

export function getPlatformDisplayInfo(platform: string): { name: string; badgeColor: string } {
  switch (platform.toLowerCase()) {
    case "greenhouse":
      return { name: "Greenhouse", badgeColor: "bg-[#008552]/20 text-[#22c55e] border-[#008552]/40" }
    case "lever":
      return { name: "Lever", badgeColor: "bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/40" }
    case "workable":
      return { name: "Workable", badgeColor: "bg-[#059669]/20 text-[#34d399] border-[#059669]/40" }
    case "ashby":
      return { name: "Ashby", badgeColor: "bg-[#9333ea]/20 text-[#c084fc] border-[#9333ea]/40" }
    case "smartrecruiters":
      return { name: "SmartRecruiters", badgeColor: "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/40" }
    case "bamboohr":
      return { name: "BambooHR", badgeColor: "bg-[#84cc16]/20 text-[#a3e635] border-[#84cc16]/40" }
    default:
      return { name: "Direct Employer", badgeColor: "bg-[#333333] text-[#A7A7A7] border-[#444444]" }
  }
}
