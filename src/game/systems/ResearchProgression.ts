import type { ResearchSettings, SimulationResult, RealResult, SavedPlane, DiscoveryCard, MissionState, ResearchRank, ImprovementDelta } from '../types/research.js';

export const rankNames:ResearchRank[]=['かけだし研究員','紙ひこうき研究員','フライト技師','空気の博士','かわかわマスター'];
export function rankForPoints(points:number):ResearchRank{return rankNames[points>=900?4:points>=520?3:points>=260?2:points>=90?1:0];}
export function settingsKey(s:ResearchSettings):string{return JSON.stringify(s);} const mid=(r:[number,number])=>Math.round(((r[0]+r[1])/2)*10)/10;
export const discoveryCatalog:Omit<DiscoveryCard,'earnedAt'>[]=[
{id:'wide-slow',title:'広い翼のひみつ',icon:'▰↗',description:'翼が広いほど、ゆっくり長く飛びやすい。',condition:'翼の広さ4以上で滞空時間が長い'},
{id:'narrow-fast',title:'細い翼のスピード',icon:'▶',description:'翼が細いほど、速く飛びやすい。',condition:'翼の広さ2以下で速度65以上'},
{id:'front-stable',title:'前重心の安定',icon:'●✈',description:'重心が前だと、安定しやすい。',condition:'重心を前寄りにして安定性70以上'},
{id:'back-stall',title:'後ろ重心の注意',icon:'✈↺',description:'重心が後ろだと、失速しやすい。',condition:'後ろ重心で失速55以上'},
{id:'tip-up',title:'翼端のガード',icon:'⌃✈⌃',description:'翼端を上げると、左右に安定しやすい。',condition:'翼端上げで安定性70以上'},
{id:'turning',title:'左右差で曲がる',icon:'↶✈',description:'左右差があると、曲がりやすい。',condition:'左右差をつけて旋回'},
{id:'up-throw-stall',title:'上向き投げの山',icon:'⤴︎↘︎',description:'強く上向きに投げると、上がって落ちやすい。',condition:'強く上向きで失速'},
{id:'thick-paper',title:'厚い紙のこし',icon:'▣',description:'厚い紙は重いが、形を保ちやすい。',condition:'厚い紙で安定性70以上'},
{id:'float-combo',title:'ふわふわ組み合わせ',icon:'☁✈',description:'広い翼と弱い投げ方は、滞空時間を伸ばしやすい。',condition:'広い翼とやさしい投げ方'},
{id:'distance-combo',title:'距離の組み合わせ',icon:'✈━━',description:'細い翼と強い投げ方は、距離を伸ばしやすい。',condition:'細い翼と強い投げ方'}];
export function discoverCards(s:ResearchSettings,r:SimulationResult,owned:string[],now=new Date().toISOString()):DiscoveryCard[]{const ok:Record<string,boolean>={'wide-slow':s.wingWidth>=4&&mid(r.timeRange)>=2.7,'narrow-fast':s.wingWidth<=2&&r.speed>=65,'front-stable':['front','frontish'].includes(s.centerOfGravity)&&r.stability>=70,'back-stall':s.centerOfGravity==='backish'&&r.stall>=55,'tip-up':['upSmall','upLarge'].includes(s.wingTip)&&r.stability>=70,'turning':s.balance!=='same'&&r.turn>=55,'up-throw-stall':s.throwPower==='strong'&&s.throwAngle==='up'&&r.stall>=55,'thick-paper':s.thickness==='thick'&&r.stability>=70,'float-combo':s.wingWidth>=4&&s.throwPower==='gentle'&&mid(r.timeRange)>=2.7,'distance-combo':s.wingWidth<=2&&s.throwPower==='strong'&&mid(r.distanceRange)>=6}; return discoveryCatalog.filter(c=>ok[c.id]&&!owned.includes(c.id)).map(c=>({...c,earnedAt:now}));}
export const missionCatalog:MissionState[]=[
{id:'distance5',title:'5m以上飛ぶ機体を作ろう',description:'予想飛距離の中心が5m以上',progress:0,goal:5,reward:20,completed:false},
{id:'time3',title:'滞空時間3秒以上を目指そう',description:'予想滞空時間の中心が3秒以上',progress:0,goal:3,reward:20,completed:false},
{id:'stable80',title:'安定性80以上を目指そう',description:'安定性を80以上にする',progress:0,goal:80,reward:30,completed:false},
{id:'turn-left',title:'左へ曲がる機体を作ろう',description:'左旋回の結果を出す',progress:0,goal:1,reward:20,completed:false},
{id:'turn-right',title:'右へ曲がる機体を作ろう',description:'右旋回の結果を出す',progress:0,goal:1,reward:20,completed:false},
{id:'no-stall',title:'失速しない機体を作ろう',description:'失速しやすさ30以下',progress:0,goal:1,reward:25,completed:false},
{id:'three-types',title:'3種類の基本機体を試そう',description:'基本機体を3種類シミュレーション',progress:0,goal:3,reward:35,completed:false},
{id:'cards5',title:'5枚の発見カードを集めよう',description:'発見カード5枚',progress:0,goal:5,reward:40,completed:false}];
export function updateMissions(missions:MissionState[],ctx:{settings:ResearchSettings;result:SimulationResult;triedTypes:string[];cardCount:number}):{missions:MissionState[];completed:MissionState[]}{const completed:MissionState[]=[]; const out=missions.map(m=>{if(m.completed)return m; let p=m.progress; if(m.id==='distance5')p=mid(ctx.result.distanceRange); if(m.id==='time3')p=mid(ctx.result.timeRange); if(m.id==='stable80')p=ctx.result.stability; if(m.id==='turn-left')p=ctx.settings.balance==='leftUp'?1:0; if(m.id==='turn-right')p=ctx.settings.balance==='rightUp'?1:0; if(m.id==='no-stall')p=ctx.result.stall<=30?1:0; if(m.id==='three-types')p=ctx.triedTypes.length; if(m.id==='cards5')p=ctx.cardCount; const done=p>=m.goal; const n={...m,progress:Math.min(p,m.goal),completed:done}; if(done)completed.push(n); return n;}); return{missions:out,completed};}
export function diffResults(prev:SimulationResult,next:SimulationResult):ImprovementDelta{return{distance:Math.round((mid(next.distanceRange)-mid(prev.distanceRange))*10)/10,time:Math.round((mid(next.timeRange)-mid(prev.timeRange))*10)/10,speed:next.speed-prev.speed,stability:next.stability-prev.stability,stall:next.stall-prev.stall,turn:next.turn-prev.turn,tradeoff: next.stability>prev.stability&&next.speed<prev.speed?'スピードを下げて安定性が上がった':next.speed>prev.speed&&next.stability<prev.stability?'安定性を使ってスピードを上げた':'変化の組み合わせを観察しよう'};}
export function autoPlaneName(n:number):string{return ['そらかぜ','ふわふわ','はやぶさ'][n%3]+(n+1)+'号';}
export function canAward(key:string,awarded:string[]):boolean{return !awarded.includes(key);}
export function pointsFor(action:string,value=0){return {firstSim:10,firstReal:20,newCombo:5,best:20,mission:20,card:15,improved:10,closeReal:Math.max(10,Math.min(30,value))}[action]??0;}
export function makeSavedPlane(input:{id:string;name:string;settings:ResearchSettings;result:SimulationResult;now:string}):SavedPlane{return{ id:input.id,name:input.name,basePlane:input.settings.basePlane,settings:input.settings,createdAt:input.now,updatedAt:input.now,improvementCount:0,simulationHistory:[input.result],realHistory:[],bestDistance:input.result.distanceRange[1],bestTime:input.result.timeRange[1],titles:[],favorite:false};}
export function renamePlane(planes:SavedPlane[],id:string,name:string){return planes.map(p=>p.id===id?{...p,name:name.trim()||p.name,updatedAt:new Date().toISOString()}:p)}
export function addRealHistory(plane:SavedPlane,real:RealResult){return {...plane,realHistory:[real,...plane.realHistory].slice(0,20),updatedAt:new Date().toISOString()};}
