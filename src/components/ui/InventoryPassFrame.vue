<script setup>
defineProps({
    image: {
        type: String,
        default: '',
    },

    amount: {
        type: [String, Number],
        default: 0,
    },

    showPlus: {
        type: Boolean,
        default: false,
    },
})
</script>

<template>
    <div class="flex items-center justify-end gap-0
           relative
           border-1 border-white/70 hover:border-white
           w-[150px]
           ps-4 py-0
           rounded-full
           bg-black/40
           transition-all duration-300
           hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        <!-- icon -->
        <img :src="image" class="w-12 h-12
             object-contain
             absolute top-[-9px] left-[-2px]" />

        <!-- amount -->
        <span :class="['text-white text-[20px]', showPlus ? 'pe-3 border-r border-white/20' : 'pe-4' ]">
            {{ amount }}
        </span>

        <!-- plus button -->
        <button v-if="showPlus" class="px-1
             text-[#EFD5A6]
             flex items-center justify-center
             hover:bg-[#cbb38a]/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    </div>
</template>