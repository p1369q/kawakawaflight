export type BodyId='round'|'speed'|'large'; export type WingId='wide'|'swift'|'float'; export type EngineId='gentle'|'power'|'eco'; export type ColorId='red'|'blue'|'yellow'|'green'|'purple'|'orange';
export type StatKey='speed'|'lift'|'control'|'energy'; export type Stats=Record<StatKey,number>;
export interface PlaneSelection{body:BodyId;wing:WingId;engine:EngineId;color:ColorId}
import type { DiscoveryCard, ImprovementEntry, LastResearchSession, MissionState, ResearchRank, ResearchRecord, SavedPlane } from './research.js';
export type MaterialId='wood'|'metal'|'screw'|'cloth'|'propeller'|'engine'|'lightMetal'|'strongWing'|'blueprintFragment'|'materialFragment';
export type QuizDifficulty='easy'|'challenge';
export interface QuizSession{seed:number;difficulty:QuizDifficulty;questionIds:string[];currentIndex:number;correctCount:number;streak:number;bestStreak:number;answers:{questionId:string;correct:boolean;choiceIndex:number}[];startedAt:string;completed:boolean}
export interface QuizStats{sessions:number;answered:number;completedSets:number;bestStreak:number;correctTotal:number}
export type PartCategory='body'|'wing'|'tail'|'engine'|'propeller'|'tire';
export type BuildPartId='lightBody'|'strongBody'|'wideWing'|'slimWing'|'smallTail'|'steadyTail'|'smallEngine'|'powerEngine'|'woodProp'|'turboProp'|'smallTire'|'toughTire';
export interface BuiltPart{id:BuildPartId;category:PartCategory;name:string;recipe:Partial<Record<MaterialId,number>>;stats:PlaneStats2;description:string}
export type PlaneStats2={speed:number;straight:number;tough:number;endurance:number};
export type CurrentPlane=Partial<Record<PartCategory,BuildPartId>>;
export interface DigCell{id:number;type:'soft'|'normal'|'hard';hp:number;maxHp:number;sparkle:boolean;revealed:boolean;reward?:MaterialId|null}
export interface MissionState2{id:string;title:string;goal:number;progress:number;completed:boolean}
export interface SavedBuildPlane{id:string;name:string;parts:CurrentPlane;stats:PlaneStats2;flightCount:number;bestDistance:number;bestTime:number;lastFlownAt?:string;createdAt:string;updatedAt:string}
export interface SaveData{version:number;selection:PlaneSelection;bestDistance:number;bestStars:number;bestGoldStars:number;soundOn:boolean;hasSeenHowTo:boolean;researchRecords:ResearchRecord[];researchBestDistance:number;researchPoints:number;researchRank:ResearchRank;missions:MissionState[];discoveredCards:DiscoveryCard[];savedPlanes:SavedPlane[];activePlaneId?:string;improvementHistory:ImprovementEntry[];lastResearchSession?:LastResearchSession;awardedActionKeys:string[];triedBasePlanes:string[];materials:Record<MaterialId,number>;discoveredMaterials:MaterialId[];craftedParts:Partial<Record<BuildPartId,number>>;currentPlane:CurrentPlane;savedBuildPlanes:SavedBuildPlane[];digProgress:DigCell[];buildMissions:MissionState2[];tutorialProgress:string[];tutorialCompleted:boolean;inventorySeen:boolean;lastScreen?:string;activeBuildPlaneId?:string;quizDifficulty:QuizDifficulty;quizStats:QuizStats;answeredQuestionIds:string[];currentQuizSession?:QuizSession;quizSeed:number;correctCount:number;streak:number;blueprintFragments:number;unlockedBlueprints:BuildPartId[];speechEnabled:boolean}
export interface FlightResult{selection:PlaneSelection;distance:number;stars:number;goldStars:number;duration:number;rating:string;isBestDistance:boolean;isBestStars:boolean;isBestGoldStars:boolean}
