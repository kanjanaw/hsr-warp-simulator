const BASE = 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master'

const rows = [
  ['Seele','Seele',1102,'In the Night',23001],
  ['Jing Yuan','Jing Yuan',1204,'Before Dawn',23010],
  ['Silver Wolf','Silver Wolf',1006,'Incessant Rain',23007],
  ['Luocha','Luocha',1203,'Echoes of the Coffin',23008],
  ['Blade','Blade',1205,'The Unreachable Side',23009],
  ['Kafka','Kafka',1005,'Patience Is All You Need',23006],
  ['Dan Heng • Imbibitor Lunae','จ้าวยลจันทรา',1213,'Brighter Than the Sun',23015],
  ['Fu Xuan','Fu Xuan',1208,'She Already Shut Her Eyes',23011],
  ['Jingliu','Jingliu',1212,'I Shall Be My Own Sword',23014],
  ['Topaz & Numby','Topaz & Numby',1112,'Worrisome, Blissful',23016],
  ['Huohuo','Huohuo',1217,'Night of Fright',23017],
  ['Argenti','Argenti',1302,'An Instant Before A Gaze',23018],
  ['Ruan Mei','Ruan Mei',1303,'Past Self in Mirror',23019],
  ['Dr. Ratio','Dr. Ratio',1305,'Baptism of Pure Thought',23020],
  ['Black Swan','Black Swan',1307,'Reforged Remembrance',23022],
  ['Sparkle','Sparkle',1306,'Earthly Escapade',23021],
  ['Acheron','Acheron',1308,'Along the Passing Shore',23024],
  ['Aventurine','Aventurine',1304,'Inherently Unjust Destiny',23023],
  ['Robin','Robin',1309,'Flowing Nightglow',23026],
  ['Boothill','Boothill',1315,'Sailing Towards A Second Life',23027],
  ['Firefly','Firefly',1310,'Whereabouts Should Dreams Rest',23025],
  ['Jade','Jade',1314,'Yet Hope Is Priceless',23028],
  ['Yunli','Yunli',1221,'Dance at Sunset',23030],
  ['Jiaoqiu','Jiaoqiu',1218,'Those Many Springs',23029],
  ['Feixiao','Feixiao',1220,'I Venture Forth to Hunt',23031],
  ['Lingsha','Lingsha',1222,'Scent Alone Stays True',23032],
  ['Rappa','Rappa',1317,'Ninjutsu Inscription: Dazzling Evilbreaker',23033],
  ['Sunday','Sunday',1313,'A Grounded Ascent',23034],
  ['Fugue','ผู้จากจรลืมหวน',1225,'Long Road Leads Home',23035],
  ['The Herta','ท่าน Herta',1401,'Into the Unreachable Veil',23037],
  ['Aglaea','Aglaea',1402,'Time Woven Into Gold',23036],
  ['Tribbie','Tribbie',1403,'If Time Were a Flower',23038],
  ['Mydei','Mydei',1404,'Flame of Blood, Blaze My Path',23039],
  ['Castorice','Castorice',1407,'Make Farewells More Beautiful',23040],
  ['Anaxa','Anaxa',1405,'Life Should Be Cast to Flames',23041],
  ['Hyacine','Hyacine',1409,'Long May Rainbows Adorn the Sky',23042],
  ['Cipher','Cipher',1406,'Lies Dance on the Breeze',23043],
  ['Phainon','Phainon',1408,'Thus Burns the Dawn',23044],
  ['Saber','Saber',1014,'A Thankless Coronation',23045],
  ['Archer','Archer',1015,'The Hell Where Ideals Burn',23046],
  ['Hysilens','Hysilens',1410,'Why Does the Ocean Sing',23047],
  ['Cerydra','Cerydra',1412,'Epoch Etched in Golden Blood',23048],
  ['Evernight','Evernight',1413,"To Evernight's Stars",23049],
  ['Dan Heng • Permansor Terrae','Dan Heng - จ้าวทระนงคงปฐพี',1414,'Though Worlds Apart',23051],
  ['Cyrene','Cyrene',1415,'This Love, Forever',23052],
  ['The Dahlia','ดอกดาห์เลีย',1321,'Never Forget Her Flame',23050],
  ['Yao Guang','Yao Guang',1502,'When She Decided to See',23054],
  ['Sparxie','Sparxie',1501,'Dazzled by a Flowery World',23053],
  ['Ashveil','Ashveil',1504,'The Finale of a Lie',23056],
  ['Silver Wolf LV.999','Silver Wolf LV.999',1506,'Welcome to the Cosmic City',23057],
  ['Evanescia','Evanescia',1505,'Until the Flowers Bloom Again',23058],
  ['Mortenax Blade','ผู้ฝ่าบ่วงมฤตยู Blade',1507,'Reforged in Hellfire',23059],
  ['Himeko • Nova','Himeko - นวดารา',1510,'A Star That Lights the Night',23060],
  ['Rin Tohsaka','Rin Tohsaka',1508,'Flickering Stars',23061],
  ['Gilgamesh','Gilgamesh',1509,'I Am As You Behold',23062],
]

