<script setup>
import { onMounted, ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import InventoryPassFrame from '../components/ui/InventoryPassFrame.vue'
import GachaPoolModal from '../components/modal/GachaPoolModal.vue'
import GachaPoolEditModal from '../components/modal/GachaPoolEditModal.vue'



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

const banner = computed(() => {
  return banners[activeTab.value]
})

const banners = {
  currentBanner: {
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
  },

  rerunBanner: {
    name: 'รีรัน',

    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/image/character_portrait/8000.png?raw=true',

    characters: [],
  },

  currentLCBanner: {
    name: 'Light Cone',

    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/image/light_cone_portrait/23058.png?raw=true',

    characters: [],
  },

  rerunLCBanner: {
    name: 'LC Rerun',

    image:
      'https://github.com/Mar-7th/StarRailRes/blob/master/image/light_cone_portrait/23000.png?raw=true',

    characters: [],
  },
}

const isGachaPoolModalOpen = ref(false)

const standardCharacters = [
  {
    name: 'Welt',
    key: 'welt',
  },

  {
    name: 'Bronya',
    key: 'bronya',
  },

  {
    name: 'Bailu',
    key: 'bailu',
  },

  {
    name: 'Yanqing',
    key: 'yanqing',
  },

  {
    name: 'Clara',
    key: 'clara',
  },

  {
    name: 'Gepard',
    key: 'gepard',
  },

  {
    name: 'Himeko',
    key: 'himeko',
  },
]

const ownedCharacters = ['bronya']

const gachaPoolCharacters = standardCharacters.map((character, index) => ({
  id: index + 1,

  name: character.name,

  image: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_shop_icon.webp`,
  imageIcon: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_icon.webp`,
  owned: ownedCharacters.includes(character.key),

  selected: true,
}))

const isGachaPoolEditModalOpen = ref(false)

const featuredCharacters = [
  {
    name: 'Argenti',
    key: 'argenti',
  },

  {
    name: 'Fu Xuan',
    key: 'fu-xuan',
  },

  {
    name: 'Yunli',
    key: 'yunli',
  },

  {
    name: 'Blade',
    key: 'blade',
  },

  {
    name: 'Silver Wolf',
    key: 'silver-wolf',
  },

  {
    name: 'Seele',
    key: 'seele',
  },
]

const featuredPoolCharacters = featuredCharacters.map((character, index) => ({
  id: index + 1,

  name: character.name,

  image: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_shop_icon.webp`,
  imageIcon: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_icon.webp`,
  selected: true,
}))

const standardPoolCharacters = standardCharacters.map((character, index) => ({
  id: index + 100,

  name: character.name,

  image: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_shop_icon.webp`,
  imageIcon: `https://starrail.honeyhunterworld.com/img/character/${character.key}-character_icon.webp`,
  selected: false,
}))
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    
    <!-- background image -->
    <img
      src="https://github.com/Mar-7th/StarRailRes/blob/master/image/character_portrait/1505.png?raw=true'"
      class="absolute inset-0 scale-150
             w-full h-full
             object-cover"
    />

    <!-- overlay -->
    <div
    class="absolute inset-0
          bg-gradient-to-b
          from-black/50
          to-transparent
          backdrop-blur-xl"
  ></div>

    <!-- content -->
    <div class="relative z-10
             h-full
             space-y-8
             py-8">
      <div class="flex justify-between px-12">
        <!-- Left -->
        <div class="flex items-center gap-4">
          <div class="text-[#e9dfc2] leading-tight">
            <p class="text-[21px] mb-1">การวาร์ป</p>
            <p class="text-[26px] text-white">
              {{ banner?.name }}
            </p>
          </div>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-5">
          <!-- Ticket -->
          <InventoryPassFrame
            image="https://starrail.honeyhunterworld.com/img/item/star-rail-special-pass-item_icon_currency_70.webp"
            :amount="111" />

          <!-- Crystal -->
          <InventoryPassFrame
            image="https://starrail.honeyhunterworld.com/img/item/stellar-jade-item_icon_currency.webp" :amount="95"
            show-plus />

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

            <div class="flex justify-between items-center
                     w-[92%]
                     absolute bottom-[-30px]
                     z-20">
              <div class="flex gap-3">
                <WarpButton title="รายละเอียด" />
                <WarpButton title="ทดลองใช้ตัวละคร" />
              </div>

              <div class="flex gap-3">
                <WarpButton title="วาร์ป 1 ครั้ง" variant="warp" />

                <WarpButton title="วาร์ป 10 ครั้ง" variant="warp" />
              </div>
            </div>

            <div class="absolute top-20 right-30 z-auto">
              <WarpButton title="คำเชิญจากดวงดาว" variant="small" @click="isGachaPoolModalOpen = true" />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <GachaPoolModal
  v-if="isGachaPoolModalOpen"
  :characters="gachaPoolCharacters"
  @close="isGachaPoolModalOpen = false"
  @edit="
    isGachaPoolModalOpen = false,
    isGachaPoolEditModalOpen = true
  "
/>

<GachaPoolEditModal
  v-if="isGachaPoolEditModalOpen"
  :featured-characters="featuredPoolCharacters"
  :standard-characters="standardPoolCharacters"
  @close="isGachaPoolEditModalOpen = false"
/>
</template>
