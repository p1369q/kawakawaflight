import type { BuildPartId, BuiltPart, CurrentPlane, DigCell, MaterialId, MissionState2, PartCategory, PlaneStats2, SaveData } from '../types/game.js';

export const materials:Record<MaterialId,{name:string;icon:string;description:string;uses:string;rare?:boolean}>={
  wood:{name:'木材',icon:'wood',description:'どうたいとつばさの土台になるよ',uses:'どうたい・つばさ'},
  metal:{name:'金属',icon:'metal',description:'つよい部品を作れるよ',uses:'どうたい・エンジン・タイヤ'},
  screw:{name:'ねじ',icon:'screw',description:'部品をしっかり止めるよ',uses:'全部品'},
  cloth:{name:'布',icon:'cloth',description:'つばさやしっぽに使う軽い材料',uses:'つばさ・しっぽ'},
  propeller:{name:'プロペラ部品',icon:'propeller',description:'風を作って前へ進むよ',uses:'プロペラ'},
  engine:{name:'エンジン部品',icon:'engine',description:'飛行機をぐんぐん動かすよ',uses:'エンジン'},
  lightMetal:{name:'けいりょう金属',icon:'lightMetal',description:'軽くてはやいレア材料',uses:'軽い部品',rare:true},
  strongWing:{name:'じょうぶな羽根材',icon:'strongWing',description:'長く飛べるレア材料',uses:'つばさ・しっぽ',rare:true}
};
export const materialIds=Object.keys(materials) as MaterialId[];
export const emptyMaterials=()=>Object.fromEntries(materialIds.map(id=>[id,0])) as Record<MaterialId,number>;
export const partCatalog:Record<BuildPartId,BuiltPart>={
  lightBody:{id:'lightBody',category:'body',name:'かるいどうたい',recipe:{wood:2,screw:1},stats:{speed:2,straight:1,tough:0,endurance:1},description:'かるくてよく進む'},
  strongBody:{id:'strongBody',category:'body',name:'じょうぶなどうたい',recipe:{metal:2,screw:2},stats:{speed:0,straight:1,tough:3,endurance:0},description:'ぶつかってもへいき'},
  wideWing:{id:'wideWing',category:'wing',name:'ひろいつばさ',recipe:{wood:1,cloth:2,screw:1},stats:{speed:0,straight:2,tough:0,endurance:3},description:'長くゆっくり飛ぶ'},
  slimWing:{id:'slimWing',category:'wing',name:'ほそいつばさ',recipe:{wood:1,cloth:1,lightMetal:1},stats:{speed:3,straight:1,tough:0,endurance:0},description:'すいすい速い'},
  smallTail:{id:'smallTail',category:'tail',name:'ちいさなしっぽ',recipe:{cloth:1,screw:1},stats:{speed:1,straight:1,tough:0,endurance:0},description:'軽く整える'},
  steadyTail:{id:'steadyTail',category:'tail',name:'まっすぐしっぽ',recipe:{cloth:1,strongWing:1,screw:1},stats:{speed:0,straight:3,tough:1,endurance:1},description:'まっすぐ飛びやすい'},
  smallEngine:{id:'smallEngine',category:'engine',name:'こがたエンジン',recipe:{engine:1,metal:1,screw:1},stats:{speed:1,straight:1,tough:0,endurance:2},description:'やさしく長持ち'},
  powerEngine:{id:'powerEngine',category:'engine',name:'パワーエンジン',recipe:{engine:2,metal:2,screw:2},stats:{speed:4,straight:0,tough:0,endurance:0},description:'力強く進む'},
  woodProp:{id:'woodProp',category:'propeller',name:'木のプロペラ',recipe:{propeller:1,wood:1,screw:1},stats:{speed:1,straight:1,tough:0,endurance:1},description:'あつかいやすい'},
  turboProp:{id:'turboProp',category:'propeller',name:'ターボプロペラ',recipe:{propeller:2,lightMetal:1,screw:1},stats:{speed:3,straight:0,tough:0,endurance:1},description:'風をたくさん作る'},
  smallTire:{id:'smallTire',category:'tire',name:'ちいさなタイヤ',recipe:{metal:1,screw:1},stats:{speed:1,straight:0,tough:1,endurance:0},description:'軽く走り出せる'},
  toughTire:{id:'toughTire',category:'tire',name:'でこぼこタイヤ',recipe:{metal:2,screw:2},stats:{speed:0,straight:1,tough:3,endurance:0},description:'着地が安心'}
};
export const categories:PartCategory[]=['body','wing','tail','engine','propeller','tire'];
export const categoryNames:Record<PartCategory,string>={body:'どうたい',wing:'つばさ',tail:'しっぽ',engine:'エンジン',propeller:'プロペラ',tire:'タイヤ'};
export function createDigGrid(seed=1):DigCell[]{const cells:DigCell[]=[]; for(let i=0;i<16;i++){const r=(Math.sin(seed+i*9.7)+1)/2; const type=r>.76?'hard':r>.28?'normal':'soft'; cells.push({id:i,type,hp:{soft:2,normal:3,hard:4}[type],maxHp:{soft:2,normal:3,hard:4}[type],sparkle:i%7===seed%7||r>.9,revealed:false});} return cells;}
export function rewardForCell(cell:DigCell, seed=1):MaterialId|null{const n=(Math.sin((cell.id+1)*(seed+3))*10000)%1; if(Math.abs(n)<.22&&!cell.sparkle)return null; const pool:MaterialId[]=cell.sparkle?['lightMetal','strongWing','engine','propeller','metal','screw']:['wood','wood','metal','screw','cloth','propeller','engine']; return pool[Math.floor(Math.abs(n)*pool.length)%pool.length];}
export function addMaterial(inv:Record<MaterialId,number>, id:MaterialId, count=1){return {...inv,[id]:(inv[id]??0)+count};}
export function canCraft(inv:Record<MaterialId,number>, part:BuiltPart){const missing=Object.entries(part.recipe).filter(([id,n])=>(inv[id as MaterialId]??0)<(n??0)); return {ok:missing.length===0,missing};}
export function craftPart(inv:Record<MaterialId,number>, crafted:Partial<Record<BuildPartId,number>>, id:BuildPartId){const part=partCatalog[id], check=canCraft(inv,part); if(!check.ok)return {ok:false,inventory:inv,crafted,missing:check.missing}; const next={...inv}; Object.entries(part.recipe).forEach(([k,v])=>next[k as MaterialId]-=v??0); return {ok:true,inventory:next,crafted:{...crafted,[id]:(crafted[id]??0)+1},missing:[]};}
export function calculatePlaneStats(plane:CurrentPlane):PlaneStats2{const base={speed:1,straight:1,tough:1,endurance:1}; categories.forEach(c=>{const id=plane[c]; if(id){const s=partCatalog[id].stats; base.speed+=s.speed;base.straight+=s.straight;base.tough+=s.tough;base.endurance+=s.endurance;}}); return base;}
export function testFlight(plane:CurrentPlane, count=0){const s=calculatePlaneStats(plane); const complete=categories.every(c=>plane[c]); const distance=Math.round((complete?8:3)+s.speed*2.8+s.endurance*2.2+s.straight*.8); const time=Math.round((2+s.endurance*.9+s.straight*.25)*10)/10; const note=s.straight>=7?'まっすぐ飛べた':s.speed>=8?'はやく飛べた':s.endurance>=8?'ながく飛べた':'やさしく飛べた'; const advice=s.endurance<6?'もっとつばさを広くしてみよう':s.speed<6?'エンジンを強くしてみよう':'しっぽでまっすぐにしてみよう'; return {distance,time,note,good:`${note}ところがよかったよ`,advice,flights:count+1};}
export function improvementSuggestions(plane:CurrentPlane){return [
  {title:'つばさを広くする',category:'wing' as PartCategory,before:plane.wing?partCatalog[plane.wing].name:'なし',after:'ひろいつばさ'},
  {title:'エンジンを強くする',category:'engine' as PartCategory,before:plane.engine?partCatalog[plane.engine].name:'なし',after:'パワーエンジン'},
  {title:'どうたいを軽くする',category:'body' as PartCategory,before:plane.body?partCatalog[plane.body].name:'なし',after:'かるいどうたい'}].slice(0,3);}
export const missionCatalog2:MissionState2[]=[{id:'wood3',title:'木材を3こあつめよう',goal:3,progress:0,completed:false},{id:'wing1',title:'つばさを1こつくろう',goal:1,progress:0,completed:false},{id:'firstPlane',title:'はじめてのひこうきをつくろう',goal:1,progress:0,completed:false},{id:'fly10',title:'10mとばしてみよう',goal:10,progress:0,completed:false},{id:'engineSwap',title:'エンジンをつけかえよう',goal:1,progress:0,completed:false}];
export function updateBuildMissions(save:SaveData, event:{type:string; value?:number}){return save.buildMissions.map(m=>{let p=m.progress; if(m.id==='wood3')p=save.materials.wood; if(m.id==='wing1')p=Object.keys(save.craftedParts).some(id=>partCatalog[id as BuildPartId]?.category==='wing')?1:0; if(m.id==='firstPlane')p=categories.every(c=>save.currentPlane[c])?1:0; if(m.id==='fly10'&&event.type==='flight')p=Math.max(p,event.value??0); if(m.id==='engineSwap'&&event.type==='engineSwap')p=1; return {...m,progress:Math.min(m.goal,p),completed:p>=m.goal};});}
