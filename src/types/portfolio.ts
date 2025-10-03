
export type AppRole = 'admin' | 'moderator' | 'user';

export interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
  description: string;
  userRole?: AppRole;
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
}

export interface SectionData {
  id: string;
  title: string;
  description?: string;
  projects: ProjectData[];
}
