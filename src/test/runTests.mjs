import assert from 'node:assert/strict';
import { calculateStats, defaultSelection, randomSelection } from '../../dist/assets/game/data/planeParts.js';
import { normalizeSave } from '../../dist/assets/game/systems/SaveSystem.js';
import { buildResult, judgeRating } from '../../dist/assets/game/systems/ResultSystem.js';
const stats=calculateStats(defaultSelection); assert.deepEqual(stats,{speed:3,lift:4,control:5,energy:3});
for(const body of ['round','speed','large']) for(const wing of ['wide','swift','float']) for(const engine of ['gentle','power','eco']){const s=calculateStats({body,wing,engine,color:'blue'}); Object.values(s).forEach(v=>assert.ok(v>=1&&v<=5));}
assert.equal(randomSelection(()=>0).body,'round'); assert.equal(randomSelection(()=>0.99).engine,'eco');
assert.equal(normalizeSave('bad').selection.body,'round'); assert.equal(normalizeSave({version:0,selection:{body:'speed',wing:'swift',engine:'eco',color:'red'},bestDistance:5}).version,1);
assert.equal(judgeRating({body:'large',wing:'float',engine:'eco',color:'green'},1000,3,0),'エコフライト名人');
const save=normalizeSave({bestDistance:10,bestStars:1,bestGoldStars:0}); const r=buildResult(defaultSelection,20.7,2,1,3,save); assert.equal(r.isBestDistance,true); assert.equal(r.distance,20);
console.log('logic tests passed');
import { defaultResearchSettings, simulateFlight, compareWithReal } from '../../dist/assets/game/systems/ResearchPhysics.js';
const base={...defaultResearchSettings};
const narrow=simulateFlight({...base,wingWidth:1}); const wide=simulateFlight({...base,wingWidth:5}); assert.ok(wide.timeRange[1]>narrow.timeRange[1]);
const front=simulateFlight({...base,centerOfGravity:'front'}); const back=simulateFlight({...base,centerOfGravity:'backish'}); assert.ok(front.stability>back.stability); assert.ok(back.stall>front.stall);
assert.equal(simulateFlight({...base,balance:'leftUp'}).mainType,'左へ旋回'); assert.equal(simulateFlight({...base,balance:'rightUp'}).mainType,'右へ旋回');
assert.ok(simulateFlight({...base,throwPower:'strong'}).distanceRange[1]>simulateFlight({...base,throwPower:'gentle'}).distanceRange[1]);
const sameA=simulateFlight(base), sameB=simulateFlight(base); assert.deepEqual(sameA.distanceRange,sameB.distanceRange);
for (const r of [simulateFlight({...base,wingWidth:5,throwPower:'strong'}), simulateFlight({...base,wingWidth:1,throwPower:'gentle',centerOfGravity:'backish'})]) { assert.ok(r.distanceRange[0]>=2&&r.distanceRange[1]<=21); assert.ok(r.timeRange[0]>=0.8&&r.timeRange[1]<=8.3); }
const cmp=compareWithReal(sameA,{distance:1,time:1,traits:['急に落ちた','左へ曲がった'],throwPower:'normal',memo:''}); assert.ok(cmp.suggestions.some(s=>s.includes('つばさ'))); assert.ok(cmp.different.includes('急に落ちた'));
const migrated=normalizeSave({version:1,bestDistance:3}); assert.deepEqual(migrated.researchRecords,[]); assert.equal(migrated.researchBestDistance,0);
console.log('research tests passed');
