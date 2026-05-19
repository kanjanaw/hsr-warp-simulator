<template>
  <div class="flex flex-col gap-6 w-[220px]">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('change', tab.id)"
      class="relative overflow-hidden rounded-lg border transition-all duration-300"
      :class="
        activeTab === tab.id
          ? 'border-yellow-300 scale-[1.15] bg-white'
          : 'border-white/10 opacity-60 hover:opacity-100'
      "
    >
      <!-- รูป -->
      <img
        :src="tab.image"
        :alt="tab.name"
        class="h-[80px] w-full object-cover"
      />

      <!-- overlay -->
      <div
        class="absolute inset-0"
        :class="activeTab === tab.id ? 'bg-black/0' : 'bg-black/30'"
      ></div>

      <!-- active glow -->
      <div
        v-if="activeTab === tab.id"
        class="absolute inset-0 ring-2 ring-yellow-300 rounded-lg"
      ></div>
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },

  activeTab: {
    type: String,
    default: '',
  },
})

defineEmits(['change'])
</script>