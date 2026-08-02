<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import { POOL_CONFIGS, createDefaultPoolState, performWarps } from '../utils/gacha'
import { BANNER_ARCHIVE, FOUR_STAR_DEBUT_VERSIONS, characterItem, fourStarItem, signatureLightConeItem } from '../data/bannerArchive'
import { FIVE_STAR_LIGHT_CONES, MASTER_DATA_VERSION, getCharacter } from '../data/masterData.js'
import { loadStarRailResources, resolveCharacterMeta, resolveLightConeMeta } from '../data/starRailRes.js'

const STORAGE_KEY = 'hsr-warp-simulator-v2'
const activeTab = ref('currentBanner')
const showHistory = ref(false)
const showResults = ref(false)
const showBannerDetails = ref(false)
const showOffRateEditor = ref(false)
const showBannerArchive = ref(false)
const archiveVersion = ref('4.4')
const archivePhase = ref('Phase 1')
const archiveBanner = ref(null)
const latestResults = ref([])
const visibleResultCount = ref(0)
const showAllResults = ref(false)
const showFiveStarIntro = ref(false)
let resultRevealTimer = null
const historyFilter = ref('all')
const historyRarityFilter = ref('all')
const visibleResults = computed(() => latestResults.value.slice(0, visibleResultCount.value))
const currentRevealResult = computed(() => latestResults.value[Math.max(0, visibleResultCount.value - 1)] || null)
const starRailResourcesReady = ref(false)

function getResultSourceId(item) {
  if (!item) return ''

  const candidates = [
    item.sourceId,
    item.characterId,
    item.lightConeId,
    item.id,
    item.portrait,
    item.image,
  ]

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue

    const value = String(candidate)
    if (/^\d+$/.test(value)) return value

    const match = value.match(/(?:^|\/)(\d+)(?:\.png)?(?:\?.*)?$/)
    if (match?.[1]) return match[1]
  }

  return ''
}

const currentRevealCharacterMeta = computed(() => {
  const item = currentRevealResult.value
  if (!item || item.kind !== 'ตัวละคร' || !starRailResourcesReady.value) return null
  return resolveCharacterMeta(getResultSourceId(item), {
    name: item.name,
    rarity: item.rarity,
    portrait: getRevealPortrait(item),
  })
})

const currentRevealPortrait = computed(() => {
  const item = currentRevealResult.value
  if (!item) return '/favicon.svg'
  if (item.kind === 'ตัวละคร' && currentRevealCharacterMeta.value?.portrait) {
    return currentRevealCharacterMeta.value.portrait
  }
  return getRevealPortrait(item)
})

const currentRevealPathMeta = computed(() => {
  const item = currentRevealResult.value
  if (!item) return null

  if (item.kind === 'ตัวละคร') {
    return currentRevealCharacterMeta.value?.path || null
  }

  if (!starRailResourcesReady.value) return null

  const sourceId = getResultSourceId(item)
  const lightConeMeta = resolveLightConeMeta(sourceId, {
    name: item.name,
    rarity: item.rarity,
    portrait: getRevealPortrait(item),
  })

  if (lightConeMeta?.path?.icon) return lightConeMeta.path

  // Fallback for signature Light Cones that are already mapped to their owner.
  const lightCone = FIVE_STAR_LIGHT_CONES[String(sourceId)]
  if (!lightCone?.characterKey) return null

  const owner = getCharacter(lightCone.characterKey)
  if (!owner?.id) return null
  return resolveCharacterMeta(owner.id)?.path || null
})

function syncFiveStarIntro() {
  showFiveStarIntro.value = Number(currentRevealResult.value?.rarity) === 5
}

const RESULT_IMAGE_BASE = 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image'

function getRevealPortrait(item) {
  if (!item) return '/favicon.svg'
  if (item.portrait) return item.portrait

  const sourceId = item.sourceId || String(item.image || '').match(/\/(\d+)\.png(?:\?.*)?$/)?.[1]
  if (!sourceId) return item.image || '/favicon.svg'

  return item.kind === 'ตัวละคร'
    ? `${RESULT_IMAGE_BASE}/character_portrait/${sourceId}.png`
    : `${RESULT_IMAGE_BASE}/light_cone_portrait/${sourceId}.png`
}
const isBannerLoading = ref(false)
const isWarpAnimating = ref(false)
const warpAnimationPhase = ref('idle')
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
const swiperModules = [FreeMode, Mousewheel]
const bannerTabsDirection = computed(() => viewportWidth.value <= 760 ? 'horizontal' : 'vertical')
const updateViewportWidth = () => { viewportWidth.value = window.innerWidth }

