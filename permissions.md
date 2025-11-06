# Permissions & Authorization

## Overview

This application implements a **secure, role-based access control (RBAC)** system using Supabase Row Level Security (RLS) policies. All data access is controlled at the database level, ensuring security cannot be bypassed from the frontend.

## Role System

### Available Roles

Roles are defined using a PostgreSQL enum type `app_role`:

```sql
CREATE TYPE public.app_role AS ENUM ('user', 'recruiter', 'admin');
```

| Role | Description | Assignment |
|------|-------------|------------|
| `user` | Standard user with portfolio management capabilities | Default role for all signups |
| `recruiter` | Special role with access to recruiter features and AI chat | Must be selected during signup |
| `admin` | (Reserved for future use) | Not currently implemented |

### Role Storage

Roles are stored in the `user_roles` table:

```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);
```

**Important Security Notes:**
- Roles are **NOT** stored in the `profiles` or `auth.users` tables to prevent privilege escalation
- Each user can only have one role (enforced by unique constraint)
- Role changes after signup are **not allowed** (no self-assignment)

## Role Assignment

### Signup Flow

Roles are assigned **only during user registration** using a database trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'user'::app_role
  );
  
  -- Only allow 'user' or 'recruiter' roles from signup
  IF user_role NOT IN ('user', 'recruiter') THEN
    user_role := 'user'::app_role;
  END IF;
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
```

### Frontend Signup Code

```typescript
const { error } = await supabase.auth.signUp({ 
  email, 
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
    data: {
      role: userRole // 'user' or 'recruiter'
    }
  }
});
```

### Security Constraints

- ✅ Roles can be assigned during signup
- ✅ Only `user` and `recruiter` roles are allowed from signup
- ❌ Users cannot change their own role after signup
- ❌ Users cannot assign themselves `admin` role
- ❌ No self-service role updates (prevents privilege escalation)

## Permission Checking

### Security Definer Function

To avoid infinite recursion in RLS policies, role checks use a `SECURITY DEFINER` function:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### Usage in RLS Policies

```sql
-- Example: Only recruiters can access recruiter features
CREATE POLICY "Recruiters can access recruiter data"
ON public.recruiter_table
FOR SELECT
USING (public.has_role(auth.uid(), 'recruiter'));
```

### Frontend Role Checking

```typescript
// Check user role in React components
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();

if (userRole?.role === 'recruiter') {
  // Show recruiter features
}
```

## Row Level Security Policies

All tables have RLS enabled. Below are the permission matrices for each table.

### Profiles Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own profile | ✅ Own profile | ✅ Own profile | ❌ |
| Public (with active share) | ✅ Shared profiles | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

**RLS Policies:**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- Public can view profiles with active shares
CREATE POLICY "Public can view profiles with active shares" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM portfolio_shares
    WHERE portfolio_shares.user_id = profiles.user_id
    AND portfolio_shares.is_active = true
  )
);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);
```

### Sections Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own sections | ✅ Own sections | ✅ Own sections | ✅ Own sections |
| Public (with active share) | ✅ Shared sections | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

**RLS Policies:**
```sql
-- Users can view their own sections
CREATE POLICY "Users can view their own sections" ON public.sections
FOR SELECT USING (auth.uid() = user_id);

-- Public can view sections with active shares
CREATE POLICY "Public can view sections with active shares" ON public.sections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM portfolio_shares
    WHERE portfolio_shares.user_id = sections.user_id
    AND portfolio_shares.is_active = true
  )
);

-- Users can insert their own sections
CREATE POLICY "Users can insert their own sections" ON public.sections
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sections
CREATE POLICY "Users can update their own sections" ON public.sections
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sections
CREATE POLICY "Users can delete their own sections" ON public.sections
FOR DELETE USING (auth.uid() = user_id);
```

### Projects Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own projects | ✅ Own projects | ✅ Own projects | ✅ Own projects |
| Public (with active share) | ✅ Shared projects | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

### Project Links Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own links | ✅ Own links | ✅ Own links | ✅ Own links |
| Public (with active share) | ✅ Shared links | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

### Project Features Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own features | ✅ Own features | ✅ Own features | ✅ Own features |
| Public (with active share) | ✅ Shared features | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

### Portfolio Shares Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own shares | ✅ Own shares | ✅ Own shares | ✅ Own shares |
| Public | ✅ Active shares only | ❌ | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

**RLS Policies:**
```sql
-- Users can view their own shares
CREATE POLICY "Users can view their own shares" ON public.portfolio_shares
FOR SELECT USING (auth.uid() = user_id);

-- Public can verify share existence (for validation)
CREATE POLICY "Public can verify share existence" ON public.portfolio_shares
FOR SELECT USING (is_active = true);
```

### Portfolio Analytics Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own analytics | ❌ | ❌ | ❌ |
| Anonymous | ❌ | ✅ Any (for tracking) | ❌ | ❌ |
| Other users | ❌ | ❌ | ❌ | ❌ |

**RLS Policies:**
```sql
-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics" ON public.portfolio_analytics
FOR SELECT USING (auth.uid() = user_id);

-- Allow anonymous analytics inserts (for tracking shared portfolio views)
CREATE POLICY "Allow anonymous analytics inserts" ON public.portfolio_analytics
FOR INSERT WITH CHECK (true);
```

