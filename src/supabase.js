/* ==========================================================================
   SUPABASE DATABASE & REALTIME PERSISTENCE INTEGRATION (Shovel Wallet)
   ========================================================================== */

// Supabase Configuration — uses Vite env variables (set in .env file)
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY
};

/**
 * SQL Schema script to run in Supabase SQL Editor:
 * 
 * CREATE TABLE users (
 *   id BIGINT PRIMARY KEY,
 *   username TEXT,
 *   first_name TEXT,
 *   shovel_balance NUMERIC DEFAULT 12450.00,
 *   ton_balance NUMERIC DEFAULT 2.45,
 *   wallet_address TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE TABLE swap_transactions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id BIGINT,
 *   from_token TEXT,
 *   to_token TEXT,
 *   from_amount NUMERIC,
 *   to_amount NUMERIC,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */
