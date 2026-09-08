import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Navigator} from '../research/module-routing.js';
const navData=JSON.parse(fs.readFileSync('research/navigation.json','utf8'));
const nav=new Navigator(navData), radii=[100,150,200,250,300,350,400,450], routes={};
let pathChecks=0, stepChecks=0, pairRuns=0, baselineChecks=0, maxBaselineError=0;
const failures=[];
for(const radius of radii){
  nav.setRadius(radius);
  for(const from of navData.pois)for(const to of navData.pois){
    const r=nav.route(from,to); pairRuns++;
    const key=`${radius}/${from.id}/${to.id}`;
    if(!r){routes[key]=null;failures.push(key);continue;}
    assert.equal(r.indices[0],from.gridIndex);assert.equal(r.indices.at(-1),to.gridIndex);
    let traced=0;
    for(let i=0;i<r.indices.length;i++){
      const cell=r.indices[i];assert(nav.valid(cell));pathChecks++;
      if(!i)continue;
      const prev=r.indices[i-1],w=nav.grid.width;
      const dx=cell%w-prev%w,dy=Math.floor(cell/w)-Math.floor(prev/w);
      assert(Math.abs(dx)<=1&&Math.abs(dy)<=1&&(dx||dy));
      if(dx&&dy){assert(nav.valid(prev+dx));assert(nav.valid(prev+dy*w));}
      traced+=nav.grid.step*(dx&&dy?Math.SQRT2:1);stepChecks++;
    }
    assert(Math.abs(traced/1000-r.distanceM)<1e-7);
    const compactDistance=r.points.slice(1).reduce((a,p,i)=>a+Math.hypot(p[0]-r.points[i][0],p[1]-r.points[i][1])/1000,0);
    assert(Math.abs(compactDistance-r.distanceM)<1e-7);
    routes[key]={from:r.from,to:r.to,distanceM:r.distanceM,directM:r.directM,minRadiusMm:r.minRadiusMm,points:r.points};
    if(radius===300){
      const i=navData.baseline.poiIds.indexOf(from.id),j=navData.baseline.poiIds.indexOf(to.id);
      const error=Math.abs(r.distanceM-navData.baseline.matrixMeters[i][j]);
      assert(error<0.0011,`${key}: baseline mismatch ${error}`);baselineChecks++;maxBaselineError=Math.max(maxBaselineError,error);
    }
  }
}
let symmetryChecks=0, monotonicChecks=0;
for(const radius of radii)for(const a of navData.pois)for(const b of navData.pois){
  const r=routes[`${radius}/${a.id}/${b.id}`],rev=routes[`${radius}/${b.id}/${a.id}`];
  assert.equal(r===null,rev===null);if(r)assert(Math.abs(r.distanceM-rev.distanceM)<1e-7);symmetryChecks++;
  if(radius>100){const previous=routes[`${radius-50}/${a.id}/${b.id}`];if(r){assert(previous);assert(r.distanceM>=previous.distanceM-1e-7);}monotonicChecks++;}
}
// Deliberate failure: the endpoint clearance is below a 2 m radius; unreachable is null, never 0 m.
nav.setRadius(2000);assert.equal(nav.route(navData.pois[0],navData.pois[1]),null);
const audit={computedAt:'2026-09-08',radiiMm:radii,pairRuns,pathChecks,stepChecks,baselineChecks,maxBaselineErrorMeters:maxBaselineError,symmetryChecks,monotonicChecks,unreachablePairs:failures.length,failures,algorithm:'Original embedded Navigator: eight-neighbour Dijkstra, no diagonal corner cuts; public clearance field; collinear compression only.',failureCaseChecked:true};
fs.writeFileSync('lib/routes.json',JSON.stringify(routes));
fs.writeFileSync('lib/audit.json',JSON.stringify(audit,null,2));
fs.writeFileSync('public/audit.json',JSON.stringify(audit,null,2));
const csv=['radius_mm,from,to,distance_m,direct_m,min_conservative_radius_mm,reachable',...Object.entries(routes).map(([key,r])=>{const [radius,from,to]=key.split('/');return [radius,from,to,r?.distanceM.toFixed(6)??'',r?.directM.toFixed(6)??'',r?.minRadiusMm??'',Boolean(r)].join(',');})].join('\n');
fs.writeFileSync('public/route-matrix.csv','\ufeff'+csv);
console.log(JSON.stringify({...audit,failures:failures.slice(0,8),routeFileBytes:fs.statSync('lib/routes.json').size},null,2));
