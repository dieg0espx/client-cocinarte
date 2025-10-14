# Admin Users Setup Guide

This guide explains how to set up and manage admin users for the Cocinarte dashboard.

## Overview

The `/dashboard` routes are protected and only accessible to admin users. The `/login` page is publicly accessible, but only admin users can successfully log in and access the dashboard. Admin access is controlled by the `admin_users` table in Supabase, which stores email addresses of authorized administrators.

## Initial Setup

### 1. Create the Admin Users Table

Run the SQL migration script in your Supabase project:

1. Go to the Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the contents of `scripts/create-admin-users-table.sql`

This will create:
- The `admin_users` table
- Necessary indexes for performance
- Row Level Security (RLS) policies

### 2. Add Your First Admin User

After creating the table, add your first admin user by running this SQL query in the Supabase SQL Editor:

```sql
INSERT INTO public.admin_users (email) 
VALUES ('your-email@example.com');
```

**Important:** Replace `your-email@example.com` with the actual email address you use to sign in.

## How It Works

### Authentication Flow

1. Any user can visit the `/login` page
2. User enters their credentials and attempts to sign in
3. After successful authentication, the system checks if the user's email exists in the `admin_users` table
4. If not an admin, the user is signed out and shown an error message
5. If the user is an admin, they are redirected to the dashboard
6. When accessing `/dashboard` routes, middleware verifies the user is authenticated and is an admin
7. Non-admin users are redirected to the home page with an error message

### Protected Routes

The following routes are protected and require admin access:
- `/dashboard` - Main dashboard (redirects to `/login` if not authenticated)
- `/dashboard/bookings` - Bookings management
- `/dashboard/classes` - Classes management
- `/dashboard/payments` - Payments management
- `/dashboard/students` - Students management

### Public Routes

The following routes are accessible to everyone:
- `/login` - Login page (but only admins can successfully authenticate and access the dashboard)

## Managing Admin Users

### Add a New Admin User

**Option 1: Using Supabase SQL Editor**

```sql
INSERT INTO public.admin_users (email) 
VALUES ('new-admin@example.com');
```

**Option 2: Using Supabase Table Editor**

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select the `admin_users` table
4. Click "Insert row"
5. Enter the email address
6. Save

### Remove an Admin User

**Option 1: Using Supabase SQL Editor**

```sql
DELETE FROM public.admin_users 
WHERE email = 'admin-to-remove@example.com';
```

**Option 2: Using Supabase Table Editor**

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select the `admin_users` table
4. Find the row with the email address
5. Click the delete icon

### List All Admin Users

```sql
SELECT * FROM public.admin_users 
ORDER BY created_at DESC;
```

## Security Features

### Row Level Security (RLS)

The `admin_users` table has RLS enabled with the following policies:

1. **Read Access**: All authenticated users can read the admin_users table (needed for middleware checks)
2. **Modify Access**: Only existing admins can add, update, or delete admin users (prevents non-admins from adding themselves)

### Email Normalization

All email addresses are automatically converted to lowercase to ensure consistent matching.

### Error Handling

If the admin check fails or the table doesn't exist yet, the system will:
- Log the error to the console
- Deny access (fail closed)
- Redirect non-admin users to the home page

## Troubleshooting

### "Access Denied" or Redirect Loop

**Problem**: You're being redirected even though you added your email to the table.

**Solutions**:
1. Verify your email in the `admin_users` table matches exactly (including case)
2. Check that you're signed in with the correct email address
3. Try signing out and signing back in
4. Verify the table was created successfully

### Table Doesn't Exist Error

**Problem**: Console shows error about `admin_users` table not existing.

**Solution**: Run the SQL migration script from `scripts/create-admin-users-table.sql`

### Can't Add New Admin Users

**Problem**: Getting permission errors when trying to add new admins.

**Solution**: 
1. Make sure you're signed in as an existing admin
2. Check that RLS policies are properly configured
3. Verify you have at least one admin in the table (you may need to use the Supabase service role key if locked out)

### Locked Out (No Admin Users)

**Problem**: No admin users exist and you can't add any.

**Solution**: Use the Supabase SQL Editor with service role access to add an admin:

```sql
INSERT INTO public.admin_users (email) 
VALUES ('your-email@example.com');
```

The SQL Editor in the Supabase Dashboard runs with elevated privileges and can bypass RLS policies.

## Best Practices

1. **Keep Admin List Small**: Only add users who genuinely need admin access
2. **Use Work Emails**: Use professional email addresses for admin accounts
3. **Regular Audits**: Periodically review the admin_users table and remove inactive admins
4. **Document Changes**: Keep track of who added/removed admin users
5. **Secure Passwords**: Ensure all admin users use strong, unique passwords

## Developer Notes

### Helper Functions

The `lib/supabase/admin.ts` file provides utility functions:

- `isAdminUser(supabase, email)` - Check if an email is an admin
- `getAdminUsers(supabase)` - Get all admin users
- `addAdminUser(supabase, email)` - Add a new admin user
- `removeAdminUser(supabase, email)` - Remove an admin user

### Middleware

The admin check is implemented in `lib/supabase/middleware.ts` and runs on every request to admin routes.

### Page-Level Checks

Each dashboard page also includes a server-side admin check as a secondary security measure.

## Support

If you encounter issues not covered in this guide, please:
1. Check the browser console for error messages
2. Review the Supabase logs
3. Verify all SQL migrations were run successfully
4. Contact your development team for assistance

