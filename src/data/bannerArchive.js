import { createCharacterItem, createSignatureLightConeItem } from './masterData.js'

const BASE = 'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master'

export const FOUR_STAR_DEBUT_VERSIONS = {
  'March 7th':'1.0','Dan Heng':'1.0','Arlan':'1.0','Asta':'1.0','Herta':'1.0','Natasha':'1.0','Pela':'1.0',
  'Sampo':'1.0','Hook':'1.0','Serval':'1.0','Qingque':'1.0','Tingyun':'1.0','Sushang':'1.0',
  'Yukong':'1.1','Luka':'1.2','Lynx':'1.3','Guinaifen':'1.4','Hanya':'1.5','Xueyi':'1.6',
  'Misha':'2.0','Gallagher':'2.1','Moze':'2.5',
}

const fourStarIds = {
  'March 7th':'1001','Dan Heng':'1002','Arlan':'1008','Asta':'1009','Herta':'1013','Natasha':'1105','Pela':'1106',
  'Sampo':'1108','Hook':'1109','Lynx':'1110','Luka':'1111','Serval':'1103','Qingque':'1201','Tingyun':'1202',
  'Sushang':'1206','Yukong':'1207','Guinaifen':'1210','Xueyi':'1214','Hanya':'1215','Misha':'1312','Gallagher':'1301','Moze':'1223'
}

export function characterItem(name) {
  return createCharacterItem(name)
}

