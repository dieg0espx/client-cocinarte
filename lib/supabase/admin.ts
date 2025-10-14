import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Check if a user email is in the admin_users table
 * @param supabase - Supabase client instance
 * @param email - User email to check
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdminUser(
  supabase: SupabaseClient,
  email: string | undefined
): Promise<boolean> {
  if (!email) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      // If the error is that no rows were found, the user is not an admin
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking admin status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Exception checking admin status:', error)
    return false
  }
}

/**
 * Get all admin users
 * @param supabase - Supabase client instance
 * @returns Promise with array of admin user emails
 */
export async function getAdminUsers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Add a new admin user
 * @param supabase - Supabase client instance
 * @param email - Email address to add as admin
 * @returns Promise with result
 */
export async function addAdminUser(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .insert([{ email: email.toLowerCase() }])
    .select()
    .single()

  if (error) {
    console.error('Error adding admin user:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Remove an admin user
 * @param supabase - Supabase client instance
 * @param email - Email address to remove from admins
 * @returns Promise with result
 */
export async function removeAdminUser(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .delete()
    .eq('email', email.toLowerCase())

  if (error) {
    console.error('Error removing admin user:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

