import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public client config. The anon key is a publishable key (safe to ship in the
// web bundle) — it is protected by Row Level Security on the database. The
// service_role / secret keys are NEVER used here. Env vars override the
// defaults so the same code works across environments.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jcllxgxetklyjlknakdz.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbGx4Z3hldGtseWpsa25ha2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDAzMzcsImV4cCI6MjA5ODA3NjMzN30.BBH4NVVVoyHzICWKNQvaeHw8Py7KdT3gcaBr-qFh-pM';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
