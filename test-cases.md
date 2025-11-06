# Test Cases for Portfolio Application

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Profile Management](#profile-management)
3. [Section Management](#section-management)
4. [Project Management](#project-management)
5. [Portfolio Sharing](#portfolio-sharing)
6. [Analytics](#analytics)
7. [Recruiter Features](#recruiter-features)
8. [Security & Permissions](#security--permissions)
9. [UI/UX Tests](#uiux-tests)

---

## Authentication & Authorization

### TC-AUTH-001: User Registration
**Objective**: Verify users can register with valid credentials  
**Preconditions**: User is not logged in  
**Steps**:
1. Navigate to `/auth`
2. Enter valid email and password
3. Select role (user or recruiter)
4. Click "Sign Up"

**Expected Results**:
- User account is created in `auth.users`
- Role is assigned via `handle_new_user_role()` trigger
- User is redirected to `/dashboard`
- Profile is created in `profiles` table
- Default section is created

**Test Data**:
- Email: `test@example.com`
- Password: `SecurePass123!`
- Role: `user`

---

### TC-AUTH-002: User Login
**Objective**: Verify users can log in with valid credentials  
**Preconditions**: User account exists  
**Steps**:
1. Navigate to `/auth`
2. Enter valid email and password
3. Click "Sign In"

**Expected Results**:
- User is authenticated
- Session is created and stored in localStorage
- User is redirected to `/dashboard`
- Auth state is updated in AuthContext

**Test Data**:
- Email: `test@example.com`
- Password: `SecurePass123!`

---

### TC-AUTH-003: Invalid Login Credentials
**Objective**: Verify error handling for invalid credentials  
**Steps**:
1. Navigate to `/auth`
2. Enter invalid email or password
3. Click "Sign In"

**Expected Results**:
- Error message is displayed
- User remains on `/auth` page
- No session is created

---

### TC-AUTH-004: User Logout
**Objective**: Verify users can log out successfully  
**Preconditions**: User is logged in  
**Steps**:
1. Click logout button
2. Confirm logout action

**Expected Results**:
- Session is cleared from localStorage
- User is redirected to `/` (landing page)
- Auth state is cleared in AuthContext

---

### TC-AUTH-005: Protected Route Access
**Objective**: Verify unauthenticated users cannot access protected routes  
**Preconditions**: User is not logged in  
**Steps**:
1. Attempt to navigate to `/dashboard`, `/settings`, or `/analytics`

**Expected Results**:
- User is redirected to `/auth`
- Toast notification explains authentication is required

---

### TC-AUTH-006: Role Assignment on Signup
**Objective**: Verify role is correctly assigned during signup  
**Steps**:
1. Sign up as a new user with role "recruiter"
2. Check `user_roles` table

**Expected Results**:
- Record exists in `user_roles` with `role = 'recruiter'`
- Only roles 'user' or 'recruiter' can be assigned during signup
- Admin role cannot be self-assigned

---

### TC-AUTH-007: Session Persistence
**Objective**: Verify session persists across page refreshes  
**Preconditions**: User is logged in  
**Steps**:
1. Refresh the page
2. Navigate to different routes

**Expected Results**:
- User remains authenticated
- Session data is retrieved from localStorage
- `onAuthStateChange` listener updates state correctly

---

### TC-AUTH-008: Email Redirect Configuration
**Objective**: Verify email redirect URL is set correctly  
**Steps**:
1. Sign up with a new email
2. Check Supabase auth logs

**Expected Results**:
- `emailRedirectTo` is set to `${window.location.origin}/`
- Email confirmation link redirects to correct domain

---

## Profile Management

### TC-PROF-001: View Own Profile
**Objective**: Verify users can view their own profile  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to `/dashboard`
2. View profile section

**Expected Results**:
- Profile data is displayed correctly
- Fields: name, photo, email, phone, role, tagline, description, social links
- Privacy settings are visible

---

### TC-PROF-002: Update Profile Information
**Objective**: Verify users can update their profile  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to `/dashboard`
2. Click edit on profile fields
3. Update name, tagline, and description
4. Save changes

**Expected Results**:
- Profile is updated in `profiles` table
- Changes are reflected immediately
- Success toast is displayed
- `updated_at` timestamp is updated

---

### TC-PROF-003: Upload Profile Photo
**Objective**: Verify users can upload and change profile photo  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to `/dashboard`
2. Click on profile photo
3. Select valid image file (< 5MB, jpg/png)
4. Upload image

**Expected Results**:
- Image is converted to base64 and stored in `profiles.photo_url`
- New photo is displayed immediately
- Toast confirms successful upload

---

### TC-PROF-004: Add Social Links
**Objective**: Verify users can add social media links  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to profile section
2. Add social links (LinkedIn, GitHub, Twitter, custom)
3. Save changes

**Expected Results**:
- Social links are stored as JSONB in `profiles.social_links`
- Links are displayed with appropriate icons
- URL validation is performed

---

### TC-PROF-005: Update Privacy Settings
**Objective**: Verify users can control profile visibility  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to `/settings`
2. Toggle `is_public`, `show_email`, `show_phone`
3. Save changes

**Expected Results**:
- Privacy settings are updated in `profiles` table
- Settings affect shared portfolio visibility
- Email/phone are hidden when toggled off

---

### TC-PROF-006: Profile Creation on First Login
**Objective**: Verify profile is auto-created for new users  
**Preconditions**: New user just signed up  
**Steps**:
1. Complete signup
2. Check `profiles` table

**Expected Results**:
- Profile record exists with `user_id = auth.uid()`
- `email` field is populated from auth
- Other fields have default empty values
- `default_content_created` is false initially

---

### TC-PROF-007: Input Validation
**Objective**: Verify profile data is validated  
**Steps**:
1. Attempt to save invalid email format
2. Attempt to save name with only whitespace
3. Attempt to save overly long text (> limits)

**Expected Results**:
- Email validation trigger prevents invalid formats
- Name validation prevents empty/whitespace-only values
- Client-side validation shows error messages
- Database triggers enforce validation

---

## Section Management

### TC-SECT-001: View All Sections
**Objective**: Verify users can view their portfolio sections  
**Preconditions**: User is logged in, has sections  
**Steps**:
1. Navigate to `/dashboard`
2. View sections list

**Expected Results**:
- All user's sections are displayed
- Sections are ordered by `created_at` (or custom order)
- Each section shows title, description, and projects

---

### TC-SECT-002: Create New Section
**Objective**: Verify users can create new sections  
**Preconditions**: User is logged in  
**Steps**:
1. Click "Add Section" button
2. Section is created with default title

**Expected Results**:
- New section is created in `sections` table
- Section has default title "New Section"
- Section belongs to current user (`user_id = auth.uid()`)
- Success toast is displayed

---

### TC-SECT-003: Update Section Title
**Objective**: Verify users can update section titles  
**Preconditions**: User has at least one section  
**Steps**:
1. Click edit on section title
2. Enter new title
3. Save changes

**Expected Results**:
- Section title is updated in database
- Changes reflect immediately
- `updated_at` timestamp is updated

---

### TC-SECT-004: Update Section Description
**Objective**: Verify users can add/edit section descriptions  
**Preconditions**: User has at least one section  
**Steps**:
1. Click edit on section description
2. Enter rich text content
3. Save changes

**Expected Results**:
- Description is saved with HTML formatting
- Rich text editor renders correctly
- Content is sanitized to prevent XSS

---

### TC-SECT-005: Delete Section
**Objective**: Verify users can delete sections  
**Preconditions**: User has more than one section  
**Steps**:
1. Click delete on a section
2. Confirm deletion

**Expected Results**:
- Section is deleted from database
- All associated projects are also deleted (cascade)
- Minimum 1 section is maintained (cannot delete last section)
- Confirmation dialog appears before deletion

---

### TC-SECT-006: Reorder Sections
**Objective**: Verify users can reorder sections  
**Preconditions**: User has multiple sections  
**Steps**:
1. Click move up/down on a section
2. Observe section order change

**Expected Results**:
- Section order is updated
- `created_at` and `updated_at` timestamps are adjusted for ordering
- Order persists after page refresh

---

### TC-SECT-007: Prevent Last Section Deletion
**Objective**: Verify users cannot delete their only section  
**Preconditions**: User has exactly one section  
**Steps**:
1. Attempt to delete the only section

**Expected Results**:
- Error toast appears
- Section is not deleted
- Message: "Cannot delete the last section"

---

### TC-SECT-008: Default Section Creation
**Objective**: Verify default section is created for new users  
**Preconditions**: New user, no sections exist  
**Steps**:
1. First login after signup
2. Check sections in database

**Expected Results**:
- Default section "My Projects" is created
- Section contains default project with links
- `default_content_created` flag is set to true in profile

---

## Project Management

### TC-PROJ-001: View Projects in Section
**Objective**: Verify users can view all projects within a section  
**Preconditions**: User has sections with projects  
**Steps**:
1. Navigate to `/dashboard`
2. View projects within a section

**Expected Results**:
- All projects are displayed
- Projects show: title, description, role, links, features, learnings

---

### TC-PROJ-002: Create New Project
**Objective**: Verify users can add projects to sections  
**Preconditions**: User has at least one section  
**Steps**:
1. Click "Add Project" in a section
2. Fill in project details
3. Save project

**Expected Results**:
- Project is created in `projects` table
- Project is linked to correct section
- `user_id` is set to current user
- Success toast is displayed

---

### TC-PROJ-003: Update Project Details
**Objective**: Verify users can edit existing projects  
**Preconditions**: User has at least one project  
**Steps**:
1. Click edit on a project
2. Update title, description, role
3. Save changes

**Expected Results**:
- Project is updated in database
- Changes reflect immediately
- `updated_at` timestamp is updated

---

### TC-PROJ-004: Add Project Links
**Objective**: Verify users can add links to projects  
**Preconditions**: User is editing a project  
**Steps**:
1. Add link with title and URL
2. Save project

**Expected Results**:
- Links are created in `project_links` table
- Links have valid URL format (validated by trigger)
- Links support http, https, mailto, tel protocols

---

### TC-PROJ-005: URL Validation for Links
**Objective**: Verify project link URLs are validated  
**Steps**:
1. Attempt to add link with empty URL
2. Attempt to add link with invalid protocol (e.g., javascript:)
3. Add valid URLs with http, https, mailto, tel

**Expected Results**:
- Empty URLs are rejected
- Invalid protocols are rejected
- Valid protocols are accepted
- Validation trigger `validate_links_url()` enforces rules

---

### TC-PROJ-006: Add Project Features/Technologies
**Objective**: Verify users can add tech stack to projects  
**Preconditions**: User is editing a project  
**Steps**:
1. Add features/technologies (e.g., "React", "TypeScript")
2. Save project

**Expected Results**:
- Features are created in `project_features` table
- Features are displayed as tags/badges
- Features can be toggled visible/hidden via `show_tech_used`

---

### TC-PROJ-007: Add Key Learnings
**Objective**: Verify users can add key learnings to projects  
**Preconditions**: User is editing a project  
**Steps**:
1. Add key learning items
2. Save project

**Expected Results**:
- Learnings are stored as text array in `projects.key_learnings`
- Learnings are displayed as bullet points
- Learnings can be toggled visible/hidden via `show_key_learnings`

---

### TC-PROJ-008: Toggle Project Sections Visibility
**Objective**: Verify users can control what's shown in projects  
**Preconditions**: User has a project with features and learnings  
**Steps**:
1. Toggle `show_tech_used` off
2. Toggle `show_key_learnings` off
3. Toggle `show_links` off

**Expected Results**:
- Toggled sections are hidden in project card
- Settings are saved in `projects` table
- Hidden sections don't appear in shared portfolio

---

### TC-PROJ-009: Delete Project
**Objective**: Verify users can delete projects  
**Preconditions**: User has at least one project  
**Steps**:
1. Click delete on a project
2. Confirm deletion

**Expected Results**:
- Project is deleted from `projects` table
- All associated links and features are deleted (cascade)
- Confirmation dialog appears

---

### TC-PROJ-010: Project Image Upload
**Objective**: Verify users can add images to projects  
**Preconditions**: User is editing a project  
**Steps**:
1. Upload project image
2. Save project

**Expected Results**:
- Image is stored as base64 or URL in `projects.image_url`
- Image is displayed in project card
- Image file size is validated (< 5MB)

---

## Portfolio Sharing

### TC-SHARE-001: Generate Share Link
**Objective**: Verify users can create shareable portfolio links  
**Preconditions**: User is logged in, profile is public  
**Steps**:
1. Navigate to `/dashboard`
2. Click "Share Portfolio"
3. Generate share link

**Expected Results**:
- New record created in `portfolio_shares` table
- Unique `share_id` is generated
- `is_active` is set to true
- Share URL is displayed: `/shared/{share_id}`

---

### TC-SHARE-002: View Shared Portfolio (Public)
**Objective**: Verify anonymous users can view shared portfolios  
**Preconditions**: Active share link exists, profile is public  
**Steps**:
1. Open share URL in incognito/logged-out browser
2. Navigate to `/shared/{share_id}`

**Expected Results**:
- Portfolio is displayed without authentication
- Profile, sections, projects, links, features are all visible
- RLS policies allow public SELECT via `get_user_from_share()`
- Analytics record is created

---

### TC-SHARE-003: Deactivate Share Link
**Objective**: Verify users can deactivate share links  
**Preconditions**: User has active share link  
**Steps**:
1. Navigate to sharing settings
2. Deactivate share link

**Expected Results**:
- `is_active` is set to false in `portfolio_shares`
- Share URL no longer works
- Accessing deactivated link shows "Portfolio not found"

---

### TC-SHARE-004: Private Profile Cannot Be Shared
**Objective**: Verify private profiles are not accessible via share  
**Preconditions**: User has share link but profile is private  
**Steps**:
1. Set `is_public = false` in profile
2. Attempt to access share URL

**Expected Results**:
- `get_user_from_share()` returns NULL
- "Portfolio not found" page is displayed
- RLS policies block access

---

### TC-SHARE-005: Privacy Settings in Shared Portfolio
**Objective**: Verify email/phone privacy settings are respected  
**Preconditions**: User has `show_email = false`, `show_phone = false`  
**Steps**:
1. Access shared portfolio
2. Check contact information display

**Expected Results**:
- Email is hidden when `show_email = false`
- Phone is hidden when `show_phone = false`
- Social links are still visible

---

### TC-SHARE-006: Multiple Share Links
**Objective**: Verify users can create multiple share links  
**Steps**:
1. Create first share link
2. Create second share link
3. Both links should work independently

**Expected Results**:
- Multiple records exist in `portfolio_shares`
- Each has unique `share_id`
- Both links display the same portfolio
- Each can be deactivated independently

---

## Analytics

### TC-ANAL-001: Record Portfolio View
**Objective**: Verify analytics are tracked when portfolio is viewed  
**Preconditions**: Active share link exists  
**Steps**:
1. Access shared portfolio via share URL
2. Check `portfolio_analytics` table

**Expected Results**:
- New record is created in `portfolio_analytics`
- Fields populated: `user_id`, `share_id`, `visitor_ip`, `user_agent`, `country`, `city`, `referrer`
- `created_at` timestamp is recorded

---

### TC-ANAL-002: View Analytics Dashboard
**Objective**: Verify users can view their portfolio analytics  
**Preconditions**: User is logged in, has analytics data  
**Steps**:
1. Navigate to `/analytics`
2. View analytics dashboard

**Expected Results**:
- Charts display view counts over time
- Geographic data is shown
- Referrer sources are listed
- Data is filtered to current user only (via RLS)

---

### TC-ANAL-003: Analytics RLS Policy
**Objective**: Verify users can only view their own analytics  
**Preconditions**: Multiple users with analytics  
**Steps**:
1. User A logs in
2. Queries `portfolio_analytics` table

**Expected Results**:
- Only records where `user_id = auth.uid()` are returned
- Other users' analytics are not visible
- RLS policy enforces isolation

---

### TC-ANAL-004: Anonymous Analytics Insert
**Objective**: Verify anonymous users can create analytics records  
**Preconditions**: User is not logged in  
**Steps**:
1. Access shared portfolio
2. Analytics record is created

**Expected Results**:
- INSERT policy allows anonymous inserts
- `user_id` is set to portfolio owner, not viewer
- No authentication required for INSERT

---

## Recruiter Features

### TC-REC-001: Access Recruiter Chat
**Objective**: Verify recruiters can access AI chat feature  
**Preconditions**: User is logged in with role 'recruiter' or 'admin'  
**Steps**:
1. Navigate to `/recruiter`
2. Access chat interface

**Expected Results**:
- Recruiter chat page is accessible
- Chat interface is displayed
- Edge function is available

---

### TC-REC-002: Send Chat Message
**Objective**: Verify recruiters can interact with AI chat  
**Preconditions**: User has recruiter role  
**Steps**:
1. Navigate to `/recruiter`
2. Enter message in chat
3. Submit message

**Expected Results**:
- Message is sent to edge function `recruiter-chat`
- AI response is received
- Chat history is maintained in session

---

### TC-REC-003: Non-Recruiter Access Denied
**Objective**: Verify regular users cannot access recruiter features  
**Preconditions**: User is logged in with role 'user'  
**Steps**:
1. Attempt to navigate to `/recruiter`

**Expected Results**:
- Access is denied or page shows "Unauthorized"
- Protected route checks for recruiter/admin role
- User is redirected or shown error

---

## Security & Permissions

### TC-SEC-001: RLS Policy - Profiles
**Objective**: Verify users can only access their own profiles  
**Steps**:
1. User A logs in
2. Attempts to query profiles table
3. Checks results

**Expected Results**:
- User A can SELECT their own profile
- User A can UPDATE their own profile
- User A cannot access other users' profiles (except via active shares)
- RLS policy: `auth.uid() = user_id`

---

### TC-SEC-002: RLS Policy - Sections
**Objective**: Verify section isolation between users  
**Steps**:
1. User A creates sections
2. User B logs in
3. User B queries sections table

**Expected Results**:
- User B sees only their own sections
- User B cannot modify User A's sections
- RLS enforces `auth.uid() = user_id`

---

### TC-SEC-003: RLS Policy - Projects
**Objective**: Verify project data isolation  
**Steps**:
1. User A creates projects
2. User B attempts to access User A's projects directly

**Expected Results**:
- User B cannot see User A's projects
- RLS blocks unauthorized access
- Only via active share can projects be viewed publicly

---

### TC-SEC-004: Role-Based Function Access
**Objective**: Verify `has_role()` function works correctly  
**Steps**:
1. Create test users with different roles
2. Call `SELECT has_role(user_id, 'admin')` for each

**Expected Results**:
- Returns true for users with specified role
- Returns false for users without role
- Function is SECURITY DEFINER and bypasses RLS

---

### TC-SEC-005: Input Sanitization
**Objective**: Verify user inputs are sanitized  
**Steps**:
1. Attempt to inject HTML/script tags in profile fields
2. Attempt SQL injection in text fields
3. Attempt XSS in rich text editor

**Expected Results**:
- HTML is sanitized using DOMPurify
- SQL injection is prevented by parameterized queries
- XSS is blocked in rich text content
- URL validation prevents javascript: protocol

---

### TC-SEC-006: CSRF Protection
**Objective**: Verify CSRF tokens are used for state-changing operations  
**Steps**:
1. Perform authenticated actions
2. Check request headers

**Expected Results**:
- Supabase auth tokens are included in requests
- Tokens are validated server-side
- RLS policies provide additional protection

---

### TC-SEC-007: Session Management
**Objective**: Verify sessions are securely managed  
**Steps**:
1. Log in and observe session storage
2. Close browser and reopen
3. Check session persistence

**Expected Results**:
- Session is stored in localStorage
- Auto-refresh is enabled for tokens
- Session expires after configured timeout
- Refresh token is used to renew session

---

### TC-SEC-008: Admin Role Cannot Be Self-Assigned
**Objective**: Verify users cannot escalate privileges  
**Steps**:
1. User signs up
2. Attempts to set role to 'admin' via metadata

**Expected Results**:
- `handle_new_user_role()` trigger only allows 'user' or 'recruiter'
- Admin role defaults to 'user' if attempted
- Manual database insert required for admin (by actual admin)

---

### TC-SEC-009: Prevent Recursive RLS
**Objective**: Verify security definer functions prevent infinite recursion  
**Steps**:
1. Execute query that uses `has_role()` in RLS policy
2. Monitor for recursion errors

**Expected Results**:
- No infinite recursion occurs
- Security definer function executes with elevated privileges
- RLS policies function correctly

---

### TC-SEC-010: User Account Deletion
**Objective**: Verify account deletion removes all user data  
**Preconditions**: User is logged in  
**Steps**:
1. Navigate to `/settings`
2. Delete account
3. Confirm deletion

**Expected Results**:
- `delete_user()` function is called
- User is deleted from `auth.users`
- All related data is cascade deleted (profiles, sections, projects, etc.)
- Session is terminated

---

## UI/UX Tests

### TC-UI-001: Responsive Design - Mobile
**Objective**: Verify app is fully responsive on mobile  
**Steps**:
1. Open app on mobile device or resize browser to 375px width
2. Navigate through all pages

**Expected Results**:
- All pages are mobile-friendly
- Navigation menu adapts to hamburger menu
- Forms are usable on small screens
- Images scale appropriately

---

### TC-UI-002: Responsive Design - Tablet
**Objective**: Verify app works on tablet devices  
**Steps**:
1. Open app on tablet or resize to 768px width
2. Test all features

**Expected Results**:
- Layout adapts to tablet breakpoints
- Touch interactions work correctly
- Content is readable and accessible

---

### TC-UI-003: Dark Mode Toggle
**Objective**: Verify theme switching works  
**Preconditions**: User is on any page  
**Steps**:
1. Click theme toggle button
2. Switch between light/dark/system modes

**Expected Results**:
- Theme changes immediately
- Preference is saved in localStorage (`lovable-ui-theme`)
- All components adapt to theme
- System theme follows OS preference

---

### TC-UI-004: Toast Notifications
**Objective**: Verify toast messages appear for user actions  
**Steps**:
1. Perform actions: save profile, create project, delete section, etc.
2. Observe toast notifications

**Expected Results**:
- Success toasts appear for successful operations
- Error toasts appear for failures
- Toasts auto-dismiss after timeout
- Toasts are accessible and readable

---

### TC-UI-005: Loading States
**Objective**: Verify loading indicators display during async operations  
**Steps**:
1. Trigger data fetching operations
2. Observe loading spinners/skeletons

**Expected Results**:
- Loading spinner appears while fetching data
- Skeleton screens shown for content loading
- Buttons show loading state during submission
- User cannot double-submit forms

---

### TC-UI-006: Form Validation Messages
**Objective**: Verify validation errors are user-friendly  
**Steps**:
1. Submit forms with invalid data
2. Observe error messages

**Expected Results**:
- Clear, actionable error messages
- Errors appear near relevant form fields
- Required fields are marked
- Validation happens on blur and submit

---

### TC-UI-007: Accessibility - Keyboard Navigation
**Objective**: Verify app is keyboard accessible  
**Steps**:
1. Navigate app using only keyboard (Tab, Enter, Esc)
2. Test all interactive elements

**Expected Results**:
- All interactive elements are focusable
- Focus indicators are visible
- Dialogs can be closed with Esc
- Forms can be submitted with Enter
- Tab order is logical

---

### TC-UI-008: Accessibility - Screen Reader
**Objective**: Verify screen reader compatibility  
**Steps**:
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate through app

**Expected Results**:
- All images have alt text
- Form labels are associated correctly
- ARIA attributes are used appropriately
- Semantic HTML is used

---

### TC-UI-009: Error Boundary
**Objective**: Verify error boundaries catch and display errors gracefully  
**Steps**:
1. Trigger a component error (if possible in test env)
2. Observe error handling

**Expected Results**:
- Error boundary catches error
- User-friendly error message is displayed
- App doesn't completely crash
- Option to refresh or return home

---

### TC-UI-010: Cookie Consent
**Objective**: Verify cookie consent banner appears and functions  
**Steps**:
1. Visit app as new user (clear cookies)
2. Observe cookie consent banner
3. Accept or decline cookies

**Expected Results**:
- Banner appears on first visit
- User can accept, decline, or customize
- Choice is stored in localStorage
- Banner doesn't reappear after choice made
- Link to cookie policy is present

---

## Performance Tests

### TC-PERF-001: Page Load Time
**Objective**: Verify pages load within acceptable timeframe  
**Steps**:
1. Clear cache
2. Load each major page
3. Measure load time

**Expected Results**:
- Landing page loads < 2 seconds
- Dashboard loads < 3 seconds
- Shared portfolio loads < 2 seconds
- Metrics measured with Lighthouse/DevTools

---

### TC-PERF-002: Database Query Performance
**Objective**: Verify queries execute efficiently  
**Steps**:
1. Load dashboard with many sections/projects
2. Monitor query execution time in Supabase logs

**Expected Results**:
- Queries use appropriate indexes
- N+1 query problems are avoided
- Related data is fetched in minimal queries
- Response time < 500ms for typical loads

---

### TC-PERF-003: Image Optimization
**Objective**: Verify images are optimized  
**Steps**:
1. Check image file sizes and formats
2. Verify lazy loading is implemented

**Expected Results**:
- Images are compressed appropriately
- Lazy loading prevents unnecessary downloads
- Base64 encoding used judiciously (small images only)
- Large images are not inline base64

---

## Edge Cases & Error Handling

### TC-EDGE-001: Empty State - No Sections
**Objective**: Verify graceful handling when user has no sections  
**Steps**:
1. Delete all sections for a user (except minimum 1)
2. View dashboard

**Expected Results**:
- At least one section is always maintained
- Empty state UI is shown if needed
- User is guided to create content

---

### TC-EDGE-002: Empty State - No Projects
**Objective**: Verify sections display correctly without projects  
**Steps**:
1. Create section with no projects
2. View dashboard

**Expected Results**:
- Section is displayed
- "No projects yet" or similar message shown
- "Add Project" button is prominent

---

### TC-EDGE-003: Network Error Handling
**Objective**: Verify app handles network failures gracefully  
**Steps**:
1. Disconnect network
2. Attempt operations

**Expected Results**:
- User-friendly error messages
- Retry mechanisms where appropriate
- Offline indicator if implemented
- No silent failures

---

### TC-EDGE-004: Concurrent Edits
**Objective**: Verify handling of simultaneous edits  
**Steps**:
1. Open same portfolio in two tabs
2. Edit same field in both
3. Save in sequence

**Expected Results**:
- Last write wins (expected Supabase behavior)
- No data corruption
- Optimistic updates may show stale data temporarily

---

### TC-EDGE-005: Long Text Content
**Objective**: Verify app handles long content gracefully  
**Steps**:
1. Enter very long text in description fields
2. Save and view

**Expected Results**:
- Content is truncated or scrollable in UI
- Database accepts long text (within limits)
- No layout breaking
- Performance remains acceptable

---

### TC-EDGE-006: Special Characters
**Objective**: Verify special characters are handled correctly  
**Steps**:
1. Enter text with emojis, unicode, special chars
2. Save and retrieve

**Expected Results**:
- Special characters are preserved
- No encoding issues
- Proper escaping prevents injection

---

### TC-EDGE-007: Rapid Successive Actions
**Objective**: Verify debouncing/throttling prevents issues  
**Steps**:
1. Rapidly click save button multiple times
2. Rapidly create multiple sections

**Expected Results**:
- Duplicate actions are prevented
- Loading states prevent double-submission
- Database maintains consistency

---

## Integration Tests

### TC-INT-001: Full User Journey - New User
**Objective**: Test complete new user experience  
**Steps**:
1. Sign up as new user
2. Profile is created
3. Default section and project are created
4. Edit profile information
5. Add new project
6. Generate share link
7. View shared portfolio (logged out)
8. Check analytics

**Expected Results**:
- All steps complete successfully
- Data persists correctly
- User experience is smooth and intuitive

---

### TC-INT-002: Data Cascade on User Deletion
**Objective**: Verify all related data is cleaned up on account deletion  
**Steps**:
1. Create user with full portfolio (profile, sections, projects, shares, analytics)
2. Delete user account
3. Check all related tables

**Expected Results**:
- All records with `user_id` are deleted
- Foreign key cascades work correctly
- No orphaned records remain

---

### TC-INT-003: Share Link Lifecycle
**Objective**: Test complete sharing workflow  
**Steps**:
1. Create share link
2. View shared portfolio
3. Analytics are recorded
4. Deactivate share link
5. Verify link no longer works
6. Reactivate or create new link

**Expected Results**:
- Complete workflow functions correctly
- State transitions are handled
- RLS policies enforce access control

---

## Regression Tests

### TC-REG-001: Auth After Profile Update
**Objective**: Verify auth still works after profile changes  
**Steps**:
1. Update profile email in settings
2. Log out and log back in

**Expected Results**:
- Authentication still works
- Email update is reflected
- Session management is not broken

---

### TC-REG-002: Existing Data After Migration
**Objective**: Verify existing data remains intact after schema changes  
**Preconditions**: Database has existing data  
**Steps**:
1. Apply new migration
2. Verify existing records are accessible
3. Check for data integrity

**Expected Results**:
- No data loss
- Migrations are backwards compatible
- Default values are applied correctly

---

## Test Execution Notes

### Test Environment Setup
1. Create test Supabase project or use staging environment
2. Seed test data for various scenarios
3. Create test users with different roles
4. Clear localStorage between test runs for consistency

### Test Data Requirements
- At least 3 test users (user, recruiter, admin roles)
- Multiple sections and projects per user
- Active and inactive share links
- Analytics data with various countries/referrers

### Automation Recommendations
- Use Playwright or Cypress for E2E tests
- Use Jest + React Testing Library for component tests
- Use Supabase test database for integration tests
- Mock external APIs and file uploads in tests

### Priority Levels
- **P0 (Critical)**: Auth, RLS policies, data security, profile CRUD
- **P1 (High)**: Portfolio management, sharing, core user flows
- **P2 (Medium)**: Analytics, UI/UX, accessibility
- **P3 (Low)**: Edge cases, performance optimizations

### Test Coverage Goals
- Unit tests: > 80% code coverage
- Integration tests: All critical user journeys
- E2E tests: Happy paths + major error scenarios
- Security tests: All RLS policies, input validation, auth flows
