
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

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  links: LinkData[];
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
          ]
        },
        {
          id: "2",
          title: "E-commerce Platform",
          description: "A full-stack e-commerce solution with React, Node.js, and MongoDB.",
          links: [
            { id: "2-1", title: "GitHub", url: "https://github.com" },
            { id: "2-2", title: "Demo", url: "https://example.com/demo" }
          ]
        }
      ]
    }
  ]
};

const STORAGE_KEY = "portfolio-data";

export function saveData(data: PortfolioData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData(): PortfolioData {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error("Failed to parse saved data:", error);
      return defaultData;
    }
  }
  return defaultData;
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
