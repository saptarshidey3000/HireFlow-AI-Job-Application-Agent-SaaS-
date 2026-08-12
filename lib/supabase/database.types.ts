export type ParsingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "parsing"
  | "saving_profile"
  | "complete"
  | "error"

export type LinkType = "linkedin" | "github" | "portfolio" | "other"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          phone: string | null
          location: string | null
          professional_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          location?: string | null
          professional_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          location?: string | null
          professional_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          storage_path: string
          file_type: string
          file_size: number
          parsing_status: ParsingStatus
          parsing_error: string | null
          uploaded_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          storage_path: string
          file_type: string
          file_size: number
          parsing_status?: ParsingStatus
          parsing_error?: string | null
          uploaded_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          storage_path?: string
          file_type?: string
          file_size?: number
          parsing_status?: ParsingStatus
          parsing_error?: string | null
          uploaded_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_skills: {
        Row: {
          id: string
          user_id: string
          name: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_work_experiences: {
        Row: {
          id: string
          user_id: string
          company: string
          title: string
          start_date: string | null
          end_date: string | null
          is_current: boolean
          responsibilities: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          title: string
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          responsibilities?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          title?: string
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          responsibilities?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_education: {
        Row: {
          id: string
          user_id: string
          institution: string
          degree: string | null
          field_of_study: string | null
          start_date: string | null
          end_date: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          institution: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          institution?: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          url: string | null
          technologies: string[]
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          url?: string | null
          technologies?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          url?: string | null
          technologies?: string[]
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_certifications: {
        Row: {
          id: string
          user_id: string
          name: string
          issuer: string | null
          issued_date: string | null
          url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          issuer?: string | null
          issued_date?: string | null
          url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          issuer?: string | null
          issued_date?: string | null
          url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_links: {
        Row: {
          id: string
          user_id: string
          type: LinkType
          label: string | null
          url: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: LinkType
          label?: string | null
          url: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: LinkType
          label?: string | null
          url?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Resume = Database["public"]["Tables"]["resumes"]["Row"]
export type ProfileSkill = Database["public"]["Tables"]["profile_skills"]["Row"]
export type ProfileWorkExperience =
  Database["public"]["Tables"]["profile_work_experiences"]["Row"]
export type ProfileEducation =
  Database["public"]["Tables"]["profile_education"]["Row"]
export type ProfileProject = Database["public"]["Tables"]["profile_projects"]["Row"]
export type ProfileCertification =
  Database["public"]["Tables"]["profile_certifications"]["Row"]
export type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"]

export interface FullProfile {
  profile: Profile
  skills: ProfileSkill[]
  workExperiences: ProfileWorkExperience[]
  education: ProfileEducation[]
  projects: ProfileProject[]
  certifications: ProfileCertification[]
  links: ProfileLink[]
}

export interface OnboardingStatus {
  isComplete: boolean
  hasResume: boolean
  onboardingCompleted: boolean
}
