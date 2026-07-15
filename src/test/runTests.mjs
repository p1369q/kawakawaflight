import assert from 'node:assert/strict';
import { calculateStats, defaultSelection, randomSelection } from '../../dist/game/data/planeParts.js';
import { normalizeSave } from '../../dist/game/systems/SaveSystem.js';
import { buildResult, judgeRating } from '../../dist/game/systems/ResultSystem.js';
const stats=calculateStats(defaultSelection); assert.deepEqual(stats,{speed:3,lift:4,control:5,energy:3});
for(const body of ['round','speed','large']) for(const wing of ['wide','swift','float']) for(const engine of ['gentle','power','eco']){const s=calculateStats({body,wing,engine,color:'blue'}); Object.values(s).forEach(v=>assert.ok(v>=1&&v<=5));}
assert.equal(randomSelection(()=>0).body,'round'); assert.equal(randomSelection(()=>0.99).engine,'eco');
assert.equal(normalizeSave('bad').selection.body,'round'); assert.equal(normalizeSave({version:0,selection:{body:'speed',wing:'swift',engine:'eco',color:'red'},bestDistance:5}).version,1);
assert.equal(judgeRating({body:'large',wing:'float',engine:'eco',color:'green'},1000,3,0),'エコフライト名人');
const save=normalizeSave({bestDistance:10,bestStars:1,bestGoldStars:0}); const r=buildResult(defaultSelection,20.7,2,1,3,save); assert.equal(r.isBestDistance,true); assert.equal(r.distance,20);
console.log('logic tests passed');
