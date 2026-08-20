export type UserNameSources = {
  profileFullName?: string | null
  profileEmail?: string | null
  authFullName?: string | null
  authName?: string | null
}

function firstNameFromFullName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "User"
}

export function resolveUserName(sources: UserNameSources): string {
  for (const candidate of [
    sources.profileFullName,
    sources.authFullName,
    sources.authName,
  ]) {
    if (candidate?.trim()) {
      return firstNameFromFullName(candidate)
    }
  }

  const email = sources.profileEmail
  if (email?.includes("@")) {
    return email.split("@")[0] ?? "User"
  }

  return "User"
}