const characterMeta = {
  'Seele':['Quantum','The Hunt'],'Jing Yuan':['Lightning','Erudition'],'Silver Wolf':['Quantum','Nihility'],
  'Luocha':['Imaginary','Abundance'],'Blade':['Wind','Destruction'],'Kafka':['Lightning','Nihility'],
  'Dan Heng • Imbibitor Lunae':['Imaginary','Destruction'],'Fu Xuan':['Quantum','Preservation'],
  'Jingliu':['Ice','Destruction'],'Topaz & Numby':['Fire','The Hunt'],'Huohuo':['Wind','Abundance'],
  'Argenti':['Physical','Erudition'],'Ruan Mei':['Ice','Harmony'],'Dr. Ratio':['Imaginary','The Hunt'],
  'Black Swan':['Wind','Nihility'],'Sparkle':['Quantum','Harmony'],'Acheron':['Lightning','Nihility'],
  'Aventurine':['Imaginary','Preservation'],'Robin':['Physical','Harmony'],'Boothill':['Physical','The Hunt'],
  'Firefly':['Fire','Destruction'],'Jade':['Quantum','Erudition'],'Yunli':['Physical','Destruction'],
  'Jiaoqiu':['Fire','Nihility'],'Feixiao':['Wind','The Hunt'],'Lingsha':['Fire','Abundance'],
  'Rappa':['Imaginary','Erudition'],'Sunday':['Imaginary','Harmony'],'Fugue':['Fire','Nihility'],
  'The Herta':['Ice','Erudition'],'Aglaea':['Lightning','Remembrance'],'Tribbie':['Quantum','Harmony'],
  'Mydei':['Imaginary','Destruction'],'Castorice':['Quantum','Remembrance'],'Anaxa':['Wind','Erudition'],
  'Hyacine':['Wind','Remembrance'],'Cipher':['Quantum','Nihility'],'Phainon':['Physical','Destruction'],
  'Saber':['Wind','Destruction'],'Archer':['Quantum','The Hunt'],'Hysilens':['Physical','Nihility'],
  'Cerydra':['Wind','Harmony'],'Evernight':['Ice','Remembrance'],'Dan Heng • Permansor Terrae':['Physical','Preservation'],
  'Cyrene':['Ice','Remembrance'],'Yao Guang':['Physical','Elation'],'Sparxie':['Fire','Elation'],
  'Ashveil':['Fire','Nihility'],'Silver Wolf LV.999':['Quantum','Elation'],'Evanescia':['Physical','Elation'],
  'Mortenax Blade':['Fire','Nihility'],'Himeko • Nova':['Fire','Erudition'],
  'Rin Tohsaka':['Fire','Harmony'],'Gilgamesh':['Imaginary','Erudition'],'The Dahlia':['Fire','Nihility'],
}

export const FIVE_STAR_CHARACTERS = Object.fromEntries(rows.map(([key, displayName, id, lightConeName, lightConeId]) => {
  const [element = '', path = ''] = characterMeta[key] || []
  return [key, {
    key,
    id: String(id),
    name: displayName,
    internalName: key,
    rarity: 5,
    kind: 'ตัวละคร',
    element,
    path,
    image: `${BASE}/icon/character/${id}.png`,
    portrait: `${BASE}/image/character_portrait/${id}.png`,
    lightConeId: String(lightConeId),
    lightConeName,
  }]
}))

export const FIVE_STAR_LIGHT_CONES = Object.fromEntries(rows.map(([key, , , lightConeName, lightConeId]) => [String(lightConeId), {
  id: String(lightConeId),
  name: lightConeName,
  rarity: 5,
  kind: 'Light Cone',
  characterKey: key,
  image: `${BASE}/icon/light_cone/${lightConeId}.png`,
  portrait: `${BASE}/image/light_cone_portrait/${lightConeId}.png`,
}]))

const aliasMap = new Map()
for (const character of Object.values(FIVE_STAR_CHARACTERS)) {
  aliasMap.set(character.key, character.key)
  aliasMap.set(character.name, character.key)
}
aliasMap.set('จ้าวยลจันทรา', 'Dan Heng • Imbibitor Lunae')
aliasMap.set('ผู้จากจรลืมหวน', 'Fugue')
aliasMap.set('ท่าน Herta', 'The Herta')
aliasMap.set('ดอกดาห์เลีย', 'The Dahlia')
aliasMap.set('Dan Heng - จ้าวทระนงคงปฐพี', 'Dan Heng • Permansor Terrae')
aliasMap.set('ผู้ฝ่าบ่วงมฤตยู Blade', 'Mortenax Blade')
aliasMap.set('Himeko - นวดารา', 'Himeko • Nova')
aliasMap.set('Sabar', 'Saber')

export function getCharacter(value) {
  const key = aliasMap.get(value) || value
  return FIVE_STAR_CHARACTERS[key] || null
}

export function getSignatureLightCone(value) {
  const character = getCharacter(value)
  return character ? FIVE_STAR_LIGHT_CONES[character.lightConeId] || null : null
}

export function createCharacterItem(value) {
  const character = getCharacter(value)
  if (!character) return {
    id: `archive-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: String(value), kind: 'ตัวละคร', element: '', path: '', image: '/favicon.svg', portrait: '/favicon.svg',
  }
  return {
    ...character,
    id: `character-${character.id}`,
    sourceId: character.id,
  }
}

export function createSignatureLightConeItem(value) {
  const character = getCharacter(value)
  const cone = getSignatureLightCone(value)
  if (!character || !cone) return null
  return {
    ...cone,
    id: `light-cone-${cone.id}`,
    sourceId: cone.id,
    characterName: character.name,
    characterKey: character.key,
  }
}

export const MASTER_DATA_VERSION = '3.0.0'
