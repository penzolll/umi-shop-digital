
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { config } from '../../config/env';

export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
