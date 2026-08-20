export interface SerpLocationConfig {
  location: string
  gl: string
  google_domain: string
  hl: string
}

const INDIAN_CITIES = [
  "bengaluru",
  "bangalore",
  "mumbai",
  "delhi",
  "new delhi",
  "ncr",
  "hyderabad",
  "pune",
  "chennai",
  "kolkata",
  "gurgaon",
  "gurugram",
  "noida",
  "ahmedabad",
  "jaipur",
  "kochi",
  "coimbatore",
  "chandigarh",
  "indore",
]

const LOCATION_MAP: Record<string, SerpLocationConfig> = {
  india: {
    location: "India",
    gl: "in",
    google_domain: "google.co.in",
    hl: "en",
  },
  "united states": {
    location: "United States",
    gl: "us",
    google_domain: "google.com",
    hl: "en",
  },
  usa: {
    location: "United States",
    gl: "us",
    google_domain: "google.com",
    hl: "en",
  },
  uk: {
    location: "United Kingdom",
    gl: "uk",
    google_domain: "google.co.uk",
    hl: "en",
  },
  "united kingdom": {
    location: "United Kingdom",
    gl: "uk",
    google_domain: "google.co.uk",
    hl: "en",
  },
  canada: {
    location: "Canada",
    gl: "ca",
    google_domain: "google.ca",
    hl: "en",
  },
  australia: {
    location: "Australia",
    gl: "au",
    google_domain: "google.com.au",
    hl: "en",
  },
  germany: {
    location: "Germany",
    gl: "de",
    google_domain: "google.de",
    hl: "en",
  },
  singapore: {
    location: "Singapore",
    gl: "sg",
    google_domain: "google.com.sg",
    hl: "en",
  },
}

const DEFAULT_CONFIG: SerpLocationConfig = {
  location: "India",
  gl: "in",
  google_domain: "google.co.in",
  hl: "en",
}

export function resolveSerpLocationConfig(
  locationInput?: string | null,
  profileLocation?: string | null
): SerpLocationConfig {
  const raw = locationInput?.trim() || profileLocation?.trim() || ""
  if (!raw) return DEFAULT_CONFIG

  const key = raw.toLowerCase()
  if (LOCATION_MAP[key]) {
    return LOCATION_MAP[key]
  }

  // Check known Indian cities
  if (INDIAN_CITIES.some((city) => key.includes(city))) {
    const loc = key.includes("india") ? raw : `${raw}, India`
    return {
      location: loc,
      gl: "in",
      google_domain: "google.co.in",
      hl: "en",
    }
  }

  for (const [needle, config] of Object.entries(LOCATION_MAP)) {
    if (key.includes(needle)) {
      return config
    }
  }

  return {
    location: raw,
    gl: DEFAULT_CONFIG.gl,
    google_domain: DEFAULT_CONFIG.google_domain,
    hl: "en",
  }
}
