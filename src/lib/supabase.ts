import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://modify-tracker-addresses-printers.trycloudflare.com";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN0cmlrZS1hcmVuYSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.Jpgq0jECmTph-t1_zFuQb_MAYJnHXi_ieJcrwV9fRPY";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

/**
 * Cliente Supabase público (browser / leituras SSR) conectado à instância
 * 100% isolada do Strike Arena (strike-arena-db + strike-arena-rest + strike-arena-tunnel).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/**
 * Cliente Supabase administrativo (Server Actions / Seed) da instância isolada do Strike Arena.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