const baseTabs = [
  { id: 'currentBanner', name: 'Evanescia', type: 'character', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1505.png' },
  { id: 'rerunBanner', name: 'Evernight', type: 'character', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1413.png' },
  { id: 'currentLCBanner', name: 'Featured Light Cone', type: 'lightCone', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/23049.png' },
  { id: 'standardBanner', name: 'Stellar Warp', type: 'standard', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1001.png' },
]

const baseBanners = {
  currentBanner: {
    name: 'พริ้งพิจพิจารณ์', type: 'character', tag: 'กิจกรรมวาร์ปตัวละคร', featuredName: 'Evanescia',
    image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/1505.png',
    featured5: { id: 'evanescia', name: 'Evanescia', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1505.png' },
    featured4: [
      { id: 'tingyun', name: 'Tingyun', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1202.png' },
      { id: 'asta', name: 'Asta', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1009.png' },
      { id: 'serval', name: 'Serval', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1103.png' },
    ],
  },
  rerunBanner: {
    name: 'ห้วงนิทรานิรันดร์', type: 'character', tag: 'กิจกรรมวาร์ปตัวละคร', featuredName: 'Evernight',
    image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/1413.png',
    featured5: { id: 'evernight', name: 'Evernight', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1413.png' },
    featured4: [
      { id: 'pela', name: 'Pela', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1106.png' },
      { id: 'sampo', name: 'Sampo', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1108.png' },
      { id: 'lynx', name: 'Lynx', kind: 'ตัวละคร', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/1110.png' },
    ],
  },
  currentLCBanner: {
    name: 'ประกายแห่งความทรงจำ', type: 'lightCone', tag: 'กิจกรรมวาร์ป Light Cone', featuredName: "To Evernight's Stars",
    image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_portrait/23049.png',
    featured5: { id: 'lc-23049', name: "To Evernight's Stars", kind: 'Light Cone', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/23049.png' },
    featured4: [
      { id: 'lc-21012', name: 'A Secret Vow', kind: 'Light Cone', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/21012.png' },
      { id: 'lc-21008', name: 'Eyes of the Prey', kind: 'Light Cone', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/21008.png' },
      { id: 'lc-21018', name: 'Dance! Dance! Dance!', kind: 'Light Cone', image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/21018.png' },
    ],
  },
  standardBanner: {
    name: 'Stellar Warp', type: 'standard', tag: 'วาร์ปถาวร', featuredName: 'Stellar Warp',
    image: 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/1001.png',
    featured5: null, featured4: [],
  },
}


const selectedPatchVersion = ref('4.4')
const selectedPatchPhase = ref('Phase 1')
const patchBanners = ref({})
const patchTabs = ref([])
const firstAppearanceByCharacter = new Map()

for (const patch of BANNER_ARCHIVE) {
  for (const phase of patch.phases) {
    for (const character of phase.fiveStars) {
      if (!firstAppearanceByCharacter.has(character)) firstAppearanceByCharacter.set(character, patch.version)
    }
  }
}

const tabs = computed(() => patchTabs.value.length ? patchTabs.value : baseTabs)
const banners = computed(() => patchTabs.value.length ? { ...patchBanners.value, standardBanner: baseBanners.standardBanner } : baseBanners)

function makeCharacterBanner(version, phase, characterName, fourStars, rerunOverride = null) {
  const featured = characterItem(characterName)
  const rerun = rerunOverride === null ? firstAppearanceByCharacter.get(characterName) !== version : rerunOverride
  return {
    name: `Version ${version} • ${phase}`,
    type: 'character',
    tag: rerun ? 'กิจกรรมวาร์ปตัวละครรีรัน' : 'กิจกรรมวาร์ปตัวละคร',
    featuredName: featured.name,
    image: featured.portrait,
    featured5: featured,
    featured4: [...new Set(fourStars)]
      .filter(name => compareVersion(FOUR_STAR_DEBUT_VERSIONS[name] || '1.0', version) <= 0)
      .map(fourStarItem),
    archiveMeta: { version, phaseName: phase, rerun },
  }
}

function makeLightConeBanner(version, phase, characterName, fourStars) {
  const featured = signatureLightConeItem(characterName)
  if (!featured) return null
  return {
    name: `Version ${version} • ${phase}`,
    type: 'lightCone',
    tag: 'กิจกรรมวาร์ป Light Cone',
    featuredName: featured.name,
    image: featured.portrait,
    featured5: featured,
    featured4: baseBanners.currentLCBanner.featured4,
    archiveMeta: { version, phaseName: phase, characterName },
  }
}

function getPersistentCollabCharacters(version) {
  if (compareVersion(version, '3.4') < 0) return []

  const characters = ['Saber', 'Archer']
  if (compareVersion(version, '4.4') >= 0) {
    characters.push('Rin Tohsaka', 'Gilgamesh')
  }
  return characters
}

function applyPatchPhase(version, phaseName, preferredTabId = '') {
  const patch = BANNER_ARCHIVE.find(item => item.version === version)
  if (!patch) return

  const phaseIndex = Math.max(0, patch.phases.findIndex(item => item.phase === phaseName))
  const phase = patch.phases[phaseIndex] || patch.phases[0]
  if (!phase) return

  const nextBanners = {}
  const nextTabs = []

  const newEntries = (phase.newFiveStars || []).map(characterName => ({
    characterName,
    phaseName: phase.phase,
    fourStars: phase.fourStars,
    isCollab: false,
    isRerun: false,
  }))
  const rerunEntries = (phase.reruns || []).map(characterName => ({
    characterName,
    phaseName: phase.phase,
    fourStars: phase.fourStars,
    isCollab: false,
    isRerun: true,
  }))
  const regularEntries = [...newEntries, ...rerunEntries]
  const existingNames = new Set(regularEntries.map(entry => entry.characterName))
  const sourceCollabs = phase.collabs?.length ? phase.collabs : getPersistentCollabCharacters(version)
  const persistentCollabEntries = sourceCollabs
    .filter(characterName => !existingNames.has(characterName))
    .map(characterName => ({
      characterName,
      phaseName: 'Collaboration',
      fourStars: [],
      isCollab: true,
      isRerun: false,
    }))
  const bannerEntries = [...regularEntries, ...persistentCollabEntries]

  bannerEntries.forEach((entry, characterIndex) => {
    const { characterName, phaseName, fourStars, isCollab, isRerun } = entry
    const charId = `patch-${version}-${phaseIndex}-char-${characterIndex}`
    const charBanner = makeCharacterBanner(version, phaseName, characterName, fourStars, isRerun)
    if (isCollab) {
      charBanner.tag = 'กิจกรรมวาร์ป Collaboration'
      charBanner.archiveMeta.collab = true
    }
    nextBanners[charId] = charBanner
    nextTabs.push({
      id: charId,
      name: charBanner.featured5.name,
      type: 'character',
      image: charBanner.featured5.image,
      badge: isCollab ? 'Collab' : (charBanner.archiveMeta.rerun ? 'รีรัน' : 'ใหม่'),
    })

    const lightConeBanner = makeLightConeBanner(version, phaseName, characterName, fourStars)
    if (lightConeBanner) {
      const lcId = `patch-${version}-${phaseIndex}-lc-${characterIndex}`
      nextBanners[lcId] = lightConeBanner
      nextTabs.push({
        id: lcId,
        name: lightConeBanner.featuredName,
        type: 'lightCone',
        image: lightConeBanner.featured5.image,
        badge: isCollab ? 'Collab LC' : 'Light Cone',
      })
    }
  })

  nextTabs.push({ ...baseTabs.find(tab => tab.id === 'standardBanner'), badge: 'ถาวร' })
  patchBanners.value = nextBanners
  patchTabs.value = nextTabs
  selectedPatchVersion.value = version
  selectedPatchPhase.value = phase.phase
  archiveVersion.value = version
  archivePhase.value = phase.phase
  archiveBanner.value = null

  const targetId = preferredTabId && nextBanners[preferredTabId]
    ? preferredTabId
    : nextTabs.find(tab => tab.id !== 'standardBanner')?.id || 'standardBanner'
  activeTab.value = targetId
  showBannerArchive.value = false
  preloadBannerAssets()
  loadStarRailResources()
    .then(() => { starRailResourcesReady.value = true })
    .catch(error => console.warn('Unable to load StarRailRes metadata', error))
}

function applyPatchVersion(version, preferredTabId = '') {
  const patch = BANNER_ARCHIVE.find(item => item.version === version)
  if (!patch) return
  const requestedPhase = patch.phases.some(item => item.phase === selectedPatchPhase.value)
    ? selectedPatchPhase.value
    : patch.phases[0]?.phase
  applyPatchPhase(version, requestedPhase, preferredTabId)
}

const standard5Characters = [
  ['himeko', 'Himeko', '1003'], ['welt', 'Welt', '1004'], ['yanqing', 'Yanqing', '1209'], ['clara', 'Clara', '1107'],
  ['bailu', 'Bailu', '1211'], ['bronya', 'Bronya', '1101'], ['gepard', 'Gepard', '1104'],
].map(([id, name, icon]) => ({
  id,
  sourceId: icon,
  characterId: icon,
  name,
  kind: 'ตัวละคร',
  debutVersion: FOUR_STAR_DEBUT_VERSIONS[name] || '1.0',
  image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${icon}.png`,
  portrait: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${icon}.png`,
}))

const extraOffRateCharacters = [
  ['seele', 'Seele', '1102'],
  ['blade', 'Blade', '1205'],
  ['fu-xuan', 'Fu Xuan', '1208'],
  ['yunli', 'Yunli', '1221'],
  ['argenti', 'Argenti', '1302'],
  ['silver-wolf', 'Silver Wolf', '1006'],
].map(([id, name, icon]) => ({
  id,
  sourceId: icon,
  characterId: icon,
  name,
  kind: 'ตัวละคร',
  image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${icon}.png`,
  portrait: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${icon}.png`,
}))

const limitedOffRateCandidates = [...standard5Characters, ...extraOffRateCharacters]
const DEFAULT_OFF_RATE_IDS = standard5Characters.map(character => character.id)

function compareVersion(version, target) {
  const [major = 0, minor = 0] = String(version).split('.').map(Number)
  const [targetMajor = 0, targetMinor = 0] = String(target).split('.').map(Number)
  return major === targetMajor ? minor - targetMinor : major - targetMajor
}

const offRateTier = computed(() => {
  if (compareVersion(selectedPatchVersion.value, '3.2') < 0) return 'classic'
  if (compareVersion(selectedPatchVersion.value, '4.2') < 0) return 'expanded'
  return 'latest'
})

const offRateRule = computed(() => {
  if (offRateTier.value === 'classic') {
    return {
      editable: false,
      label: 'Pool มาตรฐาน 7 ตัว (ล็อกตามแพตช์)',
      description: 'Version 1.0–3.1 ใช้ Himeko, Welt, Bronya, Gepard, Clara, Yanqing และ Bailu เท่านั้น',
      candidates: standard5Characters,
    }
  }

  if (offRateTier.value === 'expanded') {
    return {
      editable: true,
      label: 'เลือก 7 ตัวจาก 10 ตัว',
      description: 'Version 3.2–4.1 เพิ่ม Seele, Blade และ Fu Xuan ในรายการที่เลือกได้',
      candidates: [...standard5Characters, ...extraOffRateCharacters.slice(0, 3)],
    }
  }

  return {
    editable: true,
    label: 'เลือก 7 ตัวจาก 13 ตัว',
    description: 'Version 4.2 เป็นต้นไป เพิ่ม Yunli, Argenti และ Silver Wolf ในรายการที่เลือกได้',
    candidates: limitedOffRateCandidates,
  }
})

const selectedOffRatePools = ref({
  expanded: [...DEFAULT_OFF_RATE_IDS],
  latest: [...DEFAULT_OFF_RATE_IDS],
})
const draftOffRateIds = ref([])
const activeSelectedOffRateIds = computed(() => offRateTier.value === 'classic'
  ? DEFAULT_OFF_RATE_IDS
  : selectedOffRatePools.value[offRateTier.value])
const selectedOffRateCharacters = computed(() => offRateRule.value.candidates.filter(character => activeSelectedOffRateIds.value.includes(character.id)))
const draftOffRateCount = computed(() => draftOffRateIds.value.length)

const standard5LightCones = [
  ['night-on-the-milky-way', 'Night on the Milky Way', '23000'], ['something-irreplaceable', 'Something Irreplaceable', '23002'],
  ['but-the-battle-isnt-over', "But the Battle Isn't Over", '23003'], ['in-the-name-of-the-world', 'In the Name of the World', '23004'],
  ['moment-of-victory', 'Moment of Victory', '23005'], ['sleep-like-the-dead', 'Sleep Like the Dead', '23012'],
  ['time-waits-for-no-one', 'Time Waits for No One', '23013'],
].map(([id, name, icon]) => ({
  id,
  sourceId: icon,
  lightConeId: icon,
  name,
  kind: 'Light Cone',
  image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/${icon}.png`,
  portrait: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_portrait/${icon}.png`,
}))

const standard4Characters = [
  ['march-7th', 'March 7th', '1001'], ['dan-heng', 'Dan Heng', '1002'], ['arlan', 'Arlan', '1008'],
  ['asta', 'Asta', '1009'], ['herta', 'Herta', '1013'], ['natasha', 'Natasha', '1105'], ['pela', 'Pela', '1106'],
  ['sampo', 'Sampo', '1108'], ['hook', 'Hook', '1109'], ['lynx', 'Lynx', '1110'], ['luka', 'Luka', '1111'],
  ['serval', 'Serval', '1103'], ['qingque', 'Qingque', '1201'], ['tingyun', 'Tingyun', '1202'], ['sushang', 'Sushang', '1206'],
  ['yukong', 'Yukong', '1207'], ['guinaifen', 'Guinaifen', '1210'], ['xueyi', 'Xueyi', '1214'], ['hanya', 'Hanya', '1215'],
  ['misha', 'Misha', '1312'], ['gallagher', 'Gallagher', '1301'], ['moze', 'Moze', '1223'],
].map(([id, name, icon]) => ({
  id,
  sourceId: icon,
  name,
  kind: 'ตัวละคร',
  debutVersion: FOUR_STAR_DEBUT_VERSIONS[name] || '1.0',
  image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${icon}.png`,
}))

const standard4LightCones = [
  ['a-secret-vow', 'A Secret Vow', '21012'], ['the-birth-of-the-self', 'The Birth of the Self', '21006'],
  ['shared-feeling', 'Shared Feeling', '21007'], ['eyes-of-the-prey', 'Eyes of the Prey', '21008'],
  ['dance-dance-dance', 'Dance! Dance! Dance!', '21018'], ['trend-of-the-universal-market', 'Trend of the Universal Market', '21016'],
  ['subscribe-for-more', 'Subscribe for More!', '21017'], ['perfect-timing', 'Perfect Timing', '21014'],
  ['planetary-rendezvous', 'Planetary Rendezvous', '21011'], ['under-the-blue-sky', 'Under the Blue Sky', '21019'],
  ['resolution-shines', 'Resolution Shines As Pearls of Sweat', '21015'], ['swordplay', 'Swordplay', '21010'],
].map(([id, name, icon]) => ({ id, name, kind: 'Light Cone', image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/${icon}.png` }))

const standard4 = [...standard4Characters, ...standard4LightCones]

const standard3 = [
  ['adversarial', 'Adversarial', '20014'], ['amber', 'Amber', '20003'], ['arrows', 'Arrows', '20000'],
  ['chorus', 'Chorus', '20005'], ['collapsing-sky', 'Collapsing Sky', '20002'], ['data-bank', 'Data Bank', '20006'],
].map(([id, name, icon]) => ({ id, name, kind: 'Light Cone', image: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/light_cone/${icon}.png` }))

const canonicalLightCones = [
  ...Object.values(FIVE_STAR_LIGHT_CONES),
  baseBanners.currentLCBanner.featured5,
  ...baseBanners.currentLCBanner.featured4,
  ...standard5LightCones,
  ...standard4LightCones,
  ...standard3,
]
const canonicalLightConeByName = new Map(canonicalLightCones.map(item => [item.name, item]))

function normalizeSavedHistoryItem(item) {
  let normalized = item

  if (item?.kind === 'Light Cone') {
    const canonical = canonicalLightConeByName.get(item.name)
    if (canonical) normalized = { ...item, id: canonical.id, image: canonical.image }
  }

  // Older history only stored `featured`. Preserve it and label known wins.
  if (!normalized?.rateUpStatus && normalized?.poolType !== 'standard' && normalized?.rarity >= 4) {
    normalized = {
      ...normalized,
      rateUpStatus: normalized.featured ? 'won' : 'lost',
      legacyRateUpStatus: true,
    }
  }

  return normalized
}

function rateUpStatusLabel(item) {
  if (item.rateUpStatus === 'guaranteed') return 'การันตี'
  if (item.rateUpStatus === 'won') return item.legacyRateUpStatus ? 'ชนะ/เรทอัป' : 'ชนะ'
  if (item.rateUpStatus === 'lost') return 'หลุดเรท'
  return ''
}

const states = ref({
  character: createDefaultPoolState(), lightCone: createDefaultPoolState(), standard: createDefaultPoolState(),
})
const history = ref([])

const banner = computed(() => banners.value[activeTab.value] || baseBanners.standardBanner)
const selectedArchivePatch = computed(() => BANNER_ARCHIVE.find(item => item.version === archiveVersion.value) || BANNER_ARCHIVE.at(-1))
const selectedArchivePhase = computed(() => selectedArchivePatch.value.phases.find(item => item.phase === archivePhase.value) || selectedArchivePatch.value.phases[0])
const poolType = computed(() => banner.value.type)
const activeBannerVersion = computed(() => banner.value.archiveMeta?.version || selectedPatchVersion.value || '4.4')
const availableStandard4Characters = computed(() => standard4Characters.filter(item => compareVersion(item.debutVersion || '1.0', activeBannerVersion.value) <= 0))
const availableStandard4 = computed(() => [...availableStandard4Characters.value, ...standard4LightCones])
const featured4IdentitySet = computed(() => new Set((banner.value.featured4 || []).flatMap(item => [
  item.name?.trim().toLowerCase(),
  item.sourceId ? String(item.sourceId) : null,
].filter(Boolean))))
const availableNormal4 = computed(() => availableStandard4.value.filter(item => {
  const identities = [item.name?.trim().toLowerCase(), item.sourceId ? String(item.sourceId) : null].filter(Boolean)
  return !identities.some(identity => featured4IdentitySet.value.has(identity))
}))
const config = computed(() => POOL_CONFIGS[poolType.value])
const currentState = computed(() => states.value[poolType.value])
const pullsTo5 = computed(() => config.value.hardPity5 - currentState.value.pullsSince5)
const pullsTo4 = computed(() => 10 - currentState.value.pullsSince4)
const filteredHistory = computed(() => history.value.filter(item => {
  const matchesPool = historyFilter.value === 'all' || item.poolType === historyFilter.value
  const matchesRarity = historyRarityFilter.value === 'all' || item.rarity === Number(historyRarityFilter.value)
  return matchesPool && matchesRarity
}))
const detailPool = computed(() => {
  const fiveStarOffRate = poolType.value === 'character' ? selectedOffRateCharacters.value : poolType.value === 'lightCone' ? standard5LightCones : []
  return {
    featured5: banner.value.featured5 ? [banner.value.featured5] : [],
    featured4: banner.value.featured4 || [],
    offRate5: fiveStarOffRate,
    normal4: poolType.value === 'standard' ? availableStandard4.value : availableNormal4.value,
    standard5: [...standard5Characters, ...standard5LightCones],
  }
})

const imagePreloadCache = new Map()

function preloadImage(src, timeoutMs = 5000) {
  if (!src) return Promise.resolve()
  if (imagePreloadCache.has(src)) return imagePreloadCache.get(src)

  const task = new Promise(resolve => {
    const image = new Image()
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      resolve()
    }

    const timeoutId = window.setTimeout(finish, timeoutMs)
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode()
      } catch (_) {
        // The image is already usable even when decode() rejects.
      }
      finish()
    }
    image.onerror = finish
    image.decoding = 'async'
    image.src = src

    if (image.complete) finish()
  })

  imagePreloadCache.set(src, task)
  return task
}

function preloadBannerAssets() {
  const urls = Object.values(banners.value).flatMap(item => [
    item.image,
    item.featured5?.image,
    ...(item.featured4 || []).map(rateUp => rateUp.image),
  ]).filter(Boolean)

  const run = () => [...new Set(urls)].forEach(url => preloadImage(url, 3500))

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 1800 })
  } else {
    window.setTimeout(run, 250)
  }
}

async function switchBanner(tabId) {
  if (tabId === activeTab.value || isBannerLoading.value) return

  const nextBanner = banners.value[tabId]
  if (!nextBanner) return

  isBannerLoading.value = true
  const minimumLoader = new Promise(resolve => window.setTimeout(resolve, 350))
  const images = [
    nextBanner.image,
    nextBanner.featured5?.image,
    ...(nextBanner.featured4 || []).map(item => item.image),
  ]

  await Promise.all([
    minimumLoader,
    Promise.all([...new Set(images)].map(preloadImage)),
  ])

  activeTab.value = tabId
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      isBannerLoading.value = false
    })
  })
}

function buildPool() {
  return {
    featured5: banner.value.featured5,
    featured4: banner.value.featured4,
    standard5: poolType.value === 'standard' ? [...standard5Characters, ...standard5LightCones] : poolType.value === 'character' ? selectedOffRateCharacters.value : standard5LightCones,
    standard4: poolType.value === 'standard'
      ? availableStandard4.value
      : poolType.value === 'lightCone'
        ? standard4LightCones.filter(item => !(banner.value.featured4 || []).some(rateUp => rateUp.name === item.name))
        : availableNormal4.value,
    standard3,
  }
}



function selectArchiveBanner(version, phaseName, characterName) {
  const patch = BANNER_ARCHIVE.find(item => item.version === version)
  const phaseIndex = patch?.phases.findIndex(item => item.phase === phaseName) ?? 0
  const characterIndex = patch?.phases[phaseIndex]?.fiveStars.indexOf(characterName) ?? 0
  applyPatchPhase(version, phaseName, `patch-${version}-${phaseIndex}-char-${characterIndex}`)
}

function openOffRateEditor() {
  if (!offRateRule.value.editable) return
  draftOffRateIds.value = [...activeSelectedOffRateIds.value]
  showOffRateEditor.value = true
}

function toggleOffRateCharacter(id) {
  if (draftOffRateIds.value.includes(id)) {
    draftOffRateIds.value = draftOffRateIds.value.filter(characterId => characterId !== id)
    return
  }

  if (draftOffRateIds.value.length < 7) {
    draftOffRateIds.value.push(id)
  }
}

function saveOffRatePool() {
  if (!offRateRule.value.editable || draftOffRateIds.value.length !== 7) return
  selectedOffRatePools.value[offRateTier.value] = [...draftOffRateIds.value]
  showOffRateEditor.value = false
}

async function warp(count) {
  if (isWarpAnimating.value || isBannerLoading.value) return

  const currentPoolType = poolType.value
  const currentBannerName = banner.value.name
  const output = performWarps(config.value, currentState.value, buildPool(), count)

  isWarpAnimating.value = true
  warpAnimationPhase.value = 'charging'

  try {
    const resultImages = [...new Set(output.results.map(item => item.image).filter(Boolean))]
    const imageReady = Promise.all(resultImages.map(src => preloadImage(src, 3500)))
    const chargeDelay = new Promise(resolve => window.setTimeout(resolve, count === 10 ? 850 : 700))

    await Promise.all([imageReady, chargeDelay])
    warpAnimationPhase.value = output.results.some(item => item.rarity === 5)
      ? 'five-star'
      : output.results.some(item => item.rarity === 4) ? 'four-star' : 'reveal'

    await new Promise(resolve => window.setTimeout(resolve, 480))

    states.value[currentPoolType] = output.state
    latestResults.value = output.results
    history.value.unshift(...output.results.slice().reverse().map(result => ({
      ...result, poolType: currentPoolType, bannerName: currentBannerName,
    })))
    showResults.value = true
    window.setTimeout(startResultReveal, 0)
  } catch (error) {
    console.error('Warp animation failed', error)
    states.value[currentPoolType] = output.state
    latestResults.value = output.results
    history.value.unshift(...output.results.slice().reverse().map(result => ({
      ...result, poolType: currentPoolType, bannerName: currentBannerName,
    })))
    showResults.value = true
    window.setTimeout(startResultReveal, 0)
  } finally {
    warpAnimationPhase.value = 'idle'
    isWarpAnimating.value = false
  }
}


function clearResultRevealTimer() {
  if (resultRevealTimer) {
    window.clearInterval(resultRevealTimer)
    resultRevealTimer = null
  }
}

function startResultReveal() {
  clearResultRevealTimer()
  const total = latestResults.value.length
  showAllResults.value = false
  visibleResultCount.value = total ? 1 : 0
  syncFiveStarIntro()
}

function revealNextResult() {
  if (showAllResults.value) return

  if (showFiveStarIntro.value) {
    showFiveStarIntro.value = false
    return
  }

  if (visibleResultCount.value < latestResults.value.length) {
    visibleResultCount.value += 1
    syncFiveStarIntro()
    return
  }

  showAllResults.value = true
}

function skipResultReveal() {
  showFiveStarIntro.value = false
  visibleResultCount.value = latestResults.value.length
  showAllResults.value = true
  clearResultRevealTimer()
}

function closeResults() {
  clearResultRevealTimer()
  showFiveStarIntro.value = false
  showAllResults.value = false
  showResults.value = false
}

function skipWarpAnimation() {
  if (!isWarpAnimating.value) return
  warpAnimationPhase.value = 'reveal'
}

function resetProgress() {
  if (!window.confirm('ล้าง pity และประวัติกาชาทั้งหมดหรือไม่?')) return
  states.value = { character: createDefaultPoolState(), lightCone: createDefaultPoolState(), standard: createDefaultPoolState() }
  history.value = []
  latestResults.value = []
  visibleResultCount.value = 0
  showFiveStarIntro.value = false
  showAllResults.value = false
  clearResultRevealTimer()
}

onMounted(() => {
  window.addEventListener('resize', updateViewportWidth, { passive: true })
  updateViewportWidth()
  preloadBannerAssets()
  loadStarRailResources()
    .then(() => { starRailResourcesReady.value = true })
    .catch(error => console.warn('Unable to load StarRailRes metadata', error))
  preloadImage(banner.value.image)
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.states) states.value = { ...states.value, ...saved.states }
    if (Array.isArray(saved?.history)) history.value = saved.history.map(normalizeSavedHistoryItem)
    if (saved?.selectedPatchVersion) selectedPatchVersion.value = saved.selectedPatchVersion
    if (saved?.selectedPatchPhase) selectedPatchPhase.value = saved.selectedPatchPhase
    if (saved?.selectedOffRatePools && typeof saved.selectedOffRatePools === 'object') {
      for (const tier of ['expanded', 'latest']) {
        const allowed = tier === 'expanded'
          ? [...standard5Characters, ...extraOffRateCharacters.slice(0, 3)]
          : limitedOffRateCandidates
        const validIds = Array.isArray(saved.selectedOffRatePools[tier])
          ? saved.selectedOffRatePools[tier].filter(id => allowed.some(character => character.id === id))
          : []
        if (validIds.length === 7) selectedOffRatePools.value[tier] = validIds
      }
    } else if (Array.isArray(saved?.selectedOffRateIds)) {
      // Migrate the previous single-pool format into both editable tiers.
      const expandedAllowed = [...standard5Characters, ...extraOffRateCharacters.slice(0, 3)]
      const expandedIds = saved.selectedOffRateIds.filter(id => expandedAllowed.some(character => character.id === id))
      const latestIds = saved.selectedOffRateIds.filter(id => limitedOffRateCandidates.some(character => character.id === id))
      if (expandedIds.length === 7) selectedOffRatePools.value.expanded = expandedIds
      if (latestIds.length === 7) selectedOffRatePools.value.latest = latestIds
    }
  } catch (error) {
    console.warn('Unable to restore warp history', error)
  }
  applyPatchPhase(selectedPatchVersion.value, selectedPatchPhase.value)
})

onBeforeUnmount(() => {
  clearResultRevealTimer()
  window.removeEventListener('resize', updateViewportWidth)
})

watch([states, history, selectedOffRatePools, selectedPatchVersion, selectedPatchPhase], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    masterDataVersion: MASTER_DATA_VERSION,
    states: states.value,
    history: history.value.slice(0, 1000),
    selectedOffRatePools: selectedOffRatePools.value,
    selectedPatchVersion: selectedPatchVersion.value,
    selectedPatchPhase: selectedPatchPhase.value,
  }))
}, { deep: true })

function scrollVersionPicker(event) {
  const el = event.currentTarget
  if (!el || el.scrollWidth <= el.clientWidth) return

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY

  if (delta !== 0) {
    event.preventDefault()
    el.scrollLeft += delta
  }
}

</script>

<template>
  <main class="warp-page" :style="{ '--banner-image': `url(${banner.image})` }">
    <div class="background-layer"></div>
    <header class="topbar">
      <div><p class="eyebrow">การวาร์ป</p><h1>{{ banner.name }}</h1></div>
      <div class="top-actions">
        <button class="history-button" @click="showBannerArchive = true">ตู้ย้อนหลัง</button>
        <button class="history-button" @click="showHistory = true">ประวัติ <span>{{ history.length }}</span></button>
        <button class="reset-button" @click="resetProgress">รีเซ็ตข้อมูล</button>
      </div>
    </header>

    <section class="layout">
      <nav class="banner-tabs">
        <div class="patch-label">Version {{ selectedPatchVersion }} • {{ selectedPatchPhase }}</div>
        <Swiper
          class="banner-tabs-swiper"
          :key="`${selectedPatchVersion}-${selectedPatchPhase}-${bannerTabsDirection}`"
          :modules="swiperModules"
          :direction="bannerTabsDirection"
          :slides-per-view="'auto'"
          :space-between="12"
          :free-mode="{ enabled: true, sticky: false }"
          :mousewheel="{ forceToAxis: true, releaseOnEdges: true }"
          :watch-overflow="true"
          observer
          observe-parents
        >
          <SwiperSlide v-for="tab in tabs" :key="tab.id" class="banner-tab-slide">
            <button :class="['tab-card', { active: activeTab === tab.id }]" :disabled="isBannerLoading || isWarpAnimating" @click="switchBanner(tab.id)">
              <img :src="tab.image" :alt="tab.name" loading="lazy" decoding="async">
              <span>{{ tab.name }}</span>
              <small v-if="tab.badge" class="tab-badge">{{ tab.badge }}</small>
            </button>
          </SwiperSlide>
        </Swiper>
      </nav>

      <div class="banner-stage">
        <Transition name="banner-loader-fade">
          <div v-if="isBannerLoading" class="banner-loader" role="status" aria-live="polite">
            <div class="warp-loader-ring"><span></span><span></span><span></span></div>
            <strong>กำลังเปลี่ยนแบนเนอร์</strong>
            <small>กำลังโหลดข้อมูลและภาพ Rate Up...</small>
          </div>
        </Transition>
        <div class="banner-copy">
          <span class="banner-tag">{{ banner.tag }}</span>
          <p class="small-title">เพิ่มอัตราการได้รับ</p>
          <h2>{{ banner.featuredName }}</h2>
          <p class="description">ทุก 10 ครั้ง รับประกันไอเทม 4 ดาวขึ้นไป<br>และรับประกัน 5 ดาวภายใน {{ config.hardPity5 }} ครั้ง</p>
          <div class="banner-badges">
            <div class="rate-badge" v-if="poolType !== 'standard'">{{ Math.round(config.featuredRate5 * 100) }}% เรท UP</div>
            <button class="details-button" @click="showBannerDetails = true">รายละเอียดตู้ / รายการที่ออกได้</button>
          </div>

          <section v-if="banner.featured4?.length" class="featured-four-preview">
            <div class="featured-four-heading">
              <span><strong>4★ Rate Up</strong> ตู้ปัจจุบัน</span>
              <small>{{ banner.featured4.length }} รายการ</small>
            </div>
            <div class="featured-four-list">
              <article v-for="item in banner.featured4" :key="item.id" class="featured-four-card">
                <img :src="item.image" :alt="item.name" loading="eager" decoding="async">
                <div>
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small>
                </div>
                <b>UP</b>
              </article>
            </div>
          </section>
        </div>

        <img class="hero-character" :src="banner.image" :alt="banner.featuredName" loading="eager" decoding="async" fetchpriority="high">

        <div class="pity-panel">
          <div class="pity-heading"><span>สัญญาณค้นหาปัจจุบัน</span><strong>{{ currentState.totalPulls }} โรล</strong></div>
          <div class="pity-grid">
            <div class="pity-card five"><div><span>5★</span><b>{{ currentState.pullsSince5 }}</b><small>กดไปแล้ว</small></div><p>การันตีในอีก <strong>{{ pullsTo5 }}</strong> โรล</p></div>
            <div class="pity-card four"><div><span>4★</span><b>{{ currentState.pullsSince4 }}</b><small>กดไปแล้ว</small></div><p>การันตีในอีก <strong>{{ pullsTo4 }}</strong> โรล</p></div>
          </div>
          <div class="guarantee-row" v-if="poolType !== 'standard'">
            <span :class="{ on: currentState.guaranteedFeatured5 }">5★ {{ currentState.guaranteedFeatured5 ? 'การันตีตัวเรท UP' : 'ยังมีโอกาสหลุดเรท' }}</span>
            <span :class="{ on: currentState.guaranteedFeatured4 }">4★ {{ currentState.guaranteedFeatured4 ? 'การันตีเรท UP' : 'สุ่มตามอัตราปกติ' }}</span>
          </div>
        </div>

        <div class="warp-actions">
          <button :disabled="isWarpAnimating || isBannerLoading" @click="warp(1)"><small>ใช้ตั๋ว ×1</small><strong>วาร์ป 1 ครั้ง</strong></button>
          <button class="primary" :disabled="isWarpAnimating || isBannerLoading" @click="warp(10)"><small>ใช้ตั๋ว ×10</small><strong>วาร์ป 10 ครั้ง</strong></button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="warp-animation-fade">
        <div v-if="isWarpAnimating" :class="['warp-animation', `phase-${warpAnimationPhase}`]" aria-live="polite">
          <div class="warp-space">
            <span v-for="n in 18" :key="n" class="warp-streak" :style="{ '--i': n }"></span>
            <div class="warp-core"><span></span><span></span><span></span></div>
            <div class="warp-flash"></div>
          </div>
          <button class="warp-skip" type="button" @click="skipWarpAnimation">ข้าม</button>
          <div class="warp-animation-label">
            <h3>{{ warpAnimationPhase === 'charging' ? 'กำลังเริ่มการวาร์ป' : warpAnimationPhase === 'five-star' ? 'ตรวจพบสัญญาณระดับ 5★' : warpAnimationPhase === 'four-star' ? 'ตรวจพบสัญญาณระดับ 4★' : 'กำลังเปิดเผยผลลัพธ์' }}</h3>
            <small>กำลังเตรียมภาพผลลัพธ์...</small>
          </div>
        </div>
      </Transition>
    </Teleport>



    <div v-if="showBannerArchive" class="modal-backdrop" @click.self="showBannerArchive = false">
      <section class="archive-modal">
        <button class="close" @click="showBannerArchive = false">×</button>
        <p class="eyebrow">Character Event Warp Archive</p>
        <h2>ตู้ย้อนหลัง Version 1.0–4.4</h2>
        <div class="version-picker" role="tablist" aria-label="เลือกเวอร์ชันแบนเนอร์" @wheel="scrollVersionPicker">
          <button
            v-for="patch in BANNER_ARCHIVE"
            :key="patch.version"
            type="button"
            role="tab"
            :aria-selected="archiveVersion === patch.version"
            :class="{ active: archiveVersion === patch.version }"
            @click="archiveVersion = patch.version; archivePhase = patch.phases[0]?.phase"
          >
            {{ patch.version }}
          </button>
        </div>
        <div class="phase-picker">
          <button v-for="phase in selectedArchivePatch.phases" :key="phase.phase" :class="{ active: archivePhase === phase.phase }" @click="archivePhase = phase.phase">{{ phase.phase }}</button>
        </div>
        <button class="apply-patch-button" @click="applyPatchPhase(archiveVersion, archivePhase)">แสดงตู้ Version {{ archiveVersion }} • {{ archivePhase }}</button>
        <p class="archive-filter-note">เมนูด้านซ้ายจะแสดงเฉพาะตู้ตัวละครใหม่/รีรันและ Light Cone ของ Phase ที่เลือก พร้อมตู้ถาวร</p>
        <div class="archive-phases">
          <section v-if="selectedArchivePhase" class="archive-phase">
            <div class="archive-phase-title"><strong>Version {{ selectedArchivePatch.version }}</strong><span>{{ selectedArchivePhase.phase }}</span></div>
            <div class="archive-banner-grid">
              <button v-for="character in selectedArchivePhase.fiveStars" :key="character" class="archive-banner-card" @click="selectArchiveBanner(selectedArchivePatch.version, selectedArchivePhase.phase, character)">
                <img :src="characterItem(character).image" :alt="character" loading="lazy" decoding="async">
                <div><strong>{{ character }}</strong><small>5★ Rate Up</small></div>
                <span>เลือกตู้นี้</span>
              </button>
            </div>
            <p v-if="selectedArchivePhase.fourStars.length" class="archive-four-stars">4★ Rate Up: {{ selectedArchivePhase.fourStars.join(' • ') }}</p>
          </section>
        </div>
      </section>
    </div>

    <div v-if="showBannerDetails" class="modal-backdrop" @click.self="showBannerDetails = false">
      <section class="pool-modal">
        <button class="close" @click="showBannerDetails = false">×</button>
        <p class="eyebrow">รายละเอียดแบนเนอร์</p>
        <h2>{{ banner.name }}</h2>
        <p class="pool-note" v-if="poolType !== 'standard'">เมื่อได้ 5★ มีโอกาส {{ Math.round(config.featuredRate5 * 100) }}% เป็นตัวเรท UP หากหลุดเรท ครั้งถัดไปจะการันตีเรท UP</p>
        <p class="pool-note" v-else>ตู้ถาวรสามารถออกได้ทั้งตัวละครและ Light Cone ตามรายการด้านล่าง</p>

        <div class="pool-sections">
          <section v-if="detailPool.featured5.length">
            <h3><span class="star five-star">5★</span> เรท UP</h3>
            <div class="pool-grid"><article v-for="item in detailPool.featured5" :key="item.id" class="pool-item featured"><img :src="item.image" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small></div><b>UP</b></article></div>
          </section>
          <section v-if="detailPool.featured4.length">
            <h3><span class="star four-star">4★</span> เรท UP</h3>
            <div class="pool-grid"><article v-for="item in detailPool.featured4" :key="item.id" class="pool-item featured-four"><img :src="item.image" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small></div><b>UP</b></article></div>
          </section>
          <section v-if="detailPool.offRate5.length">
            <div class="pool-title-row">
              <div>
                <h3><span class="star five-star">5★</span> Pool หลุดเรท</h3>
                <p class="section-description">{{ offRateRule.description }} เมื่อหลุดเรท ระบบจะสุ่ม 1 ตัวจาก Pool 7 ตัวที่ใช้งานอยู่ และเปิดสถานะการันตีสำหรับ 5★ ครั้งถัดไป</p>
              </div>
              <button v-if="poolType === 'character' && offRateRule.editable" class="edit-pool-button" @click="openOffRateEditor">แก้ไข Pool 7 ตัว</button>
              <span v-else-if="poolType === 'character'" class="locked-pool-badge">ล็อกตาม Version</span>
            </div>
            <div class="pool-grid"><article v-for="item in detailPool.offRate5" :key="item.id" class="pool-item"><img :src="item.image" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small></div></article></div>
          </section>
          <section v-if="poolType === 'standard'">
            <h3><span class="star five-star">5★</span> รายการ 5★ ทั้งหมด</h3>
            <div class="pool-grid"><article v-for="item in detailPool.standard5" :key="item.id" class="pool-item"><img :src="item.image" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small></div></article></div>
          </section>
          <section>
            <h3><span class="star four-star">4★</span> รายการปกติที่มีโอกาสออก</h3>
            <div class="pool-grid"><article v-for="item in detailPool.normal4" :key="item.id" class="pool-item"><img :src="item.image" :alt="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.kind }}<template v-if="item.element || item.path"> • {{ item.element }} • {{ item.path }}</template></small></div></article></div>
          </section>
        </div>
      </section>
    </div>


    <div v-if="showOffRateEditor" class="modal-backdrop pool-editor-backdrop" @click.self="showOffRateEditor = false">
      <section class="pool-editor-modal">
        <button class="close" @click="showOffRateEditor = false">×</button>
        <p class="eyebrow">Limited Character Pool</p>
        <h2>เลือกตัวละครหลุดเรท 7 ตัว</h2>
        <p class="pool-note">{{ offRateRule.description }} ต้องเลือกให้ครบ 7 ตัว และรายการนี้ใช้กับตู้ Limited ในช่วง Version เดียวกัน</p>

        <div class="selection-status" :class="{ complete: draftOffRateCount === 7 }">
          เลือกแล้ว <strong>{{ draftOffRateCount }}/7</strong> ตัว
        </div>

        <div class="candidate-grid">
          <button
            v-for="character in offRateRule.candidates"
            :key="character.id"
            :class="['candidate-card', { selected: draftOffRateIds.includes(character.id) }]"
            @click="toggleOffRateCharacter(character.id)"
          >
            <span v-if="draftOffRateIds.includes(character.id)" class="selection-order">{{ draftOffRateIds.indexOf(character.id) + 1 }}</span>
            <img :src="character.image" :alt="character.name">
            <strong>{{ character.name }}</strong>
            <small>{{ draftOffRateIds.includes(character.id) ? 'อยู่ใน Pool' : 'แตะเพื่อเลือก' }}</small>
          </button>
        </div>

        <div class="pool-editor-actions">
          <button class="cancel-editor" @click="showOffRateEditor = false">ยกเลิก</button>
          <button class="save-editor" :disabled="draftOffRateCount !== 7" @click="saveOffRatePool">
            บันทึก Pool {{ draftOffRateCount }}/7
          </button>
        </div>
      </section>
    </div>

    <div v-if="showResults" class="modal-backdrop result-backdrop">
      <section :class="['result-modal', { 'reveal-mode': !showAllResults, 'overview-mode': showAllResults }]">
        <button class="close" @click="closeResults">×</button>

        <template v-if="!showAllResults && currentRevealResult">
          <button class="fullscreen-reveal" type="button" @click="revealNextResult">
            <div class="reveal-progress">{{ visibleResultCount }} / {{ latestResults.length }}</div>
            <div v-if="!showFiveStarIntro" :class="['reveal-aura', `rarity-${currentRevealResult.rarity}`]"></div>

            <div v-if="showFiveStarIntro" class="five-star-path-intro" :key="`path-${currentRevealResult.createdAt}-${visibleResultCount}`">
              <img
                v-if="currentRevealPathMeta?.icon"
                class="five-star-path-icon"
                :src="currentRevealPathMeta.icon"
                :alt="currentRevealPathMeta.name || 'Path'"
              >
              <div class="five-star-intro-stars">★★★★★</div>
            </div>

            <div v-else :class="['reveal-content', `rarity-${currentRevealResult.rarity}`]" :key="`${currentRevealResult.createdAt}-${visibleResultCount}`">
              <img
                :class="['reveal-portrait', currentRevealResult.kind === 'ตัวละคร' ? 'character' : 'light-cone']"
                :src="currentRevealPortrait"
                :alt="currentRevealCharacterMeta?.name || currentRevealResult.name"
                loading="eager"
                decoding="async"
              >
              <div v-if="currentRevealResult.kind === 'ตัวละคร'" class="reveal-character-overlay">
                <div class="reveal-stars">{{ '★'.repeat(currentRevealCharacterMeta?.rarity || currentRevealResult.rarity) }}</div>
                <div class="reveal-meta-row reveal-character-name">
                  <img v-if="currentRevealCharacterMeta?.element?.icon" :src="currentRevealCharacterMeta.element.icon" :alt="currentRevealCharacterMeta.element.name">
                  <span>{{ currentRevealCharacterMeta?.name || currentRevealResult.name }}</span>
                </div>
                <div v-if="currentRevealCharacterMeta?.path?.name" class="reveal-meta-row reveal-character-path">
                  <img v-if="currentRevealCharacterMeta.path.icon" :src="currentRevealCharacterMeta.path.icon" :alt="currentRevealCharacterMeta.path.name">
                  <span>{{ currentRevealCharacterMeta.path.name }}</span>
                </div>
              </div>
              <div v-else class="reveal-info">
                <div class="reveal-stars" style="margin-bottom: 10px;">{{ '★'.repeat(currentRevealResult.rarity) }}</div>
                <h2>{{ currentRevealResult.name }}</h2>
              </div>
            </div>
            <span class="tap-next">{{ showFiveStarIntro ? 'แตะเพื่อเปิดเผยผลลัพธ์' : (visibleResultCount < latestResults.length ? 'แตะเพื่อดูรายการถัดไป' : 'แตะเพื่อดูผลรวม') }}</span>
          </button>
          <button v-if="latestResults.length === 10" class="skip-results reveal-skip" type="button" @click.stop="skipResultReveal">ข้าม</button>
        </template>

        <template v-else>
          <p class="eyebrow">ผลการวาร์ป</p><h2>{{ latestResults.length === 10 ? 'วาร์ป 10 ครั้ง' : 'วาร์ป 1 ครั้ง' }}</h2>
          <div :class="['result-grid', { single: latestResults.length === 1 }]">
            <article v-for="(item, index) in latestResults" :key="`${item.createdAt}-${index}`" :class="['result-card', `rarity-${item.rarity}`]" :style="{ '--delay': `${index * 35}ms` }">
              <div class="rarity">{{ '★'.repeat(item.rarity) }}</div><img :src="item.image" :alt="item.name" loading="eager" decoding="async"><h3>{{ item.name }}</h3><p>{{ item.kind }} <span v-if="item.featured">• เรท UP</span></p><small v-if="item.rarity === 5">ออกที่ pity {{ item.pity5 }}</small>
            </article>
          </div>
          <div class="result-actions"><button class="continue" @click="closeResults">ดำเนินการต่อ</button></div>
        </template>
      </section>
    </div>

    <div v-if="showHistory" class="drawer-backdrop" @click.self="showHistory = false">
      <aside class="history-drawer">
        <div class="drawer-head"><div><p class="eyebrow">บันทึกการวาร์ป</p><h2>ประวัติกาชา</h2></div><button @click="showHistory = false">×</button></div>
        <div class="history-filter-group">
          <span>ประเภทตู้</span>
          <div class="filter-tabs">
            <button v-for="item in [{id:'all',label:'ทั้งหมด'},{id:'character',label:'ตัวละคร'},{id:'lightCone',label:'Light Cone'},{id:'standard',label:'ถาวร'}]" :key="item.id" :class="{active:historyFilter===item.id}" @click="historyFilter=item.id">{{ item.label }}</button>
          </div>
        </div>
        <div class="history-filter-group rarity-filter-group">
          <span>ระดับ</span>
          <div class="filter-tabs rarity-filter-tabs">
            <button v-for="item in [{id:'all',label:'ทุกระดับ'},{id:'5',label:'5★'},{id:'4',label:'4★'},{id:'3',label:'3★'}]" :key="item.id" :class="{active:historyRarityFilter===item.id}" @click="historyRarityFilter=item.id">{{ item.label }}</button>
          </div>
        </div>
        <div class="history-list">
          <article v-for="(item,index) in filteredHistory" :key="`${item.createdAt}-${index}`" :class="`history-item rarity-${item.rarity}`">
            <img :src="item.image" :alt="item.name">
            <div>
              <h3>{{ item.name }} <span>{{ '★'.repeat(item.rarity) }}</span></h3>
              <p>{{ item.bannerName }} · โรลที่ {{ item.pullNumber }}</p>
              <small>{{ new Date(item.createdAt).toLocaleString('th-TH') }}<template v-if="item.rarity===5"> · pity {{ item.pity5 }}</template></small>
            </div>
            <b v-if="rateUpStatusLabel(item)" class="rate-status" :class="`status-${item.rateUpStatus}`">
              <span aria-hidden="true">{{ item.rateUpStatus === 'guaranteed' ? '◆' : item.rateUpStatus === 'won' ? '✓' : '✕' }}</span>
              {{ rateUpStatusLabel(item) }}
            </b>
          </article>
          <p v-if="!filteredHistory.length" class="empty">ยังไม่มีประวัติการวาร์ป</p>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
*{box-sizing:border-box}.warp-page{min-height:100vh;overflow:hidden;position:relative;color:#fff;background:#0d111d;font-family:'RPG-TH',sans-serif}.background-layer{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,12,23,.98) 0%,rgba(11,16,29,.88) 35%,rgba(9,13,24,.18) 70%,rgba(5,8,15,.72) 100%),var(--banner-image) center/cover;filter:saturate(.8)}.background-layer:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 75% 35%,transparent 0 22%,rgba(5,8,17,.55) 64%),linear-gradient(0deg,#0a0e18 0,transparent 35%)}.topbar{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:28px 48px}.eyebrow{color:#d9c49b;font-size:18px;letter-spacing:.08em}.topbar h1,.drawer-head h2,.result-modal h2{font-size:30px;font-weight:500}.top-actions{display:flex;gap:12px}.top-actions button{border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:10px 18px;background:rgba(0,0,0,.35);color:#fff;font-size:17px}.history-button span{background:#dbc18e;color:#1c2230;border-radius:999px;padding:1px 8px;margin-left:7px}.layout{position:relative;z-index:2;display:grid;grid-template-columns:170px 1fr;gap:28px;padding:5px 48px 40px}.banner-tabs{display:flex;flex-direction:column;gap:16px}.tab-card{height:92px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.18);border-radius:5px;background:#141a26;color:#fff;opacity:.62;transition:.2s}.tab-card img{width:100%;height:100%;object-fit:cover}.tab-card span{position:absolute;inset:auto 0 0;padding:5px 8px;background:linear-gradient(transparent,rgba(0,0,0,.9));font-size:14px}.tab-card.active{opacity:1;transform:translateX(10px);border:3px solid #f5e9c9;box-shadow:0 0 0 2px #9c7d47,0 10px 30px rgba(0,0,0,.5)}.banner-stage{min-height:760px;position:relative;border:1px solid rgba(255,255,255,.13);border-radius:28px 4px 28px 4px;overflow:hidden;background:linear-gradient(90deg,rgba(226,225,220,.95) 0 33%,rgba(255,255,255,.05) 58%,rgba(0,0,0,.14));box-shadow:0 24px 90px rgba(0,0,0,.4)}.banner-stage:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.08),transparent 55%);pointer-events:none}.hero-character{position:absolute;top:-250px;right:0;bottom:auto;left:auto;width:78%;height:calc(100% + 250px);object-fit:cover;object-position:center top;mask-image:linear-gradient(90deg,transparent 0,#000 28%);-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 28%)}.banner-copy{position:absolute;z-index:2;top:55px;left:48px;width:370px;color:#2d2d31}.banner-tag{display:inline-block;background:linear-gradient(180deg,#F7E39A 0%,#E6C15A 55%,#C9962A 100%);color:#3B2A08;padding:5px 20px;border-radius:0 20px 20px 0;margin-left:-48px;border:1px solid rgba(255,236,170,.65);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 6px rgba(0,0,0,.18);transition:none}.small-title{margin-top:42px;color:#8b7651;font-size:20px}.banner-copy h2{font-size:48px;line-height:1.05;margin:8px 0 25px}.description{font-size:21px;line-height:1.55;color:#5c5a5a}.rate-badge{display:inline-block;margin-top:20px;padding:6px 16px;border:1px solid #c59640;border-radius:999px;color:#a06c15;background:#fff8e4}.banner-badges{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:20px}.banner-badges .rate-badge{margin-top:0}.details-button{padding:7px 14px;border:1px solid #8c7247;border-radius:999px;background:rgba(255,255,255,.78);color:#5c4827;font-size:14px}.pool-modal{width:min(1120px,94vw);max-height:92vh;overflow:auto;position:relative;padding:32px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:linear-gradient(160deg,#171d2b,#080c14);box-shadow:0 30px 100px #000}.pool-modal>h2{font-size:32px;margin-bottom:8px}.pool-note,.section-description{color:#b9c0cd;line-height:1.6}.pool-sections{display:grid;gap:24px;margin-top:24px}.pool-sections h3{font-size:21px;margin-bottom:10px}.star{display:inline-block;margin-right:8px}.five-star{color:#f6c55c}.four-star{color:#bc8cf1}.pool-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.pool-item{display:grid;grid-template-columns:58px 1fr auto;align-items:center;gap:10px;min-height:72px;padding:8px 12px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(255,255,255,.05)}.pool-item.featured{border-color:rgba(246,197,92,.6);background:rgba(246,197,92,.1)}.pool-item.featured-four{border-color:rgba(188,140,241,.55);background:rgba(188,140,241,.09)}.pool-item img{width:58px;height:58px;object-fit:contain;background:rgba(255,255,255,.05);border-radius:8px}.pool-item strong,.pool-item small{display:block}.pool-item small{color:#9ca4b2;margin-top:3px}.pool-item>b{padding:3px 7px;border-radius:999px;background:#d5ad55;color:#231b0c;font-size:12px}.featured-four-preview{margin-top:16px;padding:12px;border:1px solid rgba(112,75,155,.28);border-radius:12px;background:rgba(255,255,255,.66);backdrop-filter:blur(8px)}.featured-four-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;color:#51415f}.featured-four-heading strong{color:#7a4aa7}.featured-four-heading small{color:#786c80}.featured-four-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.featured-four-card{display:grid;grid-template-columns:42px minmax(0,1fr);align-items:center;gap:7px;min-height:48px;padding:4px 6px;border:1px solid rgba(122,74,167,.16);border-radius:8px;background:rgba(255,255,255,.72)}.featured-four-card img{width:42px;height:42px;object-fit:contain;border-radius:7px;background:rgba(122,74,167,.08)}.featured-four-card strong,.featured-four-card small{display:block}.featured-four-card strong{font-size:12px;color:#343038;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.featured-four-card small{font-size:11px;color:#7c7481}.featured-four-card>b{display:none;padding:3px 7px;border-radius:999px;background:#9566bf;color:#fff;font-size:10px}.pity-panel{position:absolute;z-index:3;left:40px;bottom:28px;width:min(500px,calc(100% - 520px));padding:10px 12px;border:1px solid rgba(255,255,255,.3);border-radius:14px;background:rgba(10,15,27,.84);backdrop-filter:blur(14px);box-shadow:0 15px 45px rgba(0,0,0,.35)}.pity-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;color:#ddd;font-size:13px}.pity-heading strong{color:#f2d79f}.pity-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.pity-card{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.08)}.pity-card>div{display:grid;grid-template-columns:auto auto;gap:0 10px;align-items:center}.pity-card span{font-size:18px}.pity-card b{font-size:24px}.pity-card small{grid-column:2;color:#aeb4c0;font-size:11px}.pity-card p{font-size:12px}.pity-card strong{font-size:20px}.pity-card.five span,.pity-card.five strong{color:#f6c55c}.pity-card.four span,.pity-card.four strong{color:#bc8cf1}.guarantee-row{display:flex;gap:6px;margin-top:6px}.guarantee-row span{font-size:11px;padding:3px 7px;border:1px solid rgba(255,255,255,.18);border-radius:999px;color:#aab0bd}.guarantee-row span.on{color:#ffdd8a;border-color:#d6aa4a;background:rgba(214,170,74,.13)}.warp-actions{position:absolute;z-index:4;right:34px;bottom:28px;display:flex;gap:12px}.warp-actions button{min-width:210px;padding:10px 25px;border:3px solid #f6f0e2;border-radius:999px;background:#e7e4dc;color:#272b34;box-shadow:inset 0 0 0 1px #aaa49a,0 8px 25px rgba(0,0,0,.35)}.warp-actions button.primary{background:linear-gradient(90deg,#f7dd98,#fff4cf)}.warp-actions small,.warp-actions strong{display:block}.warp-actions small{font-size:13px;color:#777}.warp-actions strong{font-size:23px}.modal-backdrop,.drawer-backdrop{position:fixed;z-index:20;inset:0;background:rgba(3,6,13,.82);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center}.result-modal{width:min(1320px,94vw);max-height:94vh;overflow:auto;position:relative;padding:35px;text-align:center}.close{position:absolute;right:20px;top:10px;color:#fff;font-size:45px}.result-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:13px;margin:28px 0}.result-grid.single{grid-template-columns:260px;justify-content:center}.result-card{min-height:270px;position:relative;overflow:hidden;padding:12px 8px 15px;border:1px solid rgba(255,255,255,.2);background:linear-gradient(160deg,#384153,#111827);clip-path:polygon(0 0,90% 0,100% 10%,100% 100%,0 100%)}.result-card.rarity-5{background:linear-gradient(160deg,#ab712e,#2c1d3a);box-shadow:0 0 30px rgba(255,196,74,.27)}.result-card.rarity-4{background:linear-gradient(160deg,#7350a8,#23213b)}.result-card img{width:100%;height:170px;object-fit:contain}.result-card h3{font-size:19px}.result-card p,.result-card small{color:#c7cad2}.result-card .rarity{color:#ffd36a;letter-spacing:2px}.continue{padding:12px 40px;border-radius:999px;background:#ece8df;color:#252832;font-size:19px}.drawer-backdrop{justify-content:flex-end}.history-drawer{width:min(620px,95vw);height:100%;padding:28px;background:linear-gradient(160deg,#171d2b,#080c14);box-shadow:-20px 0 60px #000;overflow:hidden}.drawer-head{display:flex;justify-content:space-between;align-items:center}.drawer-head button{font-size:40px}.filter-tabs{display:flex;gap:8px;margin:20px 0}.filter-tabs button{padding:7px 14px;border-radius:999px;border:1px solid #414958;color:#bbc0ca}.filter-tabs button.active{background:#e5d4ae;color:#242832}.history-list{height:calc(100vh - 165px);overflow:auto;padding-right:8px}.history-item{display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:14px;padding:12px;margin-bottom:8px;border-left:4px solid #667085;background:rgba(255,255,255,.055)}.history-item.rarity-5{border-color:#f0b94f;background:rgba(240,185,79,.09)}.history-item.rarity-4{border-color:#ad78ea}.history-item img{width:64px;height:64px;object-fit:contain;background:rgba(255,255,255,.06)}.history-item h3{font-size:19px}.history-item h3 span{color:#ffd36a;font-size:13px}.history-item p,.history-item small{color:#969eac}.history-item>b{background:#e0b557;color:#211c12;border-radius:99px;padding:4px 8px}.empty{text-align:center;color:#8e96a5;margin-top:80px}
.banner-loader{position:absolute;z-index:12;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,12,22,.78);backdrop-filter:blur(12px);color:#fff;text-align:center}.banner-loader strong{font-size:21px;font-weight:600;letter-spacing:.03em}.banner-loader small{color:#c4cad5;font-size:13px}.warp-loader-ring{position:relative;width:64px;height:64px}.warp-loader-ring span{position:absolute;inset:0;border:2px solid transparent;border-top-color:#f3d48e;border-radius:50%;animation:warp-loader-spin 1s linear infinite}.warp-loader-ring span:nth-child(2){inset:9px;border-top-color:#bd8bf0;animation-duration:.75s;animation-direction:reverse}.warp-loader-ring span:nth-child(3){inset:18px;border-top-color:#fff;animation-duration:.55s}.banner-loader-fade-enter-active,.banner-loader-fade-leave-active{transition:opacity .2s ease}.banner-loader-fade-enter-from,.banner-loader-fade-leave-to{opacity:0}@keyframes warp-loader-spin{to{transform:rotate(360deg)}}

.warp-actions button:disabled,.tab-card:disabled{cursor:wait;filter:saturate(.65);opacity:.7}.warp-animation{position:fixed;z-index:50;inset:0;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at center,#23375e 0,#080d18 45%,#02040a 100%);isolation:isolate}.warp-skip{position:absolute;z-index:4;top:24px;right:28px;padding:9px 20px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:rgba(4,8,16,.48);color:#fff;font-size:15px;backdrop-filter:blur(8px)}.warp-skip:hover{background:rgba(255,255,255,.16)}.warp-space{position:absolute;inset:0;perspective:700px;overflow:hidden}.warp-streak{--angle:calc(var(--i)*20deg);position:absolute;left:50%;top:50%;width:2px;height:45vh;transform-origin:50% 0;transform:rotate(var(--angle)) translateY(22px) scaleY(.12);background:linear-gradient(to bottom,rgba(255,255,255,.95),rgba(126,183,255,.55),transparent);filter:drop-shadow(0 0 8px rgba(130,190,255,.8));animation:warp-streak-flight .62s cubic-bezier(.2,.65,.25,1) infinite;animation-delay:calc(var(--i)*-37ms)}.warp-core{position:absolute;left:50%;top:50%;width:120px;height:120px;transform:translate(-50%,-50%)}.warp-core span{position:absolute;inset:0;border:2px solid rgba(189,222,255,.7);border-radius:50%;box-shadow:0 0 40px rgba(107,168,255,.55);animation:warp-core-pulse .8s ease-in-out infinite}.warp-core span:nth-child(2){inset:18px;animation-delay:-.2s}.warp-core span:nth-child(3){inset:38px;background:#fff;box-shadow:0 0 80px 25px rgba(120,184,255,.8);animation-delay:-.4s}.warp-flash{position:absolute;inset:0;opacity:0;background:#fff}.phase-five-star .warp-core span{border-color:#ffe6a3;box-shadow:0 0 55px rgba(255,190,63,.8)}.phase-five-star .warp-core span:nth-child(3){background:#fff5cf;box-shadow:0 0 100px 35px rgba(255,177,38,.95)}.phase-four-star .warp-core span{border-color:#dcbaff;box-shadow:0 0 55px rgba(171,92,255,.8)}.phase-four-star .warp-core span:nth-child(3){background:#f0deff;box-shadow:0 0 100px 35px rgba(162,76,255,.9)}.phase-five-star .warp-flash,.phase-four-star .warp-flash,.phase-reveal .warp-flash{animation:warp-screen-flash .45s ease-out forwards}.warp-animation-label{position:relative;z-index:2;margin-top:280px;text-align:center;text-shadow:0 2px 16px #fff; color: #fff}.warp-animation-label h3 {font-size: 1.5rem;}.warp-animation-label small{display:block}.warp-animation-label strong{font-size:23px}.warp-animation-label small{margin-top:6px;color:#c9d1de}.warp-animation-fade-enter-active,.warp-animation-fade-leave-active{transition:opacity .2s ease}.warp-animation-fade-enter-from,.warp-animation-fade-leave-to{opacity:0}.result-card{opacity:0;animation:result-card-reveal .46s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:var(--delay)}@keyframes warp-streak-flight{0%{opacity:0;transform:rotate(var(--angle)) translateY(20px) scaleY(.08)}28%{opacity:1}100%{opacity:0;transform:rotate(var(--angle)) translateY(20px) scaleY(2.4)}}@keyframes warp-core-pulse{50%{transform:scale(1.16);opacity:.65}}@keyframes warp-screen-flash{0%{opacity:0}35%{opacity:.95}100%{opacity:0}}@keyframes result-card-reveal{from{opacity:0;transform:translateY(28px) scale(.92);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}@media(prefers-reduced-motion:reduce){.warp-streak,.warp-core span,.warp-flash,.result-card{animation-duration:.01ms!important;animation-iteration-count:1!important}.banner-loader-fade-enter-active,.banner-loader-fade-leave-active,.warp-animation-fade-enter-active,.warp-animation-fade-leave-active{transition:none}}
@media(max-width:1100px){.layout{grid-template-columns:110px 1fr;padding:5px 20px}.topbar{padding:22px}.banner-stage{min-height:720px}.banner-copy{left:30px;width:320px}.banner-copy h2{font-size:38px}.pity-panel{left:20px;bottom:28px;width:min(430px,calc(100% - 450px))}.warp-actions{left:20px;right:20px;justify-content:flex-end}.warp-actions button{min-width:190px}.tab-card span{display:none}}@media(max-width:760px){.warp-page{overflow:auto}.topbar{align-items:flex-start;padding:16px}.topbar h1{font-size:23px}.top-actions{flex-direction:column}.layout{display:block;padding:0 12px 24px}.banner-tabs{flex-direction:row;overflow:auto;padding:8px 5px 16px}.tab-card{min-width:90px;height:64px}.tab-card.active{transform:translateY(-4px)}.banner-stage{min-height:760px;border-radius:16px;background:linear-gradient(0deg,rgba(226,225,220,.97) 0 43%,rgba(0,0,0,.05) 70%)}.hero-character{top:-28px;width:100%;height:calc(55% + 28px);mask-image:linear-gradient(0deg,transparent 0,#000 30%);-webkit-mask-image:linear-gradient(0deg,transparent 0,#000 30%)}.banner-copy{top:335px;left:24px;width:calc(100% - 48px)}.banner-tag{margin-left:-24px}.small-title{margin-top:18px}.banner-copy h2{font-size:32px;margin-bottom:10px}.description{font-size:17px}.rate-badge{margin-top:8px}.featured-four-preview{margin-top:10px;padding:8px}.featured-four-list{grid-template-columns:repeat(3,1fr);gap:5px}.featured-four-card{display:flex;flex-direction:column;text-align:center;padding:4px;gap:2px}.featured-four-card img{width:38px;height:38px}.featured-four-card small,.featured-four-card>b{display:none}.featured-four-card strong{font-size:10px;line-height:1.15}.pity-panel{position:relative;left:auto;bottom:auto;width:calc(100% - 24px);margin:16px 12px 92px;padding:9px}.pity-grid{grid-template-columns:1fr 1fr}.pity-card{padding:6px 7px}.pity-card b{font-size:20px}.pity-card p{font-size:10px}.pity-card strong{font-size:17px}.guarantee-row{display:none}.warp-actions{bottom:18px;left:12px;right:12px}.warp-actions button{min-width:0;flex:1;padding:8px}.warp-actions strong{font-size:18px}.result-grid{grid-template-columns:repeat(2,1fr)}.result-card{min-height:230px}.result-card img{height:135px}}
.pool-title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:12px}.pool-title-row h3{margin-bottom:4px}.edit-pool-button{flex:none;padding:9px 16px;border:1px solid #d6aa4a;border-radius:999px;background:rgba(214,170,74,.14);color:#ffdc91}.locked-pool-badge{display:inline-flex;align-items:center;padding:7px 11px;border:1px solid rgba(255,213,128,.45);border-radius:999px;background:rgba(25,21,38,.72);color:#ffe0a3;font-size:12px;font-weight:700;white-space:nowrap}.pool-editor-modal{width:min(1080px,94vw);max-height:92vh;overflow:auto;position:relative;padding:34px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:linear-gradient(160deg,#171d2b,#080c14);box-shadow:0 30px 100px #000}.pool-editor-modal>h2{font-size:32px;margin:4px 0 8px}.selection-status{display:inline-flex;margin:22px 0 16px;padding:8px 16px;border:1px solid rgba(255,255,255,.2);border-radius:999px;color:#c8ced8}.selection-status.complete{border-color:#d6aa4a;color:#ffdc91;background:rgba(214,170,74,.12)}.candidate-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.candidate-card{position:relative;display:grid;grid-template-columns:72px 1fr;grid-template-rows:auto auto;align-items:center;gap:2px 12px;padding:10px;text-align:left;border:2px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.045);color:#fff;transition:.18s}.candidate-card:hover{border-color:rgba(255,255,255,.32);transform:translateY(-2px)}.candidate-card.selected{border-color:#e7c16d;background:rgba(231,193,109,.13);box-shadow:0 0 22px rgba(231,193,109,.12)}.candidate-card img{grid-row:1/3;width:72px;height:72px;object-fit:contain;border-radius:9px;background:rgba(255,255,255,.06)}.candidate-card strong{font-size:17px}.candidate-card small{color:#9fa7b4}.candidate-card.selected small{color:#f0cf84}.selection-order{position:absolute;top:-8px;right:-8px;width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:#f2d487;color:#251d0d;font-weight:700;box-shadow:0 4px 12px #000}.pool-editor-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}.pool-editor-actions button{min-width:170px;padding:11px 22px;border-radius:999px}.cancel-editor{border:1px solid rgba(255,255,255,.25);color:#fff}.save-editor{background:linear-gradient(90deg,#dfb95d,#fff0bb);color:#211b10}.save-editor:disabled{cursor:not-allowed;opacity:.35;filter:grayscale(1)}@media(max-width:900px){.candidate-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.pool-title-row{display:block}.edit-pool-button{margin-top:12px}.pool-editor-modal{padding:24px 16px}.candidate-grid{grid-template-columns:1fr}.pool-editor-actions{display:grid}.pool-editor-actions button{width:100%}}
.archive-modal{position:relative;width:min(1120px,94vw);max-height:92vh;overflow:auto;padding:32px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:linear-gradient(160deg,#171d2b,#080c14);box-shadow:0 30px 100px #000;color:#fff}.archive-modal>h2{font-size:32px;margin:4px 0 20px}.version-picker,.phase-picker{display:flex;gap:7px;overflow:auto;padding:4px 2px 14px}.phase-picker{margin-bottom:4px}.phase-picker button{flex:1;min-width:110px;padding:9px 14px;border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#c9d0db;background:rgba(255,255,255,.05)}.version-picker button{flex:none;min-width:54px;padding:8px 12px;border:1px solid rgba(255,255,255,.15);border-radius:999px;color:#c9d0db;background:rgba(255,255,255,.05)}.version-picker button.active,.phase-picker button.active{border-color:#e7c16d;background:#e7c16d;color:#211a0b}.archive-phases{display:grid;gap:18px}.archive-phase{padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.035)}.archive-phase-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.archive-phase-title strong{font-size:20px}.archive-phase-title span{color:#e7c16d}.archive-banner-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.archive-banner-card{display:grid;grid-template-columns:64px 1fr;align-items:center;gap:10px;padding:9px;text-align:left;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(255,255,255,.05);color:#fff}.archive-banner-card:hover{border-color:#e7c16d;transform:translateY(-2px)}.archive-banner-card img{grid-row:1/3;width:64px;height:64px;object-fit:contain;background:rgba(255,255,255,.05);border-radius:8px}.archive-banner-card div{min-width:0}.archive-banner-card strong,.archive-banner-card small{display:block}.archive-banner-card strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.archive-banner-card small{color:#c995ff}.archive-banner-card>span{grid-column:2;color:#e7c16d;font-size:12px}.archive-four-stars{margin-top:12px;color:#adb5c3;font-size:13px}@media(max-width:900px){.archive-banner-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.archive-modal{padding:24px 14px}.archive-banner-grid{grid-template-columns:1fr}.archive-modal>h2{font-size:24px}}

.patch-label{padding:4px 8px;color:#e7c16d;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.tab-card{position:relative}.tab-badge{position:absolute;right:5px;top:5px;padding:2px 6px;border-radius:999px;background:rgba(7,10,17,.82);color:#f3d887;font-size:9px;line-height:1.4;border:1px solid rgba(231,193,109,.35)}
.apply-patch-button{width:100%;margin:0 0 10px;padding:12px 18px;border-radius:12px;background:linear-gradient(90deg,#d7ae50,#fff0b4);color:#211a0b;font-weight:800;box-shadow:0 8px 24px rgba(215,174,80,.16)}
.archive-filter-note{margin:0 0 18px;color:#aeb6c4;font-size:13px;text-align:center}

.history-filter-group{margin-top:16px}.history-filter-group>span{display:block;margin-bottom:7px;color:#9099a8;font-size:12px;letter-spacing:.08em}.history-filter-group+.history-filter-group{margin-top:10px}.history-filter-group .filter-tabs{margin:0;flex-wrap:wrap}.rarity-filter-tabs button{min-width:68px}.history-list{height:calc(100vh - 265px)}.history-item .rate-status{display:inline-flex;align-items:center;gap:5px;justify-self:end;white-space:nowrap;border-radius:999px;padding:5px 9px;font-size:12px}.history-item .rate-status span{font-size:11px}.history-item .status-won{background:rgba(87,201,137,.16);color:#86efac;border:1px solid rgba(134,239,172,.3)}.history-item .status-guaranteed{background:rgba(240,185,79,.16);color:#ffd879;border:1px solid rgba(255,216,121,.35)}.history-item .status-lost{background:rgba(239,95,95,.15);color:#ff9b9b;border:1px solid rgba(255,155,155,.3)}@media(max-width:560px){.history-drawer{padding:20px 14px}.history-list{height:calc(100vh - 290px)}.history-item{grid-template-columns:54px minmax(0,1fr)}.history-item img{width:54px;height:54px}.history-item .rate-status{grid-column:2;justify-self:start;margin-top:2px}}


/* Compact history drawer */
.history-drawer{width:min(540px,94vw);padding:20px 22px}
.history-drawer .drawer-head .eyebrow{font-size:12px;margin-bottom:2px}
.history-drawer .drawer-head h2{font-size:24px;line-height:1.15}
.history-drawer .drawer-head button{font-size:32px;line-height:1}
.history-filter-group{margin-top:11px}
.history-filter-group+.history-filter-group{margin-top:7px}
.history-filter-group>span{margin-bottom:5px;font-size:10px;letter-spacing:.06em}
.history-filter-group .filter-tabs{gap:5px}
.history-filter-group .filter-tabs button{padding:4px 9px;border-radius:999px;font-size:11px;line-height:1.25}
.rarity-filter-tabs button{min-width:48px}
.history-list{height:calc(100vh - 205px);padding-right:5px;margin-top:10px}
.history-item{grid-template-columns:46px minmax(0,1fr) auto;gap:9px;padding:7px 9px;margin-bottom:5px;border-left-width:3px;border-radius:7px}
.history-item img{width:46px;height:46px;border-radius:6px}
.history-item h3{font-size:14px;line-height:1.25;margin:0 0 2px}
.history-item h3 span{font-size:10px;letter-spacing:0}
.history-item p{font-size:11px;line-height:1.3;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.history-item small{display:block;font-size:9px;line-height:1.25}
.history-item .rate-status{gap:3px;padding:3px 6px;font-size:9px}
.history-item .rate-status span{font-size:9px}
.history-drawer .empty{margin-top:45px;font-size:13px}
@media(max-width:560px){
  .history-drawer{width:100%;padding:14px 12px}
  .history-drawer .drawer-head h2{font-size:21px}
  .history-filter-group .filter-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:100%}
  .history-filter-group .filter-tabs button{padding:5px 3px;min-width:0;font-size:10px}
  .history-list{height:calc(100vh - 190px);margin-top:8px}
  .history-item{grid-template-columns:42px minmax(0,1fr) auto;gap:7px;padding:6px 7px}
  .history-item img{width:42px;height:42px}
  .history-item h3{font-size:13px}
  .history-item p{font-size:10px}
  .history-item small{font-size:8px}
  .history-item .rate-status{grid-column:auto;justify-self:end;margin-top:0;padding:3px 5px;font-size:8px}
}

/* Fixed banner viewport + Swiper navigation */
.layout{align-items:start}
.banner-stage{height:760px;min-height:760px;max-height:760px}
.banner-tabs{height:760px;min-height:0;overflow:hidden}
.patch-label{flex:0 0 auto}
.banner-tabs-swiper{width:100%;height:calc(100% - 38px);padding:4px 12px 4px 2px}
.banner-tab-slide{height:92px!important;width:100%}
.banner-tab-slide .tab-card{display:block;width:100%;height:92px}
.banner-tabs-swiper .swiper-button-prev,.banner-tabs-swiper .swiper-button-next{left:50%;right:auto;width:30px;height:30px;margin:0;transform:translateX(-50%) rotate(90deg);border-radius:50%;background:rgba(8,12,22,.78);color:#f4dfad;box-shadow:0 4px 15px rgba(0,0,0,.35)}
.banner-tabs-swiper .swiper-button-prev{top:3px}
.banner-tabs-swiper .swiper-button-next{top:auto;bottom:3px}
.banner-tabs-swiper .swiper-button-prev:after,.banner-tabs-swiper .swiper-button-next:after,.version-picker-swiper .swiper-button-prev:after,.version-picker-swiper .swiper-button-next:after{font-size:12px;font-weight:800}
.banner-tabs-swiper .swiper-wrapper{padding:34px 0}
.version-picker{overflow:hidden;padding:0 34px}
.version-picker-swiper{width:100%;overflow:visible}
.version-slide{width:auto!important}
.version-slide button{white-space:nowrap}
.version-picker-swiper .swiper-button-prev,.version-picker-swiper .swiper-button-next{width:28px;height:28px;margin-top:-14px;border-radius:50%;background:#171d2b;color:#f4dfad;box-shadow:0 3px 12px rgba(0,0,0,.35)}
.version-picker-swiper .swiper-button-prev{left:-31px}
.version-picker-swiper .swiper-button-next{right:-31px}
@media(max-width:1100px){.banner-stage{height:720px;min-height:720px;max-height:720px}.banner-tabs{height:720px}}
@media(max-width:760px){.banner-tabs{height:auto;overflow:visible}.banner-tabs-swiper{height:auto;width:100%;padding:4px 4px 12px}.banner-tabs-swiper .swiper-wrapper{padding:0}.banner-tab-slide{width:92px!important;height:64px!important}.banner-tab-slide .tab-card{width:92px;height:64px}.banner-stage{height:760px;min-height:760px;max-height:760px}.version-picker{padding:0 30px}}

/* Balanced history sizing + compact Swiper controls */
.history-drawer{width:min(590px,95vw);padding:24px 26px}
.history-drawer .drawer-head .eyebrow{font-size:13px}
.history-drawer .drawer-head h2{font-size:27px}
.history-drawer .drawer-head button{font-size:34px}
.history-filter-group{margin-top:13px}
.history-filter-group+.history-filter-group{margin-top:9px}
.history-filter-group>span{margin-bottom:6px;font-size:11px}
.history-filter-group .filter-tabs{gap:6px}
.history-filter-group .filter-tabs button{padding:5px 11px;font-size:12px}
.rarity-filter-tabs button{min-width:54px}
.history-list{height:calc(100vh - 225px);padding-right:6px;margin-top:12px}
.history-item{grid-template-columns:54px minmax(0,1fr) auto;gap:11px;padding:9px 11px;margin-bottom:7px;border-radius:8px}
.history-item img{width:54px;height:54px;border-radius:7px}
.history-item h3{font-size:15px;line-height:1.3;margin-bottom:3px}
.history-item h3 span{font-size:11px}
.history-item p{font-size:12px;line-height:1.35;margin-bottom:2px}
.history-item small{font-size:10px;line-height:1.3}
.history-item .rate-status{gap:4px;padding:4px 8px;font-size:10px}
.history-item .rate-status span{font-size:10px}

.banner-tabs-swiper .swiper-button-prev,
.banner-tabs-swiper .swiper-button-next{
  width:22px;height:22px;
  background:rgba(8,12,22,.68);
  border:1px solid rgba(244,223,173,.28);
  box-shadow:0 2px 8px rgba(0,0,0,.3)
}
.banner-tabs-swiper .swiper-button-prev{top:7px}
.banner-tabs-swiper .swiper-button-next{bottom:7px}
.banner-tabs-swiper .swiper-wrapper{padding:31px 0}
.version-picker{padding:0 28px}
.version-picker-swiper .swiper-button-prev,
.version-picker-swiper .swiper-button-next{
  width:22px;height:22px;margin-top:-11px;
  background:rgba(23,29,43,.9);
  border:1px solid rgba(244,223,173,.24);
  box-shadow:0 2px 8px rgba(0,0,0,.3)
}
.version-picker-swiper .swiper-button-prev{left:-25px}
.version-picker-swiper .swiper-button-next{right:-25px}
.banner-tabs-swiper .swiper-button-prev:after,
.banner-tabs-swiper .swiper-button-next:after,
.version-picker-swiper .swiper-button-prev:after,
.version-picker-swiper .swiper-button-next:after{font-size:9px;font-weight:800}
.banner-tabs-swiper .swiper-button-disabled,
.version-picker-swiper .swiper-button-disabled{opacity:.2}
.banner-tabs-swiper .swiper-button-prev:hover,
.banner-tabs-swiper .swiper-button-next:hover,
.version-picker-swiper .swiper-button-prev:hover,
.version-picker-swiper .swiper-button-next:hover{background:rgba(45,52,69,.95);transform-origin:center}

@media(max-width:560px){
  .history-drawer{padding:17px 14px}
  .history-drawer .drawer-head h2{font-size:23px}
  .history-filter-group .filter-tabs button{padding:6px 4px;font-size:11px}
  .history-list{height:calc(100vh - 205px);margin-top:9px}
  .history-item{grid-template-columns:48px minmax(0,1fr) auto;gap:8px;padding:8px}
  .history-item img{width:48px;height:48px}
  .history-item h3{font-size:14px}
  .history-item p{font-size:11px}
  .history-item small{font-size:9px}
  .history-item .rate-status{font-size:9px;padding:3px 6px}
  .version-picker{padding:0 24px}
}



/* Final UI adjustments: slightly larger history text, no Swiper arrow controls */
.history-item h3{font-size:16px}
.history-item h3 span{font-size:12px}
.history-item p{font-size:13px}
.history-item small{font-size:11px}
.history-item .rate-status{font-size:11px}
.history-item .rate-status span{font-size:11px}
.banner-tabs-swiper .swiper-button-prev,
.banner-tabs-swiper .swiper-button-next,
.version-picker-swiper .swiper-button-prev,
.version-picker-swiper .swiper-button-next{display:none!important}
@media(max-width:560px){
  .history-item h3{font-size:15px}
  .history-item h3 span{font-size:11px}
  .history-item p{font-size:12px}
  .history-item small{font-size:10px}
  .history-item .rate-status{font-size:10px}
}


/* Responsive compact layout: reduce vertical scrolling on tablet and mobile */
@media (max-width: 1024px){
  .warp-page{min-height:100svh}
  .topbar{padding:14px 18px 10px}
  .topbar h1{font-size:24px}
  .eyebrow{font-size:14px}
  .top-actions{gap:7px}
  .top-actions button{padding:7px 12px;font-size:14px}
  .layout{grid-template-columns:96px minmax(0,1fr);gap:14px;padding:0 14px 18px}
  .banner-stage{height:650px;min-height:650px;max-height:650px}
  .banner-tabs{height:650px}
  .banner-tab-slide{height:76px!important}
  .banner-tab-slide .tab-card{height:76px}
  .tab-card span{display:block;font-size:11px;padding:4px 6px}
  .banner-copy{top:34px;left:28px;width:300px}
  .banner-tag{margin-left:-28px;padding:4px 15px;font-size:13px}
  .small-title{margin-top:22px;font-size:16px}
  .banner-copy h2{font-size:35px;margin:6px 0 12px}
  .description{font-size:16px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .banner-badges{margin-top:11px;gap:6px}
  .rate-badge,.details-button{font-size:12px;padding:5px 10px}
  .featured-four-preview{margin-top:9px;padding:7px}
  .featured-four-heading{margin-bottom:6px;font-size:12px}
  .featured-four-card{grid-template-columns:34px minmax(0,1fr);min-height:40px;padding:3px 5px}
  .featured-four-card img{width:34px;height:34px}
  .featured-four-card strong{font-size:10px}
  .featured-four-card small{font-size:9px}
  .pity-panel{left:18px;bottom:18px;width:min(410px,calc(100% - 390px));padding:8px 9px}
  .pity-heading{font-size:11px;margin-bottom:5px}
  .pity-card{padding:5px 7px}
  .pity-card b{font-size:19px}.pity-card strong{font-size:16px}.pity-card span{font-size:15px}.pity-card small,.pity-card p{font-size:9px}
  .warp-actions{right:18px;bottom:18px;gap:8px}
  .warp-actions button{min-width:165px;padding:8px 16px}
  .warp-actions strong{font-size:18px}.warp-actions small{font-size:10px}
}

@media (max-width: 820px){
  .topbar{padding:10px 12px 6px}
  .topbar h1{font-size:21px}
  .layout{display:block;padding:0 10px 12px}
  .banner-tabs{height:auto;margin-bottom:6px}
  .banner-tabs-swiper{height:auto;padding:2px 0 6px}
  .banner-tabs-swiper .swiper-wrapper{padding:0}
  .banner-tab-slide{width:78px!important;height:52px!important}
  .banner-tab-slide .tab-card{width:78px;height:52px}
  .tab-card span{font-size:9px;padding:2px 4px}
  .tab-card.active{transform:translateY(-2px);border-width:2px}
  .banner-stage{height:640px;min-height:640px;max-height:640px;border-radius:14px}
  .hero-character{top:-70px;width:100%;height:390px;object-position:center top;mask-image:linear-gradient(0deg,transparent 0,#000 26%);-webkit-mask-image:linear-gradient(0deg,transparent 0,#000 26%)}
  .banner-copy{top:265px;left:18px;width:calc(100% - 36px)}
  .banner-tag{margin-left:-18px;padding:3px 12px;font-size:11px}
  .small-title{margin-top:8px;font-size:13px}
  .banner-copy h2{font-size:27px;margin:3px 0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .description{font-size:13px;line-height:1.3;-webkit-line-clamp:1}
  .banner-badges{margin-top:6px}
  .rate-badge,.details-button{font-size:10px;padding:4px 8px}
  .featured-four-preview{margin-top:6px;padding:5px}
  .featured-four-heading{margin-bottom:4px;font-size:10px}
  .featured-four-heading small{display:none}
  .featured-four-list{gap:4px}
  .featured-four-card{display:flex;flex-direction:row;min-height:34px;padding:2px 4px;gap:4px}
  .featured-four-card img{width:30px;height:30px}
  .featured-four-card strong{font-size:9px}
  .featured-four-card small{display:none}
  .pity-panel{position:absolute;left:12px;right:12px;bottom:66px;width:auto;margin:0;padding:6px 7px;border-radius:10px}
  .pity-heading{display:none}
  .pity-grid{gap:5px}
  .pity-card{padding:4px 6px}
  .pity-card>div{gap:0 6px}
  .pity-card b{font-size:17px}.pity-card strong{font-size:15px}.pity-card span{font-size:13px}.pity-card small,.pity-card p{font-size:8px}
  .guarantee-row{display:none}
  .warp-actions{left:10px;right:10px;bottom:10px;gap:6px}
  .warp-actions button{min-width:0;flex:1;padding:6px 8px;border-width:2px}
  .warp-actions strong{font-size:16px}.warp-actions small{font-size:9px}
  .version-picker{padding:0;margin-bottom:4px}
  .version-slide button{padding:5px 9px;font-size:11px}
}


.result-actions{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap}
.skip-results{padding:11px 24px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(12,18,31,.88);color:#f3dfae;font-size:16px}

@media (max-width: 760px){
  .modal-backdrop{padding:0;align-items:stretch}
  .result-modal{width:100%;height:100svh;max-height:100svh;padding:12px 9px 10px;overflow:hidden;display:flex;flex-direction:column}
  .result-modal>.eyebrow{font-size:11px;margin:0}
  .result-modal>h2{font-size:20px;line-height:1.15;margin:2px 38px 7px}
  .result-modal .close{top:3px;right:9px;font-size:34px;line-height:1}
  .result-grid,.result-grid.single{flex:1;min-height:0;overflow:hidden;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:5px;margin:4px 0 8px;align-content:stretch}
  .result-grid.single{grid-template-columns:minmax(0,150px);grid-auto-rows:minmax(0,220px);justify-content:center;align-content:center}
  .result-card{min-height:0;height:100%;padding:4px 3px 5px;clip-path:polygon(0 0,90% 0,100% 9%,100% 100%,0 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
  .result-card .rarity{font-size:9px;line-height:1.1;letter-spacing:0;margin-bottom:1px}
  .result-card img{width:100%;height:min(15svh,108px);min-height:52px;object-fit:contain}
  .result-card h3{width:100%;font-size:10px;line-height:1.1;margin:2px 0 1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .result-card p{font-size:8px;line-height:1.1;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .result-card small{font-size:7px;line-height:1.1;margin-top:1px}
  .result-actions{flex:0 0 auto;gap:6px}
  .continue,.skip-results{padding:7px 13px;font-size:11px;line-height:1.2}
}

@media (max-width: 390px){
  .result-modal{padding-left:6px;padding-right:6px}
  .result-grid,.result-grid.single{gap:3px}
  .result-card{padding-left:2px;padding-right:2px}
  .result-card img{height:min(14svh,94px)}
  .result-card h3{font-size:9px}
  .result-card p{font-size:7px}
}

@media (max-width: 520px){
  .topbar{padding:8px 10px 4px}
  .topbar .eyebrow{font-size:11px}
  .topbar h1{font-size:18px}
  .top-actions button{padding:5px 8px;font-size:11px}
  .layout{padding:0 7px 8px}
  .banner-tab-slide{width:70px!important;height:46px!important}
  .banner-tab-slide .tab-card{width:70px;height:46px}
  .banner-stage{height:590px;min-height:590px;max-height:590px}
  .hero-character{top:-55px;height:330px}
  .banner-copy{top:225px;left:14px;width:calc(100% - 28px)}
  .banner-tag{margin-left:-14px}
  .banner-copy h2{font-size:23px}
  .description{display:none}
  .featured-four-card img{width:27px;height:27px}
  .featured-four-card strong{font-size:8px}
  .pity-panel{left:8px;right:8px;bottom:60px}
  .warp-actions{left:8px;right:8px;bottom:8px}
  .warp-actions strong{font-size:15px}
  .version-slide button{padding:4px 8px;font-size:10px}
}
</style>

<style>

.history-filter-group .filter-tabs button{
 font-size:14px!important;
 padding:9px 16px!important;
 min-height:40px!important;
}
.history-filter-group .filter-tabs{
 gap:10px!important;
}


/* Version picker without Swiper */
.version-picker{
  display:flex!important;
  gap:7px;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  width:100%;
  max-width:100%;
  min-width:0;
  padding:4px 2px 10px!important;
  margin-bottom:4px;
  scroll-behavior:smooth;
  overscroll-behavior-inline:contain;
  scrollbar-width:thin;
  scrollbar-color:rgba(231,193,109,.55) transparent;
  -webkit-overflow-scrolling:touch;
  touch-action:pan-x;
  cursor:grab;
}
.version-picker:active{cursor:grabbing}
.version-picker::-webkit-scrollbar{height:5px}
.version-picker::-webkit-scrollbar-track{background:transparent}
.version-picker::-webkit-scrollbar-thumb{background:rgba(231,193,109,.55);border-radius:999px}
.version-picker button{flex:0 0 auto;white-space:nowrap;scroll-snap-align:start}
.version-picker-swiper,.version-slide{display:none!important}
@media(max-width:760px){
  .version-picker{gap:6px;padding:3px 1px 8px}
  .version-picker button{min-width:50px;padding:7px 10px;font-size:12px}
}
</style>

<style scoped>
.result-backdrop{z-index:60;backdrop-filter:none}
.result-modal.reveal-mode{width:100vw;height:100svh;max-height:none;padding:0;overflow:hidden}
.fullscreen-reveal{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border:0;background:radial-gradient(circle at 50% 45%,#26344d 0,#0b101c 48%,#02040a 100%);color:#fff;cursor:pointer;text-align:center}
.reveal-aura{position:absolute;inset:-20%;opacity:.82;filter:blur(10px);animation:reveal-aura-pulse 2.2s ease-in-out infinite}
.reveal-aura.rarity-5{background:radial-gradient(circle at 50% 45%,rgba(255,207,95,.78),rgba(151,83,37,.35) 28%,transparent 62%)}
.reveal-aura.rarity-4{background:radial-gradient(circle at 50% 45%,rgba(199,137,255,.72),rgba(89,49,151,.32) 30%,transparent 62%)}
.reveal-aura.rarity-3{background:radial-gradient(circle at 50% 45%,rgba(105,180,255,.65),rgba(31,78,139,.28) 30%,transparent 62%)}
.reveal-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 20px 88px;animation:fullscreen-result-in .55s cubic-bezier(.2,.8,.2,1)}
.reveal-content:before,.reveal-content:after{content:"";position:absolute;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.55}
.reveal-content:before{top:16%}.reveal-content:after{bottom:18%}
.reveal-content.rarity-5{color:#ffd470}.reveal-content.rarity-4{color:#d3a8ff}.reveal-content.rarity-3{color:#8fc8ff}
.reveal-content img{position:relative;z-index:1;width:min(72vw,620px);height:min(63svh,680px);object-fit:contain;filter:drop-shadow(0 24px 38px rgba(0,0,0,.62))}
.reveal-stars{position:relative;z-index:2;margin-bottom:-14px;font-size:clamp(18px,3vw,32px);letter-spacing:.14em;text-shadow:0 0 14px currentColor}
.reveal-info{position:relative;z-index:2;margin-top:-18px;color:#fff;text-shadow:0 2px 14px #000}
.reveal-info p{font-size:clamp(11px,1.5vw,15px);color:#d5d9e2}
.reveal-info h2{max-width:90vw;margin:4px 0;font-size:clamp(16px,3vw,30px);line-height:1.08}
.reveal-info small{font-size:clamp(10px,1.3vw,13px);color:#f7d98c}
.reveal-progress{position:absolute;z-index:4;top:22px;left:24px;padding:7px 13px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(0,0,0,.3);font-size:14px}
.tap-next{position:absolute;z-index:4;left:50%;bottom:22px;transform:translateX(-50%);white-space:nowrap;color:#dce3ef;font-size:14px;animation:tap-next-pulse 1.4s ease-in-out infinite}
.reveal-skip{position:absolute;z-index:6;top:20px;right:22px;bottom:auto;padding:8px 18px;border:1px solid rgba(255,255,255,.5);border-radius:999px;background:rgba(3,7,14,.48);color:#fff;font-size:14px;line-height:1.2;box-shadow:none;backdrop-filter:blur(8px)}
.result-modal.overview-mode{width:min(1320px,94vw);max-height:94vh;overflow:auto;padding:35px;text-align:center}
@keyframes fullscreen-result-in{from{opacity:0;transform:scale(1.08);filter:blur(10px)}to{opacity:1;transform:none;filter:none}}
@keyframes reveal-aura-pulse{50%{transform:scale(1.06);opacity:1}}
@keyframes tap-next-pulse{50%{opacity:.48}}
@media(max-width:760px){
  .result-modal.reveal-mode{width:100%;height:100svh;padding:0}
  .reveal-content{padding:42px 10px 72px}
  .reveal-content img{width:92vw;height:61svh}
  .reveal-stars{margin-bottom:-4px;font-size:19px}
  .reveal-info{margin-top:-8px}
  .reveal-info h2{font-size:23px}
  .reveal-info p{font-size:10px}
  .reveal-progress{top:12px;left:12px;padding:5px 10px;font-size:12px}
  .reveal-skip{top:12px;right:12px;bottom:auto;padding:7px 14px;font-size:12px}
  .tap-next{bottom:18px;font-size:11px}
  .result-modal.overview-mode{width:100%;height:100svh;max-height:100svh;padding:12px 9px 10px;overflow:hidden;display:flex;flex-direction:column}
}
@media(prefers-reduced-motion:reduce){.reveal-content,.reveal-aura,.tap-next{animation:none!important}}


/* StarRailRes-backed character reveal */
.reveal-content{justify-content:flex-end;padding:0;overflow:hidden}
.reveal-content:before,.reveal-content:after{display:none}
.reveal-portrait{position:absolute;z-index:1;display:block;object-fit:contain;filter:drop-shadow(0 20px 34px rgba(0,0,0,.5))}
.reveal-portrait.character {
    bottom: -30%;
    width: auto;
    height: 150%;
    max-width: none;
    max-height: none;
    object-fit: contain;
    object-position: center bottom;
}
.reveal-portrait.light-cone{width:min(50vw,500px);height:min(63svh,680px);}
.reveal-character-overlay{position:absolute;z-index:3;left:clamp(18px,5vw,72px);top:clamp(76px,12svh,150px);max-width:min(70vw,520px);color:#fff;text-align:left;text-shadow:0 2px 12px rgba(0,0,0,.9)}
.reveal-character-overlay .reveal-stars{margin:0 0 10px;color:#f4c84a;font-size:clamp(22px,3.5vw,38px);letter-spacing:.08em;text-shadow:none}
.reveal-meta-row{display:flex;align-items:center;gap:10px;margin-top:8px;font-weight:700}
.reveal-meta-row img{position:static;z-index:auto;width:clamp(28px,4vw,44px);height:clamp(28px,4vw,44px);object-fit:contain;filter:none;transform:none}
.reveal-character-name{font-size:clamp(24px,4vw,46px);line-height:1.05}
.reveal-character-path{font-size:clamp(16px,2vw,23px);font-weight:600}
.reveal-info{position:absolute;z-index:3;left:50%;bottom:12svh;transform:translateX(-50%);margin:0}
.reveal-info .reveal-stars{color:#f4c84a;text-shadow:none}
@media(max-width:760px){
  .reveal-portrait.character{bottom:-2svh;height:124svh}
  .reveal-character-overlay{left:18px;top:76px;max-width:76vw}
  .reveal-character-overlay .reveal-stars{font-size:22px;margin-bottom:8px}
  .reveal-character-name{font-size:27px}
  .reveal-character-path{font-size:16px}
  .reveal-meta-row img{width:31px;height:31px}
}


/* 5-star intro: path emblem behind five gold stars */
.five-star-path-intro{
  position:absolute;
  z-index:3;
  inset:0;
  display:grid;
  place-items:center;
  overflow:hidden;
  background:radial-gradient(circle at 50% 55%,rgba(21,38,72,.72),rgba(2,4,9,.98) 58%,#000 100%);
  animation:five-star-intro-in .55s cubic-bezier(.2,.8,.2,1);
}
.five-star-path-icon{
  position:absolute;
  left:50%;
  top:50%;
  width:min(32vw,360px);
  height:min(32vw,360px);
  transform:translate(-50%,-50%);
  object-fit:contain;
  opacity:.26;
  filter:grayscale(1) brightness(.6) drop-shadow(0 0 30px rgba(255,214,112,.18));
}
.five-star-intro-stars{
  position:relative;
  z-index:2;
  color:#ffe18a;
  font-size:clamp(48px,8vw,104px);
  line-height:1;
  letter-spacing:.08em;
  text-shadow:0 0 12px rgba(255,225,138,.85),0 0 38px rgba(255,193,60,.45);
  animation:five-star-stars-in .7s cubic-bezier(.16,.8,.2,1) both;
}
@keyframes five-star-intro-in{
  from{opacity:0;filter:blur(10px)}
  to{opacity:1;filter:none}
}
@keyframes five-star-stars-in{
  0%{opacity:0;transform:scale(.45)}
  65%{opacity:1;transform:scale(1.08)}
  100%{transform:scale(1)}
}

/* Keep Light Cone smaller and truly centered in the viewport. */
.reveal-portrait.light-cone{
  bottom:auto;
  width:min(34vw,380px);
  height:min(52svh,560px);
  transform:translate(-0%,-50%);
  object-position:center center;
}
@media(max-width:760px){
  .five-star-path-icon{width:min(62vw,280px);height:min(62vw,280px)}
  .five-star-intro-stars{font-size:clamp(42px,13vw,68px)}
  .reveal-portrait.light-cone{width:min(58vw,290px);height:min(48svh,470px)}
}
@media(prefers-reduced-motion:reduce){
  .five-star-path-intro,.five-star-intro-stars{animation:none!important}
}
</style>
