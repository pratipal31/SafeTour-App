import { supabase } from './supabase';

interface ClerkUser {
  id: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export async function syncUserToSupabase(clerkUser: ClerkUser) {
  try {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.error('No email found for user');
      return { success: false, error: 'No email found' };
    }

    const userData = {
      id: clerkUser.id,
      email: email,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      image_url: clerkUser.imageUrl || null,
      updated_at: new Date().toISOString(),
    };

    // First, check if user already exists by email
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error checking existing user:', selectError);
      return { success: false, error: selectError };
    }

    let result;

    if (existingUser) {
      // User exists, update the record
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          image_url: userData.image_url,
          updated_at: userData.updated_at,
        })
        .eq('email', email)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return { success: false, error };
      }

      console.log('User updated in Supabase successfully:', data);
      result = { success: true, data, action: 'updated' };
    } else {
      // User doesn't exist, insert new record
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error inserting user to Supabase:', error);
        return { success: false, error };
      }

      console.log('User inserted to Supabase successfully:', data);
      result = { success: true, data, action: 'inserted' };
    }

    return result;
  } catch (error) {
    console.error('Unexpected error syncing user:', error);
    return { success: false, error };
  }
}
