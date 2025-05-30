export interface ProfileData {
  name: string;
  photo: string;
  email: string;
  telephone: string;
  role: string;
  tagline: string;
  description: string;
  userRole?: 'admin' | 'user' | 'viewer';
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
}

export interface SectionData {
  id: string;
  title: string;
  projects: ProjectData[];
}