### User Roles Table

| Role | SELECT | INSERT | UPDATE | DELETE |
|------|--------|--------|--------|--------|
| Owner | ✅ Own roles | ✅ Own roles* | ✅ Own roles* | ✅ Own roles* |
| Other users | ❌ | ❌ | ❌ | ❌ |

**Note:** While RLS technically allows these operations, the `handle_new_user_role()` trigger is the **only** way roles are assigned in practice.

## Feature-Based Permissions

### Portfolio Management
- **Who:** All authenticated users
- **What:** Create, edit, delete own portfolios, sections, and projects
- **How:** RLS policies check `auth.uid() = user_id`

### Portfolio Sharing
- **Who:** All authenticated users
- **What:** Generate and manage share links for their portfolios
- **How:** RLS policies on `portfolio_shares` table

### Public Portfolio Viewing
- **Who:** Anyone (authenticated or anonymous)
- **What:** View portfolios with active share links
- **How:** RLS policies check for active share existence

### Portfolio Analytics
- **Who:** Portfolio owners only
- **What:** View analytics for their own portfolios
- **How:** RLS policies check `auth.uid() = user_id`

### Recruiter Features
- **Who:** Users with `recruiter` role only
- **What:** Access AI-powered candidate search and chat
- **How:** Role-based route protection + `has_role()` checks

### Edge Functions
- **Who:** Based on function logic
- **What:** Execute serverless functions (e.g., `recruiter-chat`)
- **How:** Function-level auth checks using `Authorization` header

## Security Best Practices

### ✅ DO

- Always check permissions at the database level (RLS policies)
- Use the `has_role()` security definer function for role checks
- Validate all user input before database operations
- Keep roles in a separate `user_roles` table
- Use `auth.uid()` in RLS policies for user identification
- Assign roles during signup via triggers

### ❌ DON'T

- Store roles in `profiles` or `auth.users` tables
- Check admin status using localStorage or sessionStorage
- Allow self-service role changes after signup
- Bypass RLS policies using `SECURITY DEFINER` without careful review
- Trust client-side role checks for security decisions
- Create RLS policies that reference the same table (causes infinite recursion)

## Common Permission Patterns

### Owner-Only Access
```sql
CREATE POLICY "Users can access their own data" ON public.table_name
FOR ALL USING (auth.uid() = user_id);
```

### Public Read with Owner Write
```sql
-- Public read
CREATE POLICY "Anyone can read" ON public.table_name
FOR SELECT USING (true);

-- Owner write
CREATE POLICY "Users can modify their own data" ON public.table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Role-Based Access
```sql
CREATE POLICY "Recruiters only" ON public.table_name
FOR SELECT USING (public.has_role(auth.uid(), 'recruiter'));
```

### Conditional Public Access
```sql
CREATE POLICY "Public can view active shares" ON public.table_name
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM portfolio_shares
    WHERE portfolio_shares.user_id = table_name.user_id
    AND portfolio_shares.is_active = true
  )
);
```

## Troubleshooting

### Infinite Recursion Error
**Problem:** RLS policy references the same table it's applied to

**Solution:** Use a `SECURITY DEFINER` function to break the recursion
```sql
-- Wrong
CREATE POLICY "..." ON profiles
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Correct
CREATE POLICY "..." ON profiles
USING (public.has_role(auth.uid(), 'admin'));
```

### Row Violates RLS Policy
**Problem:** Insert/update fails due to `WITH CHECK` clause

**Solution:** Ensure `user_id` is set to `auth.uid()` in your insert/update
```typescript
// Wrong
await supabase.from('projects').insert({ title: 'My Project' });

// Correct
await supabase.from('projects').insert({ 
  title: 'My Project',
  user_id: user.id 
});
```

### Cannot See Data After Signup
**Problem:** User doesn't have required role

**Solution:** Verify role was assigned during signup
```sql
-- Check user's role
SELECT * FROM user_roles WHERE user_id = '<user_id>';

-- Manually assign if needed (only for debugging/testing)
INSERT INTO user_roles (user_id, role) VALUES ('<user_id>', 'user');
```

## Testing Permissions

### Manual Testing Steps

1. **Test Owner Access:**
   - Sign up as a user
   - Create portfolio data
   - Verify you can view/edit your own data

2. **Test Public Sharing:**
   - Create a share link
   - Open in incognito/different browser
   - Verify portfolio is visible
   - Verify you cannot edit

3. **Test Role-Based Access:**
   - Sign up as recruiter
   - Verify recruiter features are accessible
   - Sign up as regular user
   - Verify recruiter features are hidden

4. **Test Data Isolation:**
   - Create two user accounts
   - Verify User A cannot see User B's data
   - Verify User A cannot modify User B's data

### SQL Testing Queries

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Test permission as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '<user_id>';
SELECT * FROM profiles; -- Should only see that user's profile
```

## Future Enhancements

- [ ] Implement `admin` role with full system access
- [ ] Add organization/team support with shared portfolios
- [ ] Implement fine-grained permissions (e.g., read-only collaborators)
- [ ] Add audit logging for permission changes
- [ ] Create permission groups/templates
- [ ] Implement time-based access controls
- [ ] Add two-factor authentication for sensitive operations
