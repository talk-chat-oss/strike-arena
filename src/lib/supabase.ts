import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.staffygo.com.br";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.7J3LIe5Ytw-bpXWv_QBUF37KpyN3gb2f3xL_xjA2rGQ";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

/**
 * Cliente Supabase público (browser / leituras SSR) conectado ao Supabase Local
 * no deathstar-server via Cloudflare Tunnel (https://api.staffygo.com.br).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

/**
 * Cliente Supabase administrativo (Server Actions / Seed) com Service Role Key.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
