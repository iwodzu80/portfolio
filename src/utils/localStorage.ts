
import { validateAndFormatUrl } from "@/utils/securityUtils";

interface ProfileData {
  name: string;
  photo: string;
  email: string;
  location: string;
  tagline: string;
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

interface PortfolioData {
  profile: ProfileData;
  sections: SectionData[];
}

// Default data
const defaultData: PortfolioData = {
  profile: {
    name: "Jane Doe",
    photo: "/placeholder.svg",
    email: "hello@example.com",
    location: "San Francisco, CA",
    tagline: "Full-stack developer & designer with a passion for creating beautiful, functional web applications",
  },
  sections: [
    {
      id: "section-1",
      title: "My Projects",
      projects: [
        {
          id: "1",
          title: "Personal Portfolio",
          description: "A responsive portfolio website built with React and TailwindCSS.",
          links: [
            { id: "1-1", title: "GitHub", url: "https://github.com" },
            { id: "1-2", title: "Live Site", url: "https://example.com" }
          ],
          features: [
            { id: "1-f1", title: "React" },
            { id: "1-f2", title: "TailwindCSS" }
          ]
        },
        {
          id: "2",
          title: "E-commerce Platform",
          description: "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
          links: [
            { id: "2-1", title: "GitHub", url: "https://github.com" },
            { id: "2-2", title: "Demo", url: "https://example.com/demo" }
          ],
          features: [
            { id: "2-f1", title: "Node.js" },
            { id: "2-f2", title: "MongoDB" }
          ]
        }
      ]
    }
  ]
};

const STORAGE_KEY = "portfolio-data";

// Ensure all URLs in the data are properly validated and formatted
const sanitizeData = (data: PortfolioData): PortfolioData => {
  const sanitizedSections = data.sections.map(section => ({
    ...section,
    projects: section.projects.map(project => ({
      ...project,
      features: project.features || [], // Ensure features array exists
      links: project.links.map(link => ({
        ...link,
        url: validateAndFormatUrl(link.url)
      }))
    }))
  }));
  
  return {
    ...data,
    sections: sanitizedSections
  };
};

export function saveData(data: PortfolioData): void {
  // Sanitize data before saving
  const sanitizedData = sanitizeData(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
}

export function loadData(): PortfolioData {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      // Sanitize data after loading
      return sanitizeData(parsedData);
    } catch (error) {
      console.error("Failed to parse saved data:", error);
      return defaultData;
    }
  }
  return defaultData;
}

// Add the getPortfolioData function that's being imported in SharedPortfolio.tsx
export function getPortfolioData(): PortfolioData {
  return loadData();
}

export function saveProfile(profile: ProfileData): void {
  const data = loadData();
  data.profile = profile;
  saveData(data);
}

export function saveSections(sections: SectionData[]): void {
  const data = loadData();
  data.sections = sections;
  saveData(data);
}

export function saveProjects(sectionId: string, projects: ProjectData[]): void {
  const data = loadData();
  const sectionIndex = data.sections.findIndex(section => section.id === sectionId);
  
  if (sectionIndex !== -1) {
    data.sections[sectionIndex].projects = projects;
    saveData(data);
  }
}
