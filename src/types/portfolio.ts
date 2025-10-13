
export type AppRole = 'admin' | 'moderator' | 'user';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  customName?: string; // For when platform is "other"
}

export interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
  description: string;
  userRole?: AppRole;
  social_links?: SocialLink[];
  is_public?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
}

export interface LinkData {
  id: string;
  title: string;
  url: string;
}

export interface FeatureData {
  id: string;
  title: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  links: LinkData[];
  features: FeatureData[];
  project_role?: string;
  image_url?: string;
}

export interface SectionData {
  id: string;
  title: string;
  description?: string;
  projects: ProjectData[];
}
