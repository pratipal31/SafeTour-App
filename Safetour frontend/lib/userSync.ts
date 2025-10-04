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

    // Upsert the user to Supabase
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: ['id'] })
      .select()
      .maybeSingle(); // Ensures we get a single object if exists

    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return { success: false, error };
    }

    console.log('User synced to Supabase successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error syncing user:', error);
    return { success: false, error };
  }
}
