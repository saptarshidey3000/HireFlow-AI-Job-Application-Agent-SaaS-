"use client"

import { CertificationsSection } from "@/components/profile/certifications-section"
import { EducationSection } from "@/components/profile/education-section"
import { LinksSection } from "@/components/profile/links-section"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { SummarySection } from "@/components/profile/summary-section"
import { WorkExperienceSection } from "@/components/profile/work-experience-section"
import type { FullProfile } from "@/lib/supabase/database.types"

export function ProfilePageClient({ profile }: { profile: FullProfile }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Profile</h1>
        <p className="mt-2 text-sm text-[#A7A7A7]">
          Review and customize the information extracted from your resume.
        </p>
      </div>

      <PersonalInfoSection
        fullName={profile.profile.full_name}
        email={profile.profile.email}
        phone={profile.profile.phone}
        location={profile.profile.location}
      />
      <SummarySection summary={profile.profile.professional_summary} />
      <SkillsSection skills={profile.skills} />
      <WorkExperienceSection workExperiences={profile.workExperiences} />
      <EducationSection education={profile.education} />
      <ProjectsSection projects={profile.projects} />
      <CertificationsSection certifications={profile.certifications} />
      <LinksSection links={profile.links} />
    </div>
  )
}
