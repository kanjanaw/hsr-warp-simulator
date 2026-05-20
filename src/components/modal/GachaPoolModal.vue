<script setup>

const emit = defineEmits([
  'close',
  'edit',
])

defineProps({
  characters: {
    type: Array,
    default: () => [],
  },

  title: {
    type: String,
    default: 'ตัวละครคำเชิญจากดวงดาว',
  },
})
</script>

<template>
  <div
    class="fixed inset-0 z-[999]
           flex items-center justify-center"
  >
    <!-- bg -->
    <div
      class="absolute inset-0
             bg-gradient-to-b from-stone-950/80 to-[#695F55]/95 backdrop-blur-md"
    ></div>

        <button class="absolute top-10 right-15 z-20
         text-white text-5xl" @click="$emit('close')">
            ×
        </button>



    <!-- particles -->
    <div
      class="absolute inset-0
             bg-[radial-gradient(circle,_rgba(255,215,120,0.18)_1px,_transparent_1px)]
             [background-size:40px_40px]
             opacity-40"
    ></div>

    <!-- content -->
    <div
      class="relative z-10
             w-[1350px]
             px-10"
    >
      <!-- top -->
      <div class="text-center">
        <h1
          class="text-[36px]
                 text-[#d7b37a]"
        >
          {{ title }}
        </h1>

        <div
          class="w-full h-[1px]
                 bg-white/20
                 mt-5"
        ></div>

        <p
          class="text-white/60
                 text-[20px]
                 mt-5"
        >
          เมื่อได้รับตัวละคร 5 ดาว จากกิจกรรมวาร์ปตัวละคร/ กิจกรรมวาร์ปตัวละครคอลแลบ จะมีโอกาสได้รับตัวละครเรท UP หรือหนึ่งในตัวละครดังต่อไปนี้
        </p>
      </div>

      <!-- cards -->
      <div
        class="mt-12
               flex justify-center"
      >
        <div
          class="flex gap-3
                 p-2
                 border border-white/20
                 bg-black/20"
        >
          <div
            v-for="character in characters"
            :key="character.id"
            class="relative
                   w-[160px]
                   h-[350px]
                   overflow-hidden
                   border border-white/10
                   bg-[#f5f1ea]"
          >
            <!-- image -->
            <img
              :src="character.image"
              class="absolute inset-0
                     w-full h-full
                     object-cover"
            />

            <!-- rarity -->
            <div
              class="absolute inset-x-0 bottom-0
                     h-[120px]
                     bg-gradient-to-t
                     from-[#f0d48c]
                     to-transparent"
            ></div>

            <!-- badge -->
            <div
              v-if="character.owned === false"
              class="absolute left-0 right-0 bottom-[70px]
                     mx-auto
                     w-fit
                     px-6 py-1
                     bg-white
                     text-[#2f2f2f]
                     text-[18px]"
            >
              ยังไม่มี
            </div>
          </div>
        </div>
      </div>

      <!-- button -->
      <div class="flex justify-center mt-16">
        <WarpButton
          title="แก้ไข"
          class="min-w-[360px]"
          @click="$emit('edit')"
        />
      </div>
    </div>
  </div>
</template>