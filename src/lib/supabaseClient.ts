import { createClient } from '@supabase/supabase-js';

// Default to empty strings, but log warnings if environment variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log warnings if environment variables are missing
if (!supabaseUrl) {
  console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export a helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};