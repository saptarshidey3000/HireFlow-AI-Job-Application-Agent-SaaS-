"use client"

import {
  Award,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Link2,
  Sparkles,
  UserRound,
  FileText,
} from "lucide-react"
import { useMemo } from "react"

import { CertificationsSection } from "@/components/profile/certifications-section"
import { EducationSection } from "@/components/profile/education-section"
import { LinksSection } from "@/components/profile/links-section"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import {
  ProfileCompletenessCard,
  SectionCompletenessDot,
} from "@/components/profile/profile-completeness-card"
import { ProjectsSection } from "@/components/profile/projects-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { SummarySection } from "@/components/profile/summary-section"
import { WorkExperienceSection } from "@/components/profile/work-experience-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateProfileCompleteness, type ProfileSectionId } from "@/lib/profile/completeness"
import type { FullProfile } from "@/lib/supabase/database.types"

const TAB_ITEMS: Array<{
  id: ProfileSectionId
  label: string
  icon: React.ReactNode
}> = [
  {
    id: "personal",
    label: "Personal",
    icon: <UserRound className="size-4" />,
  },
  {
    id: "summary",
    label: "Summary",
    icon: <FileText className="size-4" />,
  },
  {
    id: "skills",
    label: "Skills",
    icon: <Sparkles className="size-4" />,
  },
  {
    id: "work",
    label: "Experience",
    icon: <Briefcase className="size-4" />,
  },
  {
    id: "education",
    label: "Education",
    icon: <GraduationCap className="size-4" />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: <FolderKanban className="size-4" />,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: <Award className="size-4" />,
  },
  {
    id: "links",
    label: "Links",
    icon: <Link2 className="size-4" />,
  },
]

export function ProfilePageClient({ profile }: { profile: FullProfile }) {
  const completeness = useMemo(
    () => calculateProfileCompleteness(profile),
    [profile]
  )

  const sectionMap = useMemo(
    () => new Map(completeness.sections.map((section) => [section.id, section])),
    [completeness.sections]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white">Profile</h1>
        <p className="mt-2 text-sm text-[#A7A7A7]">
          Review and customize the information extracted from your resume.
        </p>
      </div>

      <ProfileCompletenessCard completeness={completeness} />

      <Tabs defaultValue="personal">
        <TabsList>
          {TAB_ITEMS.map((tab) => {
            const section = sectionMap.get(tab.id)
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                icon={
                  <span className="relative inline-flex">
                    {tab.icon}
                    {section ? (
                      <SectionCompletenessDot section={section} />
                    ) : null}
                  </span>
                }
              >
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoSection
            fullName={profile.profile.full_name}
            email={profile.profile.email}
            phone={profile.profile.phone}
            location={profile.profile.location}
            embedded
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummarySection
            summary={profile.profile.professional_summary}
            embedded
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsSection skills={profile.skills} embedded />
        </TabsContent>

        <TabsContent value="work">
          <WorkExperienceSection
            workExperiences={profile.workExperiences}
            embedded
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationSection education={profile.education} embedded />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsSection projects={profile.projects} embedded />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsSection
            certifications={profile.certifications}
            embedded
          />
        </TabsContent>

        <TabsContent value="links">
          <LinksSection links={profile.links} embedded />
        </TabsContent>
      </Tabs>
    </div>
  )
}
