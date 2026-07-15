export type BasePlaneId='speed'|'glider'|'balance';
export type PaperSize='A4'|'B5'; export type PaperThickness='thin'|'normal'|'thick';
export type WingAngle='down'|'level'|'up'; export type WingTip='flat'|'upSmall'|'upLarge'|'downSmall';
export type CenterOfGravity='front'|'frontish'|'center'|'backish'; export type Balance='same'|'leftUp'|'rightUp';
export type ThrowPower='gentle'|'normal'|'strong'; export type ThrowAngle='down'|'level'|'up'; export type ThrowHeight='child'|'adult';
export interface ResearchSettings{basePlane:BasePlaneId;paperSize:PaperSize;thickness:PaperThickness;noseLength:number;wingWidth:number;wingAngle:WingAngle;wingTip:WingTip;centerOfGravity:CenterOfGravity;balance:Balance;throwPower:ThrowPower;throwAngle:ThrowAngle;throwHeight:ThrowHeight}
export interface SimulationResult{distanceRange:[number,number];timeRange:[number,number];speed:number;stability:number;turn:number;stall:number;landing:number;mainType:string;subTypes:string[];path:{x:number;y:number}[];topTurn:{x:number;y:number}[];notes:string[]}
export interface RealResult{distance?:number;time?:number;traits:string[];throwPower:ThrowPower;memo:string}
export interface ComparisonResult{distanceDiff?:number;predicted:string[];actual:string[];matched:string[];different:string[];suggestions:string[]}
export interface ResearchRecord{id:string;settings:ResearchSettings;simulation:SimulationResult;real?:RealResult;comparison?:ComparisonResult;createdAt:string;bestDistance:number}
