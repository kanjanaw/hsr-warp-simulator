<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const banner = ref(null)

onMounted(async () => {

  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .single()

  banner.value = data
})
</script>

<template>
  <div>
    {{ banner }}
  </div>
</template>