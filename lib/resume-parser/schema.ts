export const parsedResumeJsonSchema = {
  type: "object",
  properties: {
    personalInfo: {
      type: "object",
      properties: {
        fullName: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
      },
      required: ["fullName", "email", "phone", "location"],
    },
    professionalSummary: { type: ["string", "null"] },
    skills: {
      type: "array",
      items: { type: "string" },
    },
    workExperiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          isCurrent: { type: "boolean" },
          responsibilities: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: [
          "company",
          "title",
          "startDate",
          "endDate",
          "isCurrent",
          "responsibilities",
        ],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: ["string", "null"] },
          fieldOfStudy: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
        },
        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "startDate",
          "endDate",
        ],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: ["string", "null"] },
          url: { type: ["string", "null"] },
          technologies: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "description", "url", "technologies"],
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: ["string", "null"] },
          issuedDate: { type: ["string", "null"] },
          url: { type: ["string", "null"] },
        },
        required: ["name", "issuer", "issuedDate", "url"],
      },
    },
    links: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["linkedin", "github", "portfolio", "other"],
          },
          label: { type: ["string", "null"] },
          url: { type: "string" },
        },
        required: ["type", "label", "url"],
      },
    },
  },
  required: [
    "personalInfo",
    "professionalSummary",
    "skills",
    "workExperiences",
    "education",
    "projects",
    "certifications",
    "links",
  ],
} as const
