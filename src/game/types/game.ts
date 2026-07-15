export type BodyId='round'|'speed'|'large'; export type WingId='wide'|'swift'|'float'; export type EngineId='gentle'|'power'|'eco'; export type ColorId='red'|'blue'|'yellow'|'green'|'purple'|'orange';
export type StatKey='speed'|'lift'|'control'|'energy'; export type Stats=Record<StatKey,number>;
export interface PlaneSelection{body:BodyId;wing:WingId;engine:EngineId;color:ColorId}
import type { ResearchRecord } from './research.js';
export interface SaveData{version:number;selection:PlaneSelection;bestDistance:number;bestStars:number;bestGoldStars:number;soundOn:boolean;hasSeenHowTo:boolean;researchRecords:ResearchRecord[];researchBestDistance:number}
export interface FlightResult{selection:PlaneSelection;distance:number;stars:number;goldStars:number;duration:number;rating:string;isBestDistance:boolean;isBestStars:boolean;isBestGoldStars:boolean}
