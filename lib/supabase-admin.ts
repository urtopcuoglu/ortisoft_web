import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role anahtarıyla oluşturulan istemci — TÜM RLS kurallarını atlar.
 * SADECE sunucu tarafında (Server Action'larda) kullanılır, asla client
 * bileşenlere/tarayıcıya sızdırılmaz (bu yüzden ayrı bir dosyada tutuluyor).
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const CV_BUCKET = "cvs";
