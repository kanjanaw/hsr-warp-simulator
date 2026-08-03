const RAW_BASE = 'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/'
const INDEX_BASE = `${RAW_BASE}index_min/th/`

let resourcePromise = null
let resourceCache = {
  characters: {},
  paths: {},
  elements: {},
  lightCones: {},
}

function toRecord(value) {
  if (!value) return {}
  if (Array.isArray(value)) {
    return Object.fromEntries(value.filter(Boolean).map(item => [String(item.id), item]))
  }
  return value
}

async function fetchJson(file) {
  const response = await fetch(`${INDEX_BASE}${file}`, { cache: 'force-cache' })
  if (!response.ok) throw new Error(`StarRailRes ${file}: ${response.status}`)
  return response.json()
}

export function assetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${RAW_BASE}${String(path).replace(/^\/+/, '')}`
}

export async function loadStarRailResources() {
  if (!resourcePromise) {
    resourcePromise = Promise.all([
      fetchJson('characters.json'),
      fetchJson('paths.json'),
      fetchJson('elements.json'),
      fetchJson('light_cones.json'),
    ]).then(([characters, paths, elements, lightCones]) => {
      resourceCache = {
        characters: toRecord(characters),
        paths: toRecord(paths),
        elements: toRecord(elements),
        lightCones: toRecord(lightCones),
      }
      return resourceCache
    }).catch(error => {
      resourcePromise = null
      throw error
    })
  }
  return resourcePromise
}

export function getStarRailResources() {
  return resourceCache
}

export function getCharacterResource(characterId) {
  return resourceCache.characters[String(characterId)] || null
}

function resolveIndexedValue(value, dictionary) {
  if (!value) return null
  if (typeof value === 'object') return value
  return dictionary[String(value)] || { id: String(value), name: String(value) }
}


export function getLightConeResource(lightConeId) {
  return resourceCache.lightCones[String(lightConeId)] || null
}

export function resolveLightConeMeta(lightConeId, fallback = {}) {
  const lightCone = getLightConeResource(lightConeId)
  if (!lightCone) return null

  const path = resolveIndexedValue(lightCone.path, resourceCache.paths)

  return {
    id: String(lightCone.id ?? lightConeId),
    name: lightCone.name || fallback.name || '',
    rarity: Number(lightCone.rarity || fallback.rarity || 3),
    portrait: assetUrl(lightCone.portrait || lightCone.preview || fallback.portrait),
    icon: assetUrl(lightCone.icon || fallback.icon),
    path: {
      id: path?.id || lightCone.path || '',
      name: path?.name || fallback.pathName || '',
      icon: assetUrl(path?.icon || fallback.pathIcon),
    },
  }
}

export function resolveCharacterMeta(characterId, fallback = {}) {
  const character = getCharacterResource(characterId)
  if (!character) return null

  const path = resolveIndexedValue(character.path, resourceCache.paths)
  const element = resolveIndexedValue(character.element, resourceCache.elements)

  return {
    id: String(character.id ?? characterId),
    name: character.name || fallback.name || '',
    rarity: Number(character.rarity || fallback.rarity || 4),
    portrait: assetUrl(character.portrait || character.preview || fallback.portrait),
    icon: assetUrl(character.icon || fallback.icon),
    path: {
      id: path?.id || character.path || '',
      name: path?.name || fallback.pathName || '',
      icon: assetUrl(path?.icon || fallback.pathIcon),
    },
    element: {
      id: element?.id || character.element || '',
      name: element?.name || fallback.elementName || '',
      icon: assetUrl(element?.icon || fallback.elementIcon),
    },
  }
}
