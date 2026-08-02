export const POOL_CONFIGS = {
  character: {
    id: 'character',
    label: 'กิจกรรมวาร์ปตัวละคร',
    hardPity5: 90,
    baseRate5: 0.006,
    softPityStart: 74,
    softPityStep: 0.06,
    featuredRate5: 0.5,
    featuredRate4: 0.5,
  },
  lightCone: {
    id: 'lightCone',
    label: 'กิจกรรมวาร์ป Light Cone',
    hardPity5: 80,
    baseRate5: 0.008,
    softPityStart: 66,
    softPityStep: 0.07,
    featuredRate5: 0.75,
    featuredRate4: 0.75,
  },
  standard: {
    id: 'standard',
    label: 'Stellar Warp',
    hardPity5: 90,
    baseRate5: 0.006,
    softPityStart: 74,
    softPityStep: 0.06,
    featuredRate5: 0,
    featuredRate4: 0,
  },
}

export function createDefaultPoolState() {
  return {
    pullsSince5: 0,
    pullsSince4: 0,
    guaranteedFeatured5: false,
    guaranteedFeatured4: false,
    totalPulls: 0,
  }
}

export function getFiveStarRate(config, nextPity) {
  if (nextPity >= config.hardPity5) return 1
  if (nextPity < config.softPityStart) return config.baseRate5
  return Math.min(1, config.baseRate5 + (nextPity - config.softPityStart + 1) * config.softPityStep)
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function resolveFiveStar(config, state, pool) {
  if (config.id === 'standard') {
    return { ...randomItem(pool.standard5), featured: false, rateUpStatus: null }
  }

  const wasGuaranteed = state.guaranteedFeatured5
  const featured = wasGuaranteed || Math.random() < config.featuredRate5
  state.guaranteedFeatured5 = !featured

  return {
    ...(featured ? pool.featured5 : randomItem(pool.standard5)),
    featured,
    rateUpStatus: featured ? (wasGuaranteed ? 'guaranteed' : 'won') : 'lost',
  }
}

function resolveFourStar(config, state, pool) {
  const featured4 = Array.isArray(pool.featured4) ? pool.featured4.filter(Boolean) : []
  const standard4 = Array.isArray(pool.standard4) ? pool.standard4.filter(Boolean) : []

  // ตู้ถาวรและตู้ Collaboration ไม่มี 4★ Rate Up
  // จึงสุ่มจาก Pool ปกติเท่านั้น และไม่สร้างสถานะชนะ/หลุดเรท/การันตี 4★
  if (config.id === 'standard' || featured4.length === 0) {
    state.guaranteedFeatured4 = false
    return { ...randomItem(standard4), featured: false, rateUpStatus: null }
  }

  const wasGuaranteed = state.guaranteedFeatured4
  const featured = wasGuaranteed || Math.random() < config.featuredRate4
  state.guaranteedFeatured4 = !featured

  return {
    ...(featured ? randomItem(featured4) : randomItem(standard4)),
    featured,
    rateUpStatus: featured ? (wasGuaranteed ? 'guaranteed' : 'won') : 'lost',
  }
}

export function performSingleWarp(config, sourceState, pool) {
  const state = { ...sourceState }
  const nextPity5 = state.pullsSince5 + 1
  const nextPity4 = state.pullsSince4 + 1
  const rarity5 = Math.random() < getFiveStarRate(config, nextPity5)
  const rarity4 = !rarity5 && (nextPity4 >= 10 || Math.random() < 0.051)

  let item
  let rarity

  if (rarity5) {
    rarity = 5
    item = resolveFiveStar(config, state, pool)
    state.pullsSince5 = 0
    state.pullsSince4 = 0
  } else if (rarity4) {
    rarity = 4
    item = resolveFourStar(config, state, pool)
    state.pullsSince5 += 1
    state.pullsSince4 = 0
  } else {
    rarity = 3
    item = { ...randomItem(pool.standard3), featured: false }
    state.pullsSince5 += 1
    state.pullsSince4 += 1
  }

  state.totalPulls += 1

  return {
    state,
    result: {
      ...item,
      rarity,
      pullNumber: state.totalPulls,
      pity5: rarity === 5 ? nextPity5 : null,
      createdAt: new Date().toISOString(),
    },
  }
}

export function performWarps(config, sourceState, pool, count = 1) {
  let state = { ...sourceState }
  const results = []

  for (let index = 0; index < count; index += 1) {
    const warp = performSingleWarp(config, state, pool)
    state = warp.state
    results.push(warp.result)
  }

  return { state, results }
}
