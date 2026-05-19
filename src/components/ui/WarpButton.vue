<script setup>

const emit = defineEmits(['warp'])

defineProps({
  title: {
    type: String,
    default: 'Button',
  },

  variant: {
    type: String,
    default: 'default',
  },
})

</script>

<template>
  <button
  :class="[
    'group relative overflow-hidden transition-all duration-300 border-4 border-[#ece8e1]',
    'hover:-translate-y-[1px]',
    'hover:shadow-sm',
    'hover:border-white', 

    variant === 'default' &&
      'min-w-[210px] py-1 px-8 rounded-full border border-[#d9d4cb] bg-[#ece8e1] hover:bg-white',

    variant === 'warp' &&
      'min-w-[260px] py-2 px-10 rounded-full border border-[#d9d4cb] bg-[#ece8e1] hover:bg-white',

    variant === 'small' &&
      'h-[52px] px-6 rounded-full border border-[#d9d4cb] bg-[#ece8e1] hover:bg-white',
  ]"
>
    <!-- inner border -->
    <div
  class="absolute inset-[3px]
         rounded-full
         border border-[#d6d1c8]
         transition-all duration-300"
></div>

    <!-- text -->
<span
  :class="[
    'relative z-10 text-[#3a3937]',

    variant === 'warp'
      ? 'text-[25px]'
      : 'text-[22px]'
  ]"
>
  {{ title }}
</span>
  </button>
</template>