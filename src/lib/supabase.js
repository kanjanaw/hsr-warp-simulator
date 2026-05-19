import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fanlhagocohqptbtvvyz.supabase.co'
const supabaseKey = 'sb_publishable_b5J35wPfrlVl2TL43kQrjg_t3yUxmyP'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)