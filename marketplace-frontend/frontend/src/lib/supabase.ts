import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  identity_verified: boolean;
  verification_step: number;
  total_verification_steps: number;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  name: string;
  location: string;
  image_url?: string;
  price: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  property_id?: string;
  location: string;
  amount: number;
  transaction_date: string;
  time?: string;
  created_at: string;
};
