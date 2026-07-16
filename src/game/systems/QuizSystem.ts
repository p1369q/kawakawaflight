import { addMaterial, emptyMaterials, materialIds, missionCatalog2 } from './BuildGame.js';
import type { BuildPartId, MaterialId, MissionState2, SaveData } from '../types/game.js';

export type QuizDifficulty='easy'|'challenge';
export type QuizCategoryEasy='かず'|'かたち'|'ひらがな'|'いろ'|'なかまわけ';
export type QuizCategoryChallenge='たしざん'|'ひきざん'|'かんじ'|'とけい'|'ずけい'|'ぶんしょう';
export type QuizCategory=QuizCategoryEasy|QuizCategoryChallenge;
export interface QuizQuestion{id:string;difficulty:QuizDifficulty;category:QuizCategory;prompt:string;visual:string;choices:string[];answerIndex:number;reason:string;readText:string}
export interface QuizSession{seed:number;difficulty:QuizDifficulty;questionIds:string[];currentIndex:number;correctCount:number;streak:number;bestStreak:number;answers:{questionId:string;correct:boolean;choiceIndex:number}[];startedAt:string;completed:boolean}
export interface QuizReward{materials:Record<MaterialId,number>;fragments:number;unlocked:BuildPartId[];messages:string[]}
const easyCats:QuizCategoryEasy[]=['かず','かたち','ひらがな','いろ','なかまわけ'];
const challengeCats:QuizCategoryChallenge[]=['たしざん','ひきざん','かんじ','とけい','ずけい','ぶんしょう'];
export const quizCategories={easy:easyCats,challenge:challengeCats};
export const blueprintCatalog:{partId:BuildPartId;name:string;fragments:number}[]=[{partId:'wideWing',name:'ひろいつばさ',fragments:3},{partId:'powerEngine',name:'パワーエンジン',fragments:5}];
export function mulberry32(seed:number){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const pick=<T>(a:T[],r:()=>number)=>a[Math.floor(r()*a.length)%a.length];
const shuffle=<T>(a:T[],r:()=>number)=>a.map(v=>({v,k:r()})).sort((x,y)=>x.k-y.k).map(x=>x.v);
function makeChoices(answer:string, wrong:string[], r:()=>number){const all=shuffle([answer,...shuffle(wrong.filter(x=>x!==answer),r).slice(0,2)],r).slice(0,3); return {choices:all,answerIndex:all.indexOf(answer)};}
export function generateQuizQuestion(difficulty:QuizDifficulty, seed:number, index=0):QuizQuestion{const r=mulberry32(seed+index*9973); const category=pick(difficulty==='easy'?easyCats:challengeCats,r); const id=`${difficulty}-${category}-${seed}-${index}`; let prompt='', visual='', answer='', wrong:string[]=[], reason='';
 if(difficulty==='easy'){
  if(category==='かず'){const n=1+Math.floor(r()*10); prompt='いくつあるかな？'; visual='●'.repeat(n); answer=String(n); wrong=[String(Math.max(1,n-1)),String(Math.min(10,n+1))]; reason=`${n}こあるね。`;}
  if(category==='かたち'){const shapes=['まる','さんかく','しかく']; answer=pick(shapes,r); prompt=`${answer}をえらぼう`; visual=answer==='まる'?'○ ○':answer==='さんかく'?'△ △':'□ □'; wrong=shapes; reason=`これは${answer}の形だよ。`;}
  if(category==='ひらがな'){const words=[['あ','あひる'],['か','かさ'],['さ','さかな'],['た','たいこ']]; const w=pick(words,r); prompt=`「${w[1]}」のさいしょのもじは？`; visual=w[1]; answer=w[0]; wrong=['あ','か','さ','た']; reason=`${w[1]}は${w[0]}からはじまるよ。`;}
  if(category==='いろ'){const colors=[['あか','赤いライト'],['あお','青いそら'],['きいろ','黄色い星']]; const c=pick(colors,r); prompt=`${c[1]}のいろは？`; visual=c[1]; answer=c[0]; wrong=['あか','あお','きいろ']; reason=`${c[1]}は${c[0]}だよ。`;}
  if(category==='なかまわけ'){const q=pick([['のりもの','ひこうき','りんご','くるま'],['たべもの','りんご','ひこうき','ねこ']],r); prompt=`${q[0]}のなかまは？`; visual=q[0]; answer=q[1]; wrong=[q[2],q[3]]; reason=`${answer}は${q[0]}のなかまだね。`;}
 } else {
  if(category==='たしざん'){const a=10+Math.floor(r()*40),b=1+Math.floor(r()*9); prompt='あわせていくつ？'; visual=`${a} + ${b}`; answer=String(a+b); wrong=[String(a+b-1),String(a+b+1)]; reason=`${a}に${b}をたすと${a+b}だよ。`;}
  if(category==='ひきざん'){const a=20+Math.floor(r()*50),b=1+Math.floor(r()*9); prompt='のこりはいくつ？'; visual=`${a} - ${b}`; answer=String(a-b); wrong=[String(a-b-1),String(a-b+2)]; reason=`${a}から${b}をひくと${a-b}だよ。`;}
  if(category==='かんじ'){const q=pick([['空','そら'],['山','やま'],['川','かわ'],['火','ひ']],r); prompt='この漢字のよみは？'; visual=q[0]; answer=q[1]; wrong=['そら','やま','かわ','ひ']; reason=`${q[0]}は${answer}と読むよ。`;}
  if(category==='とけい'){const h=1+Math.floor(r()*12); prompt='時計は何時？'; visual=`${h}:00`; answer=`${h}じ`; wrong=[`${h%12+1}じ`,`${Math.max(1,h-1)}じ`]; reason=`長い針が12で、${h}時だよ。`;}
  if(category==='ずけい'){const q=pick([['角が3つ','さんかく'],['角が4つ','しかく']],r); prompt='この形は？'; visual=q[0]; answer=q[1]; wrong=['まる','さんかく','しかく']; reason=`${q[0]}だから${answer}だよ。`;}
  if(category==='ぶんしょう'){prompt='文を読もう'; visual='ミナはねじを2こ、木材を3こ見つけました。多いのは？'; answer='木材'; wrong=['ねじ','おなじ']; reason='3こは2こより多いね。';}
 }
 const c=makeChoices(answer,wrong,r); return {id,difficulty,category,prompt,visual,choices:c.choices,answerIndex:c.answerIndex,reason,readText:`${prompt} ${visual}`};}
export function startQuizSession(difficulty:QuizDifficulty, seed=Date.now()%100000):QuizSession{const qs=Array.from({length:5},(_,i)=>generateQuizQuestion(difficulty,seed,i).id); return {seed,difficulty,questionIds:qs,currentIndex:0,correctCount:0,streak:0,bestStreak:0,answers:[],startedAt:new Date().toISOString(),completed:false};}
export function answerQuestion(session:QuizSession, choiceIndex:number){const q=generateQuizQuestion(session.difficulty,session.seed,session.currentIndex); const correct=choiceIndex===q.answerIndex; const streak=correct?session.streak+1:0; return {...session,currentIndex:Math.min(5,session.currentIndex+1),correctCount:session.correctCount+(correct?1:0),streak,bestStreak:Math.max(session.bestStreak,streak),completed:session.currentIndex+1>=5,answers:[...session.answers,{questionId:q.id,correct,choiceIndex}]};}
export function calculateQuizReward(correct:number,bestStreak:number):QuizReward{let materials=emptyMaterials(); const messages:string[]=[]; for(let i=0;i<Math.max(1,correct);i++) materials=addMaterial(materials,materialIds[i%5],1); let fragments=correct===5?1:0; if(correct>=3){materials=addMaterial(materials,'cloth',1); messages.push('追加材料');} if(bestStreak>=3){materials=addMaterial(materials,'screw',1); fragments+=1; messages.push('れんぞくボーナス');} if(correct===0) materials=addMaterial(materials,'wood',1); return {materials,fragments,unlocked:[],messages};}
export function mergeQuizReward(save:SaveData,reward:QuizReward){let materials={...save.materials}; materialIds.forEach(id=>{materials[id]=(materials[id]??0)+(reward.materials[id]??0);}); const blueprintFragments=(save.blueprintFragments??0)+reward.fragments; const unlocked=[...(save.unlockedBlueprints??[])]; blueprintCatalog.forEach(b=>{if(blueprintFragments>=b.fragments&&!unlocked.includes(b.partId))unlocked.push(b.partId);}); return {materials,blueprintFragments,unlockedBlueprints:unlocked,discoveredMaterials:[...new Set([...save.discoveredMaterials,...materialIds.filter(id=>(reward.materials[id]??0)>0)])]};}
export function updateQuizMissions(save:SaveData):MissionState2[]{return missionCatalog2.map(m=>{let p=m.progress; const st=save.quizStats; if(m.id==='quiz1')p=st.sessions; if(m.id==='quiz3')p=st.answered; if(m.id==='quiz5')p=st.completedSets; if(m.id==='quizStreak3')p=st.bestStreak>=3?1:0; if(m.id==='blueprint1')p=save.blueprintFragments; return {...m,progress:Math.min(m.goal,p),completed:p>=m.goal};});}
