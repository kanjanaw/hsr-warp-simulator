<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'


// onMounted(async () => {

//   const { data } = await supabase
//     .from('banners')
//     .select('*')
//     .eq('active', true)
//     .single()

//   banner.value = data
// })

const activeTab = ref('currentBanner')

const tabs = [
  {
    id: 'currentBanner',
    name: 'currentBanner',
    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/icon/character/1505.png?raw=true',
  },

  {
    id: 'rerunBanner',
    name: 'rerunBanner',
    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/icon/character/8000.png?raw=true',
  },
  {
    id: 'currentLCBanner',
    name: 'currentLCBanner',
    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/icon/light_cone/23058.png?raw=true',
  },
  {
    id: 'rerunLCBanner',
    name: 'rerunLCBanner',
    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/icon/character/8000.png?raw=true',
  },
]

const banner = {
  name: 'พริ้งพิจพิจารณ์',

  image:
    'https://github.com/Mar-7th/StarRailRes/blob/master/image/character_portrait/1505.png?raw=true',

  characters: [
    {
      id: 1,
      image:
        'https://github.com/Mar-7th/StarRailRes/blob/master/image/character_preview/1110.png?raw=true',
    },

    {
      id: 2,
      image:
        'https://github.com/Mar-7th/StarRailRes/blob/master/image/character_preview/1206.png?raw=true',
    },

    {
      id: 3,
      image:
        'https://github.com/Mar-7th/StarRailRes/blob/master/image/character_preview/1210.png?raw=true',
    },
  ],
}
</script>

<template>
  <div class="top-0 left-0 w-full h-screen overflow-hidden space-y-8 py-8
           bg-black/20
           backdrop-blur-md">
    <div class="flex justify-between px-12">
      <!-- Left -->
      <div class="flex items-center gap-4">
        <!-- <img src="/images/logo.png" alt="logo" class="w-12 h-12 object-contain" /> -->

        <div class="text-[#e9dfc2] leading-tight">
          <p class="text-[21px] mb-1">การวาร์ป</p>
          <p class="text-[26px] text-white">{{ banner.name }}</p>
        </div>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-5">
        <!-- Ticket -->
        <div class="flex items-center justify-end gap-3 relative border-1 border-white
               w-[180px] 
               px-4 py-1
               rounded-full
               bg-black/40">
          <img src="https://github.com/Mar-7th/StarRailRes/blob/master/icon/item/102.png?raw=true"
            class="w-12 h-12 object-contain absolute top-[-8px] left-0" />
          <span class="text-white text-[20px]">
            111
          </span>
        </div>

        <!-- Crystal -->
        <div class="flex items-center justify-end gap-3 relative border-1 border-white
               w-[180px] 
               px-4 py-1
               rounded-full
               bg-black/40">
          <!-- <img src="/images/jade.png" class="w-7 h-7 object-contain" /> -->

          <span class="text-white text-[20px] ">
            95
          </span>

          <button class="w-7 h-7 rounded-full
                 border border-[#cbb38a]
                 text-[#cbb38a]
                 flex items-center justify-center">
            +
          </button>
        </div>

        <!-- Close -->
        <button class="w-14 h-14
               flex items-center justify-center
               text-white text-5xl">
          ×
        </button>
      </div>
    </div>


    <div class="flex gap-10">
      <!-- side bar -->
      <div class="flex flex-col h-[calc(100vh-180px)]">
        <TabButton :tabs="tabs" :active-tab="activeTab" @change="activeTab = $event" />
        <div class="px-10 mt-auto">
          <WarpShopButton />
        </div>
      </div>

      <!-- main banner -->
      <div class="w-full pl-30">
        <div class="relative">
          <Banner :banner="banner" />
          <!-- top tag -->
          <div class="w-fit absolute top-5 left-[-15px] z-20
              px-6 py-1
              rounded-r-full
              bg-[#ef7f98]
              text-white
              text-[18px]">
              กิจกรรมวาร์ปตัวละคร
          </div>
          <div class="flex justify-between items-center w-[92%] absolute bottom-[-30px] z-20">
            <div class="flex gap-3">
              <!-- รายละเอียด -->
              <WarpButton title="รายละเอียด" />
              <!-- ทดลอง -->
              <WarpButton title="ทดลองใช้ตัวละคร" />
            </div>
            <div class="flex gap-3">
              <!-- ใช้วาร์ป -->
              <WarpButton title="วาร์ป 1 ครั้ง" variant="warp" />
              <WarpButton title="วาร์ป 10 ครั้ง" variant="warp" />
            </div>
          </div>
          <div class="absolute top-20 right-30 z-auto">
            <WarpButton title="คำเชิญจากดวงดาว" variant="small" />
          </div>
        </div>

      </div>

    </div>




  </div>

</template>
