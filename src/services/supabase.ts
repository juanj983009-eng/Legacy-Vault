import { createClient } from '@supabase/supabase-js';

// La clave publicable identifica la aplicación; no concede permisos de servicio.
export const supabase = createClient(
  'https://coflozegadpphsaljjcg.supabase.co',
  'sb_publishable_ZXTWZMyclu9ith5D1JP-zw_8UZV-L4f',
);
