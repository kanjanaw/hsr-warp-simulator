<template>
  <button
    class="group flex flex-col items-center gap-2
           text-white/80 hover:text-white
           transition-all duration-300"
  >
    <!-- Circle -->
    <div
      class="relative w-[110px] h-[110px]
             rounded-full
             border border-white/30
             flex items-center justify-center
             overflow-hidden"
    >
      <!-- dotted circle -->
      <div
        class="absolute inset-[8px]
               rounded-full
               border border-dashed border-white/20"
      ></div>

      <!-- glow -->
      <div
        class="absolute inset-0
               bg-white/5
               opacity-0
               group-hover:opacity-100
               transition"
      ></div>

      <!-- icon -->
      <div class="relative flex flex-col items-center">
        <img src="https://github.com/Mar-7th/StarRailRes/blob/master/icon/sign/ShopIcon.png?raw=true" class="w-[55px] h-[55px] object-contain">
        <span class="text-[20px] mt-1">
          แลกเปลี่ยน
        </span>
      </div>
    </div>
  </button>
</template>