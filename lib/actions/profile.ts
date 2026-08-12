"use server"

import { revalidatePath } from "next/cache"

import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/actions/helpers"
import { getAuthenticatedSupabase } from "@/lib/auth/session"
import type { LinkType } from "@/lib/supabase/database.types"

export async function updatePersonalInfo(input: {
  fullName: string
  phone: string
  location: string
}): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName.trim() || null,
        phone: input.phone.trim() || null,
        location: input.location.trim() || null,
      })
      .eq("id", userId)

    if (error) throw error
    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to update personal info."
    )
  }
}

export async function updateProfessionalSummary(
  summary: string
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const { error } = await supabase
      .from("profiles")
      .update({ professional_summary: summary.trim() || null })
      .eq("id", userId)

    if (error) throw error
    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to update summary."
    )
  }
}

export async function saveSkills(
  skills: string[]
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase.from("profile_skills").delete().eq("user_id", userId)

    const cleaned = skills.map((s) => s.trim()).filter(Boolean)
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_skills").insert(
        cleaned.map((name, index) => ({
          user_id: userId,
          name,
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save skills."
    )
  }
}

export async function saveWorkExperiences(
  items: Array<{
    id?: string
    company: string
    title: string
    startDate: string
    endDate: string
    isCurrent: boolean
    responsibilities: string[]
  }>
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase
      .from("profile_work_experiences")
      .delete()
      .eq("user_id", userId)

    const cleaned = items.filter((item) => item.company.trim() && item.title.trim())
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_work_experiences").insert(
        cleaned.map((item, index) => ({
          user_id: userId,
          company: item.company.trim(),
          title: item.title.trim(),
          start_date: item.startDate.trim() || null,
          end_date: item.isCurrent ? null : item.endDate.trim() || null,
          is_current: item.isCurrent,
          responsibilities: item.responsibilities
            .map((r) => r.trim())
            .filter(Boolean),
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save work experience."
    )
  }
}

export async function saveEducation(
  items: Array<{
    institution: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
  }>
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase.from("profile_education").delete().eq("user_id", userId)

    const cleaned = items.filter((item) => item.institution.trim())
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_education").insert(
        cleaned.map((item, index) => ({
          user_id: userId,
          institution: item.institution.trim(),
          degree: item.degree.trim() || null,
          field_of_study: item.fieldOfStudy.trim() || null,
          start_date: item.startDate.trim() || null,
          end_date: item.endDate.trim() || null,
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save education."
    )
  }
}

export async function saveProjects(
  items: Array<{
    name: string
    description: string
    url: string
    technologies: string[]
  }>
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase.from("profile_projects").delete().eq("user_id", userId)

    const cleaned = items.filter((item) => item.name.trim())
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_projects").insert(
        cleaned.map((item, index) => ({
          user_id: userId,
          name: item.name.trim(),
          description: item.description.trim() || null,
          url: item.url.trim() || null,
          technologies: item.technologies.map((t) => t.trim()).filter(Boolean),
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save projects."
    )
  }
}

export async function saveCertifications(
  items: Array<{
    name: string
    issuer: string
    issuedDate: string
    url: string
  }>
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase.from("profile_certifications").delete().eq("user_id", userId)

    const cleaned = items.filter((item) => item.name.trim())
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_certifications").insert(
        cleaned.map((item, index) => ({
          user_id: userId,
          name: item.name.trim(),
          issuer: item.issuer.trim() || null,
          issued_date: item.issuedDate.trim() || null,
          url: item.url.trim() || null,
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save certifications."
    )
  }
}

export async function saveLinks(
  items: Array<{
    type: LinkType
    label: string
    url: string
  }>
): Promise<ActionResult<null>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    await supabase.from("profile_links").delete().eq("user_id", userId)

    const cleaned = items.filter((item) => item.url.trim())
    if (cleaned.length > 0) {
      const { error } = await supabase.from("profile_links").insert(
        cleaned.map((item, index) => ({
          user_id: userId,
          type: item.type,
          label: item.label.trim() || null,
          url: item.url.trim(),
          sort_order: index,
        }))
      )
      if (error) throw error
    }

    revalidatePath("/dashboard/profile")
    return actionSuccess(null)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to save links."
    )
  }
}
