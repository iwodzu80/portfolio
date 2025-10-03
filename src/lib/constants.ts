// Centralized Supabase configuration
export const SUPABASE_CONFIG = {
  PROJECT_ID: "xehavbppksotumlwtwtx",
  URL: "https://xehavbppksotumlwtwtx.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaGF2YnBwa3NvdHVtbHd0d3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDg3MzUsImV4cCI6MjA3NTAyNDczNX0.PDoUqR_tAVm9c02iUIjPZ_OnWw_mKbSiHb3MqeI9aQY"
} as const;

// Default values for new items
export const DEFAULT_VALUES = {
  NEW_SECTION_TITLE: "New Section",
  NEW_PROJECT_TITLE: "New Project",
  MIN_SECTIONS: 1,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  TAGLINE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  PROJECT_TITLE_MAX_LENGTH: 200,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  LINK_TITLE_MAX_LENGTH: 100,
  URL_MAX_LENGTH: 500,
  FEATURE_TITLE_MAX_LENGTH: 200,
  SECTION_TITLE_MAX_LENGTH: 200,
  PASSWORD_MIN_LENGTH: 6,
} as const;

