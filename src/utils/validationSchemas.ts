import { z } from "zod";

// Profile validation schemas
export const profileFieldSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  telephone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  role: z.string().trim().max(100, "Role must be less than 100 characters").optional(),
  tagline: z.string().trim().max(200, "Tagline must be less than 200 characters").optional(),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
});

// Project validation schemas
export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters").optional(),
  project_role: z.string().trim().max(100, "Role must be less than 100 characters").optional(),
});

export const linkSchema = z.object({
  title: z.string().trim().min(1, "Link title cannot be empty").max(100, "Link title must be less than 100 characters"),
  url: z.string().trim().url("Invalid URL format").max(500, "URL must be less than 500 characters"),
});

export const featureSchema = z.object({
  title: z.string().trim().min(1, "Feature title cannot be empty").max(200, "Feature title must be less than 200 characters"),
});

// Section validation schemas
export const sectionSchema = z.object({
  title: z.string().trim().min(1, "Section title cannot be empty").max(200, "Section title must be less than 200 characters"),
  description: z.string().trim().max(1000, "Section description must be less than 1000 characters").optional(),
});

// Password validation
export const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
