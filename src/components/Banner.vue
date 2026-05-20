<script setup>
defineProps({
    banner: {
        type: Object,
        required: true,
    },
})
</script>

<template>
    <div class="w-[90%] h-[800px] shadow-2xl grid grid-cols-[28%_72%]
    [mask-image:linear-gradient(to_top,transparent_0%,black_20%,black_100%)]
    [-webkit-mask-image:linear-gradient(to_top,transparent_0%,black_20%,black_100%)]">
        <div class="rounded-tr-[60px] bg-[#eeeeee]/85 z-10">
            <div class="relative z-10 flex flex-col h-full px-12 py-10">
                <!-- content -->
                <div class="mt-10 max-w-[420px]">
                    <h1 class="text-[50px] leading-none ">
                        {{ banner.name }}
                    </h1>

                    <!-- timer -->
                    <div class="flex items-center gap-3 mt-5 text-amber-500">
                        <div class="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                            ○
                        </div>

                        <p class="text-[25px]">
                            12 วัน 3 ชม.
                        </p>
                    </div>

                    <!-- desc -->
                    <div class="mt-5
                 text-[#5f5b58]
                 text-[24px]
                 leading-relaxed">
                        <p>การวาร์ปทุก <span class="text-amber-500">10</span> ครั้ง</p>
                        <p>การันตีว่าจะมีเป้าหมาย <span class="text-amber-500">4</span> ดาว</p>
                        <p>หรือสูงกว่าออกแน่นอน</p>

                        <p class="mt-3">เพิ่มโอกาสได้รับตัวละคร ที่กำหนด</p>
                    </div>

                    <!-- characters -->
                    <div class="flex gap-4 mt-8">
                        <img v-for="character in banner.characters" :key="character.id" :src="character.image" class="w-[100px] h-[340px]
                   rounded-full
                   object-cover" />
                    </div>
                </div>

            </div>
        </div>
        <div class="relative">
            <div class="absolute left-30 bottom-65 z-10 space-y-2">
                <div class="bg-black/65 text-white px-4 flex items-end">
                    <img class="w-9 h-9 object-contain mt-[-2px]"
                        src="https://github.com/Mar-7th/StarRailRes/blob/master/icon/element/Physical.png?raw=true"
                        alt="">
                    <p class="text-[24px] tracking-wide font-light">Evanescia</p>
                </div>
                <div class="bg-black/65 text-white w-fit px-0">
                    <img class="w-[150px] h-[28px] object-cover object-center"
                        src="https://github.com/Mar-7th/StarRailRes/blob/master/icon/deco/Rarity5.png?raw=true" alt="">
                </div>
            </div>

        </div>
        <img :src="banner.image" :alt="banner.name" class="absolute z-0 inset-0 w-full h-full object-cover" />
    </div>


</template>