export function fourStarItem(name) {
  const id = fourStarIds[name]
  return {
    id: `archive-4-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    sourceId: id || '',
    name,
    kind: 'ตัวละคร',
    debutVersion: FOUR_STAR_DEBUT_VERSIONS[name] || '1.0',
    image: id ? `${BASE}/icon/character/${id}.png` : '/favicon.svg',
  }
}

export function signatureLightConeItem(characterName) {
  return createSignatureLightConeItem(characterName)
}

/**
 * A phase keeps the source columns separate so the UI can label new and rerun
 * banners correctly without guessing from first appearance.
 */
const p = (phase, newFiveStars = [], reruns = [], fourStars = [], collabs = []) => ({
  phase,
  newFiveStars,
  reruns,
  collabs,
  fourStars,
  fiveStars: [...newFiveStars, ...reruns, ...collabs],
})

export const BANNER_ARCHIVE = [
  { version:'1.0', phases:[
    p('Phase 1',['Seele'],[],['Natasha','Hook','Pela']),
    p('Phase 2',['Jing Yuan'],[],['Sushang','March 7th','Tingyun']),
  ]},
  { version:'1.1', phases:[
    p('Phase 1',['Silver Wolf'],[],['Dan Heng','Asta','Serval']),
    p('Phase 2',['Luocha'],[],['Pela','Qingque','Yukong']),
  ]},
  { version:'1.2', phases:[
    p('Phase 1',['Blade'],[],['Arlan','Sushang','Natasha']),
    p('Phase 2',['Kafka'],[],['Luka','Sampo','Serval']),
  ]},
  { version:'1.3', phases:[
    p('Phase 1',['Dan Heng • Imbibitor Lunae'],[],['Yukong','Asta','March 7th']),
    p('Phase 2',['Fu Xuan'],[],['Lynx','Hook','Pela']),
  ]},
  { version:'1.4', phases:[
    p('Phase 1',['Jingliu'],[],['Tingyun','Qingque','Sampo']),
    p('Phase 2',['Topaz & Numby'],['Seele'],['Guinaifen','Luka','Sushang']),
  ]},
  { version:'1.5', phases:[
    p('Phase 1',['Huohuo'],[],['Dan Heng','Arlan','Sushang']),
    p('Phase 2',['Argenti'],['Silver Wolf'],['Hanya','Lynx','Asta']),
  ]},
  { version:'1.6', phases:[
    p('Phase 1',['Ruan Mei'],['Blade'],['Xueyi','March 7th','Tingyun']),
    p('Phase 2',['Dr. Ratio'],['Kafka'],['Sushang','Natasha','Hook']),
  ]},
  { version:'2.0', phases:[
    p('Phase 1',['Black Swan'],['Dan Heng • Imbibitor Lunae'],['Misha','Tingyun','Guinaifen']),
    p('Phase 2',['Sparkle'],['Jing Yuan'],['Sampo','Qingque','Hanya']),
  ]},
  { version:'2.1', phases:[
    p('Phase 1',['Acheron'],['Luocha'],['Dan Heng','Pela','Gallagher']),
    p('Phase 2',['Aventurine'],['Jingliu'],['Serval','Luka','Lynx']),
  ]},
  { version:'2.2', phases:[
    p('Phase 1',['Robin'],['Topaz & Numby'],['March 7th','Hanya','Xueyi']),
    p('Phase 2',['Boothill'],['Fu Xuan'],['Pela','Luka','Hook']),
  ]},
  { version:'2.3', phases:[
    p('Phase 1',['Firefly'],['Ruan Mei'],['Xueyi','Gallagher','Misha']),
    p('Phase 2',['Jade'],['Argenti'],['Asta','Serval','Natasha']),
  ]},
  { version:'2.4', phases:[
    p('Phase 1',['Yunli'],['Huohuo'],['Lynx','Yukong','Hanya']),
    p('Phase 2',['Jiaoqiu'],['Sparkle'],['Arlan','Hook','Guinaifen']),
  ]},
  { version:'2.5', phases:[
    p('Phase 1',['Feixiao'],['Kafka','Black Swan','Robin'],['Asta','Luka','Moze']),
    p('Phase 2',['Lingsha'],['Topaz & Numby'],['Natasha','Guinaifen','Misha']),
  ]},
  { version:'2.6', phases:[
    p('Phase 1',['Rappa'],['Dan Heng • Imbibitor Lunae'],['Xueyi','Lynx','Yukong']),
    p('Phase 2',[],['Acheron','Aventurine'],['Sampo','Pela','March 7th']),
  ]},
  { version:'2.7', phases:[
    p('Phase 1',['Sunday'],['Jing Yuan'],['Tingyun','Qingque','Arlan']),
    p('Phase 2',['Fugue'],['Firefly'],['Gallagher','Misha','Yukong']),
  ]},
  { version:'3.0', phases:[
    p('Phase 1',['The Herta'],['Feixiao','Lingsha','Jade'],['Moze','Natasha','Asta']),
    p('Phase 2',['Aglaea'],['Boothill','Robin','Silver Wolf'],['Hanya','Tingyun','Sushang']),
  ]},
  { version:'3.1', phases:[
    p('Phase 1',['Tribbie'],['Yunli'],['Guinaifen','Lynx','Hook']),
    p('Phase 2',['Mydei'],['Huohuo'],['Xueyi','Natasha','Arlan']),
  ]},
  { version:'3.2', phases:[
    p('Phase 1',['Castorice'],['Fugue','Jiaoqiu','Acheron'],['Pela','Lynx','Gallagher']),
    p('Phase 2',['Anaxa'],['Dr. Ratio'],['Serval','Dan Heng','Moze']),
  ]},
  { version:'3.3', phases:[
    p('Phase 1',['Hyacine'],['The Herta'],['Misha','Serval','Natasha']),
    p('Phase 2',['Cipher'],['Aglaea'],['Qingque','Xueyi','Sushang']),
  ]},
  { version:'3.4', phases:[
    p('Phase 1',['Phainon'],['Tribbie','Sunday','Sparkle'],['Tingyun','March 7th','Yukong'],['Saber','Archer']),
    p('Phase 2',[],['Firefly','Jingliu','Blade'],['Hanya','Lynx','Luka'],['Saber','Archer']),
  ]},
  { version:'3.5', phases:[
    p('Phase 1',['Hysilens'],['Kafka'],['Asta','Arlan','Hook'],['Saber','Archer']),
    p('Phase 2',['Cerydra'],['Silver Wolf'],['Sampo','Qingque','Dan Heng'],['Saber','Archer']),
  ]},
  { version:'3.6', phases:[
    p('Phase 1',['Evernight'],['The Herta'],['Misha','Guinaifen','Misha'],['Saber','Archer']),
    p('Phase 2',['Dan Heng • Permansor Terrae'],['Anaxa'],['Sushang','Hanya','Serval'],['Saber','Archer']),
  ]},
  { version:'3.7', phases:[
    p('Phase 1',['Cyrene'],['Hyacine','Castorice','Tribbie'],['Moze','Lynx','Pela'],['Saber','Archer']),
    p('Phase 2',['Cyrene'],['Phainon','Cipher','Mydei'],['Moze','Lynx','Pela'],['Saber','Archer']),
  ]},
  { version:'3.8', phases:[
    p('Phase 1',['The Dahlia'],['Firefly'],['Gallagher','Luka','March 7th'],['Saber','Archer']),
    p('Phase 2',[],['Fugue','Lingsha'],['Sampo','Natasha','Arlan'],['Saber','Archer']),
    p('Phase 3',[],['Aglaea','Sunday'],['Tingyun','Yukong','Dan Heng'],['Saber','Archer']),
  ]},
  { version:'4.0', phases:[
    p('Phase 1',['Yao Guang'],['Evernight','Hysilens','Black Swan'],['Pela','Hanya','Qingque'],['Saber','Archer']),
    p('Phase 2',['Sparxie','Yao Guang'],['Cerydra','Rappa','Sparkle'],['Pela','Hanya','Qingque'],['Saber','Archer']),
  ]},
  { version:'4.1', phases:[
    p('Phase 1',['Ashveil'],['Hyacine'],['Moze','Misha','Asta'],['Saber','Archer']),
    p('Phase 2',['Ashveil'],['Boothill'],['Moze','Misha','Asta'],['Saber','Archer']),
  ]},
  { version:'4.2', phases:[
    p('Phase 1',['Silver Wolf LV.999'],['The Dahlia','Castorice','Firefly'],['Gallagher','Xueyi','Hook'],['Saber','Archer']),
    p('Phase 2',['Evanescia'],['Tribbie','Sunday','Feixiao'],['Guinaifen','Lynx','Sushang'],['Saber','Archer']),
  ]},
  { version:'4.3', phases:[
    p('Phase 1',['Mortenax Blade'],['Yao Guang'],['Sampo','Luka','Tingyun'],['Saber','Archer']),
    p('Phase 2',[],['Cyrene','Phainon'],['March 7th','Arlan','Yukong'],['Saber','Archer']),
  ]},
  { version:'4.4', phases:[
    p('Phase 1',['Himeko • Nova'],['Sparxie','Dan Heng • Permansor Terrae','Evernight'],['Moze','Hanya','Serval'],['Saber','Archer','Rin Tohsaka','Gilgamesh']),
    p('Phase 2',['Himeko • Nova'],['Cerydra','Anaxa','Aventurine'],['Moze','Hanya','Serval'],['Saber','Archer','Rin Tohsaka','Gilgamesh']),
  ]},
]
