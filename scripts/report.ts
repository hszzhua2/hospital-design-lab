import fs from 'node:fs';
import assert from 'node:assert/strict';
import {cases,study,chain,radii,formatReport} from '../lib/study.ts';
const experiments=[];
for(const c of cases)for(const radius of radii){const s=study(c.id,radius,c.speed);assert(s.a.reachable&&s.b.reachable);assert(s.savedM!>=-1e-8);assert.deepEqual(s.b.sequence,s.a.sequence.filter(x=>x!=='registration'));experiments.push(s);}
assert.throws(()=>study('missing',300,60));assert.throws(()=>chain(['entrance','ct1'],301,60));assert.throws(()=>chain(['entrance','ct1'],300,NaN));
const a=study('outpatient',300,30),b=study('outpatient',300,60);assert.equal(a.a.distanceM,b.a.distanceM);assert.equal(a.a.minutes,b.a.minutes!*2);
fs.writeFileSync('public/f1-study-report.md',formatReport());
fs.writeFileSync('public/scenario-results.json',JSON.stringify(experiments,null,2));
fs.writeFileSync('public/scenario-results.csv','\ufeff'+['case,radius_mm,speed_m_min,A_m,B_m,saved_m,saved_moving_min',...experiments.map(s=>[s.caseId,s.radiusMm,s.speedMMin,s.a.distanceM,s.b.distanceM,s.savedM,s.savedMinutes].join(','))].join('\n'));
console.log(JSON.stringify({scenarioComparisons:experiments.length,baseline:cases.map(c=>{const s=study(c.id,c.radius,c.speed);return {id:c.id,a:s.a.distanceM,b:s.b.distanceM,saved:s.savedM,pct:s.percent};}),parameterChecks:'passed'},null,2));
