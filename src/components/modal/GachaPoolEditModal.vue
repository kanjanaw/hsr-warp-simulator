<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close'])

const props = defineProps({
    characters: {
        type: Array,
        default: () => [],
    },

    featuredCharacters: {
        type: Array,
        default: () => [],
    },

    standardCharacters: {
        type: Array,
        default: () => [],
    },
})

const allCharacters = [
  ...props.featuredCharacters,
  ...props.standardCharacters,
]

const selectedCharacters = ref(
    allCharacters
        .filter(c => c.selected)
        .map(c => c.id)
)

const isSelected = (id) => {
    return selectedCharacters.value.includes(id)
}

const toggleCharacter = (id) => {
    if (isSelected(id)) {
        selectedCharacters.value =
            selectedCharacters.value.filter(v => v !== id)

        return
    }

    if (selectedCharacters.value.length >= 7) {
        return
    }

    selectedCharacters.value.push(id)
}

const selectedCount = computed(() => {
    return selectedCharacters.value.length
})
</script>

<template>
    <div class="fixed inset-0 z-[999]
           flex">
        <!-- bg -->
        <div class="absolute inset-0
             bg-gradient-to-b
             from-stone-950/90
             to-[#695F55]/95
             backdrop-blur-md"></div>

        <!-- left -->
        <div class="relative z-10
             w-[600px]
             border-r border-white/10
             bg-black/20
             p-8">
            <div class="space-y-6">
                <div>
                    <p class="text-[#d7b37a] text-[21px]">
                        คำเชิญจากดวงดาว
                    </p>

                    <p class="text-white text-[26px]">
                        รายชื่อตัวละคร
                    </p>
                </div>

                <div class="grid grid-cols-4 gap-5 gap-y-6">
                    <button v-for="character in featuredCharacters" :key="character.id" class="relative"
                        @click="toggleCharacter(character.id)">
                        <div :class="[
                            'overflow-hidden border-4 rounded-tr-2xl transition-all duration-200',

                            isSelected(character.id)
                                ? 'border-white scale-105 shadow-md shadow-white'
                                : 'border-white/0 opacity-70'
                        ]">
                            <img :src="character.imageIcon" class="w-full h-[110px] object-cover" />

                            <div class="bg-black">
                                <p class="text-white text-[17px] mt-1">
                                    {{ character.name }}
                                </p>
                            </div>
                        </div>

                        <div v-if="isSelected(character.id)" class="absolute top-[-10px] left-[-10px]
             w-7 h-7
             rounded-full
             bg-white
             text-black text-xl
             flex items-center justify-center">
                            {{
                                selectedCharacters.indexOf(character.id) + 1
                            }}
                        </div>
                    </button>
                </div>

                <div class="flex items-center gap-4 my-8">
                    <div class="flex-1 h-[1px] bg-white/10"></div>

                    <p class="text-white/60 text-[18px]">
                        ตัวละครถาวร
                    </p>

                    <div class="flex-1 h-[1px] bg-white/10"></div>
                </div>

                <div class="grid grid-cols-4 gap-5 gap-y-6">
                    <button v-for="character in props.standardCharacters" :key="character.id" class="relative"
                        @click="toggleCharacter(character.id)">
                        <div :class="[
                            'overflow-hidden border-4 rounded-tr-2xl transition-all duration-200',

                            isSelected(character.id)
                                ? 'border-white scale-105 shadow-md shadow-white'
                                : 'border-white/0 opacity-70'
                        ]">
                            <img :src="character.imageIcon" class="w-full h-[110px] object-cover" />

                            <div class="bg-black">
                                <p class="text-white text-[17px] mt-1">
                                    {{ character.name }}
                                </p>
                            </div>
                        </div>
                        <div v-if="isSelected(character.id)" class="absolute top-[-10px] left-[-10px]
             w-7 h-7
             rounded-full
             bg-white
             text-black text-xl
             flex items-center justify-center">
                            {{
                                selectedCharacters.indexOf(character.id) + 1
                            }}
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- right -->
        <div class="relative z-10
             flex-1
             flex flex-col">
            <!-- top -->
            <div class="pt-32 text-center">
                <h1 class="text-[36px]
                 text-[#d7b37a]">
                    เลือกตัวละคร 7 ตัว
                </h1>

                <p class="text-white/60
                 text-[20px]
                 mt-4">
                    เพื่อเพิ่มลงในคำเชิญจากดวงดาว
                </p>
            </div>

            <!-- selected -->
            <div class="flex justify-center gap-4
               mt-16">
                <div v-for="id in selectedCharacters" :key="id" class="w-[150px]">
                    <img :src="allCharacters.find(c => c.id === id)?.image" class="w-full h-[380px] object-cover"/>
                </div>
            </div>

            <!-- bottom -->
            <div class="mt-auto
               flex justify-end gap-5
               p-10">
                <WarpButton title="รายละเอียดตัวละคร" />

                <WarpButton :title="`เลือกตัวละครแล้ว ${selectedCount}/7 ตัว`" />
            </div>

            <!-- close -->
            <button class="absolute top-10 right-10
               text-white text-5xl" @click="emit('close')">
                ×
            </button>
        </div>
    </div>
</template>