import type { CurrentPlane, FlightLocationId, FlightRecord, FlightStyleId, PlaneStats2, SaveData, SavedBuildPlane } from '../types/game.js';
import { calculatePlaneStats, categories } from './BuildGame.js';

export const flightLocations:Record<FlightLocationId,{id:FlightLocationId;name:string;difficulty:'かんたん'|'ふつう'|'むずかしい';description:string;distance:number;time:number;height:number;wind:number;straight:number;bg:string;}>= {
  grass:{id:'grass',name:'そうげん',difficulty:'かんたん',description:'風が弱く、はじめてでも安定して飛ばせるよ',distance:1,time:1,height:1,wind:.2,straight:1.08,bg:'🌿'},
  beach:{id:'beach',name:'うみべ',difficulty:'ふつう',description:'少し風があって、長く飛びやすいよ',distance:1.14,time:1.12,height:1.02,wind:.55,straight:.98,bg:'🌊'},
  mountain:{id:'mountain',name:'やまのうえ',difficulty:'むずかしい',description:'風が強くて難しいけれど、良い記録が出やすいよ',distance:1.28,time:1.04,height:1.2,wind:.9,straight:.9,bg:'⛰️'}
};
export const flightStyles:Record<FlightStyleId,{id:FlightStyleId;name:string;description:string;distance:number;time:number;height:number;speed:number;path:string;}>= {
  straight:{id:'straight',name:'まっすぐ とばす',description:'ゆらゆらを少なくして、きれいに進むよ',distance:1.04,time:1.05,height:.95,speed:1,path:'M10 58 C45 50 75 50 110 48'},
  high:{id:'high',name:'たかく とばす',description:'ぐんと上がって、風をつかまえるよ',distance:.98,time:1.12,height:1.35,speed:.94,path:'M10 62 C35 18 80 18 112 54'},
  fast:{id:'fast',name:'はやく とばす',description:'スピードを出して遠くをめざすよ',distance:1.15,time:.9,height:.9,speed:1.22,path:'M10 60 C45 44 82 42 114 36'}
};
export function hasCompletedPlane(plane:CurrentPlane){return categories.every(c=>!!plane[c]);}
export function selectablePlanes(save:SaveData){return save.savedBuildPlanes.filter(p=>hasCompletedPlane(p.parts));}
export function simulateFlightRecord(args:{plane:SavedBuildPlane;location:FlightLocationId;style:FlightStyleId;now?:string;}):FlightRecord{
  const stats:PlaneStats2=args.plane.stats||calculatePlaneStats(args.plane.parts); const loc=flightLocations[args.location]; const style=flightStyles[args.style];
  const base=12+stats.speed*2.7+stats.endurance*3.4+stats.straight*1.6+stats.tough*.9;
  const stability=(stats.straight*1.8+stats.tough)/(1+loc.wind);
  const distance=Math.round((base*loc.distance*style.distance)+(stability*loc.straight));
  const time=Math.round((3+stats.endurance*.85+stats.straight*.22)*loc.time*style.time*10)/10;
  const maxHeight=Math.round((5+stats.endurance*1.4+stats.speed*.45)*loc.height*style.height);
  const evaluation=stats.straight>=7&&args.style==='straight'?'まっすぐ きれいに とべた！':stats.tough>=6&&loc.wind>.5?'かぜに つよかったよ！':stats.endurance>=7?'ながく とべたね！':'げんきに とべたよ！';
  return {id:`flight-${args.plane.id}-${args.location}-${args.style}-${args.now||'now'}`,planeId:args.plane.id,location:args.location,style:args.style,distance,time,maxHeight,evaluation,createdAt:args.now||new Date().toISOString()};
}
export function saveFlightRecord(save:SaveData, record:FlightRecord){
  const records=[record,...save.flightRecords].slice(0,80); const planes=save.savedBuildPlanes.map(p=>p.id===record.planeId?{...p,flightCount:p.flightCount+1,bestDistance:Math.max(p.bestDistance,record.distance),bestTime:Math.max(p.bestTime,record.time),lastFlownAt:record.createdAt,updatedAt:record.createdAt}:p);
  return {flightRecords:records,savedBuildPlanes:planes,bestDistanceByPlane:{...save.bestDistanceByPlane,[record.planeId]:Math.max(save.bestDistanceByPlane[record.planeId]||0,record.distance)},bestTimeByPlane:{...save.bestTimeByPlane,[record.planeId]:Math.max(save.bestTimeByPlane[record.planeId]||0,record.time)},totalFlights:save.totalFlights+1,lastFlightResult:record};
}
export function updateFlightMissions(save:SaveData, record?:FlightRecord){return save.buildMissions.map(m=>{let p=m.progress; if(m.id==='firstFlight')p=Math.max(p,save.totalFlights>0||record?1:0); if(m.id==='fly10'&&record)p=Math.max(p,record.distance); if(m.id==='flight3')p=Math.max(p,save.totalFlights+(record?1:0)); if(m.id==='grassFlight'&&record?.location==='grass')p=1; if(m.id==='differentPlane')p=new Set(save.flightRecords.map(r=>r.planeId).concat(record?[record.planeId]:[])).size>=2?1:p; if(m.id==='newRecord'&&record&&record.distance>(save.bestDistanceByPlane[record.planeId]||0))p=1; return {...m,progress:Math.min(m.goal,p),completed:p>=m.goal};});}
