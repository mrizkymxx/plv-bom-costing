import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjkjahetvxnimchkunqp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa2phaGV0dnhuaW1jaGt1bnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjUzNzYsImV4cCI6MjEwNjYwMTM3Nn0.W4u7u0zuBQ_hlLks3So0MrlDhRlAEHOHXVj-KOLZU-4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
