import { supabase } from '../lib/supabase'

export async function getActiveBanner() {

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .single()

  return data
}