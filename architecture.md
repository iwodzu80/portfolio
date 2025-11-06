# Architecture Documentation

## System Overview

This is a portfolio management platform built with a **secure, backend-first architecture** using React, TypeScript, and Supabase. The application enables users to create, manage, and share professional portfolios while providing recruiters with specialized tools for candidate discovery.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Hooks + Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives + shadcn/ui
- **Rich Text**: TiptapEditor
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Platform**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email, OAuth)
- **Edge Functions**: Deno-based serverless functions
- **Real-time**: Supabase Realtime subscriptions

## Database Schema

### Core Tables

#### `profiles`
User profile information including bio, avatar, and contact details.
- One-to-one relationship with auth.users
- Contains portfolio display data

#### `sections`
Portfolio sections that organize projects.
- One-to-many relationship with profiles
- Supports ordering and descriptions

#### `projects`
Individual portfolio items within sections.
- Belongs to a section
- Contains title, description, images, dates

#### `project_links`
External links associated with projects (GitHub, live demos, etc.).
- Many-to-one relationship with projects

#### `project_features`
Key features/highlights for each project.
- Many-to-one relationship with projects

#### `user_roles`
Role-based access control system.
- Supports roles: `user`, `recruiter`, `admin`
- Assigned during signup via trigger

#### `portfolio_views`
Analytics tracking for portfolio visits.
- Records views of shared portfolios
- Includes referrer and user agent data

## Authentication & Authorization

### Authentication Flow
1. User signs up with email/password
2. Role assignment happens automatically via database trigger `handle_new_user_role()`
3. Role is passed in signup metadata and validated (only `user` or `recruiter` allowed)
4. Email verification required
5. Session managed via Supabase Auth with localStorage persistence

### Authorization Model
- **Row Level Security (RLS)** enforced on all tables
- Users can only access/modify their own data
- Shared portfolios use secure share tokens
- Role-based access for recruiter features

### Security Features
- All database operations protected by RLS policies
- Input sanitization using DOMPurify
- URL validation for external links
- CSRF protection via Supabase Auth
- Role assignment restricted to signup only (cannot self-assign post-signup)

## Frontend Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   └── *.tsx           # Feature components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── usePortfolioData.ts
│   ├── useProfileData.ts
│   ├── useSectionData.ts
│   └── useProjectOperations.ts
├── pages/              # Route components
├── utils/              # Helper functions
├── types/              # TypeScript definitions
└── integrations/       # Third-party integrations
    └── supabase/
```

### Key Patterns

#### Custom Hooks Architecture
- **Data Fetching Hooks**: `useProfileData`, `useSectionData`, `useSharedPortfolio`
- **Operation Hooks**: `useProjectOperations`, `useSectionOperations`
- **Composition Hook**: `usePortfolioData` combines multiple data hooks

#### State Management
- Local component state via `useState`
- Global auth state via `AuthContext`
- Theme state via `ThemeContext`
- Server state cached with TanStack Query

#### Error Handling
- Centralized error handling in `utils/errorHandler.ts`
- Toast notifications for user feedback
- Graceful degradation for missing data

## Key Features

### Portfolio Management
- Create and organize projects in sections
- Rich text descriptions with TiptapEditor
- Image uploads with cropping
- Drag-and-drop reordering
- Project links and features

### Sharing & Analytics
- Generate unique share links
- Track portfolio views
- View analytics dashboard
- Cookie consent management

### Recruiter Features
- Dedicated recruiter role
- AI-powered chat via edge function (`recruiter-chat`)
- Candidate portfolio discovery

### Theming
- Light/Dark mode support
- System theme detection
- Semantic color tokens
- Persistent theme preference

## Data Flow

### Portfolio Loading Flow
```
User Login → AuthContext → usePortfolioData
                              ├→ useProfileData (fetch profile)
                              ├→ useSectionData (fetch sections + projects)
                              └→ useDefaultSectionCreator (create if empty)
```

### Project Update Flow
```
User Edit → ProjectCard → useProjectOperations.handleUpdateProject
                            ├→ Supabase update (projects table)
                            ├→ updateProjectRelations (links, features)
                            └→ Local state update
```

### Shared Portfolio Flow
```
Share URL → useSharedPortfolio
              ├→ RPC: get_user_from_share (validate token)
              ├→ Fetch profile + sections
              ├→ Sanitize data (DOMPurify)
              └→ Record view (portfolio_views)
```

## Security Architecture

### Backend Security
- **RLS Policies**: All tables have policies restricting access
- **Trigger-based Role Assignment**: Roles assigned via `handle_new_user_role()` trigger
- **No Self-Assignment**: Users cannot change their own roles post-signup
- **Secure Functions**: Edge functions use SECURITY DEFINER where appropriate

### Frontend Security
- **Input Sanitization**: All user input sanitized with DOMPurify
- **URL Validation**: External URLs validated before storage
- **XSS Prevention**: Rich text content sanitized
- **CSRF Protection**: Supabase Auth tokens

### Data Privacy
- User data isolated via RLS
- Share tokens use UUID format
- Analytics data anonymized
- Cookie consent tracking

## Deployment

### Migration Strategy
- Sequential migration files in `supabase/migrations/`
- Naming format: `<timestamp>_<description>.sql`
- Automated via GitHub Actions
- Archive old migrations in `supabase/migrationsArchive/`

### CI/CD Pipeline
- **Check Migrations**: Validates migration syntax
- **Apply Migrations**: Deploys to Supabase
- **Deploy**: Builds and deploys frontend
- **Repair & Baseline**: Database maintenance

### Environment Configuration
- Environment variables via `.env`
- Supabase credentials managed securely
- Constants centralized in `src/lib/constants.ts`

## Performance Considerations

- **Code Splitting**: Route-based code splitting via React Router
- **Lazy Loading**: Images loaded on demand
- **Query Caching**: TanStack Query caches server data
- **Optimistic Updates**: Local state updated before server confirmation
- **Database Indexes**: Indexed on foreign keys and frequently queried columns

## Future Scalability

### Horizontal Scaling
- Stateless frontend (can be CDN-distributed)
- Supabase handles database scaling
- Edge functions auto-scale

### Vertical Enhancements
- Real-time collaboration features
- Advanced analytics with aggregations
- File storage optimization
- Search functionality with full-text search

## Development Guidelines

### Adding New Features
1. Create migration for database changes
2. Update TypeScript types
3. Create/update hooks for data operations
4. Build UI components
5. Add RLS policies for security
6. Test role-based access

### Code Organization
- Keep components focused and small
- Extract reusable logic to hooks
- Use semantic design tokens (no hardcoded colors)
- Follow TypeScript strict mode
- Maintain RLS policies for all tables

### Security Checklist
- [ ] RLS policy added for new tables
- [ ] Input sanitized for user content
- [ ] URLs validated before storage
- [ ] Role checks for protected features
- [ ] Migration tested in staging
- [ ] Error messages don't leak sensitive data
