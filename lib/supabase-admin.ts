import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * service_role anahtarıyla oluşturulan istemci — TÜM RLS kurallarını atlar.
 * SADECE sunucu tarafında (Server Action'larda) kullanılır, asla client
 * bileşenlere/tarayıcıya sızdırılmaz (bu yüzden ayrı bir dosyada tutuluyor).
 *
 * Tembel (lazy) oluşturulur — modül import edilir edilmez `createClient`
 * çağrılırsa, SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY tanımlı olmadığında
 * (ör. Vercel'de ortam değişkeni eklenmeden önceki build'ler) "supabaseUrl is
 * required" hatasıyla build'in kendisi çöküyordu. Artık istemci sadece
 * gerçekten bir Storage işlemi yapılırken oluşturuluyor.
 */
let client: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil — CV yükleme/indirme özelliği çalışmayacak."
      );
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver);
  },
});

export const CV_BUCKET = "cvs";
