import fs from 'node:fs';
import * as THREE from 'three';
import {type PlanModel,type Point} from '../lib/plan-model.ts';
const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const area=(poly:Point[])=>Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0)/2);
function clip(subject:Point[],triangle:Point[]){let output=subject;if(cross(triangle[0],triangle[1],triangle[2])<0)triangle=[...triangle].reverse();for(let j=0;j<3;j++){const a=triangle[j],b=triangle[(j+1)%3],input=output;output=[];for(let i=0;i<input.length;i++){const p=input[i],q=input[(i+1)%input.length],dp=cross(a,b,p),dq=cross(a,b,q);if(dp>=-1e-8)output.push(p);if((dp<0)!==(dq<0)){const t=dp/(dp-dq);output.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}}return output;}
const tris=(p:Point[])=>THREE.ShapeUtils.triangulateShape(p.map(x=>new THREE.Vector2(...x)),[]).map(t=>t.map(i=>p[i]));
const input=process.argv.length>2?process.argv.slice(2):['public/models/dushu.json','public/models/nanjing.json','public/models/hongkong.json'];const report=[];
for(const filename of input){const models=JSON.parse(fs.readFileSync(filename,'utf8')) as PlanModel[];for(const m of models){const holes=m.slabs.flatMap(s=>s.holes).flatMap(tris);for(const r of m.rooms){const overlap=tris(r.polygon).reduce((sum,t)=>sum+holes.reduce((s,h)=>s+area(clip(t,h)),0),0);if(overlap>.1)report.push({model:m.id,room:r.id,label:r.label,overlapPixels:Math.round(overlap*100)/100,roomPercent:Math.round(overlap/area(r.polygon)*10000)/100});}}}
console.log(JSON.stringify(report,null,2));
if(process.argv.length===2)fs.writeFileSync('public/models/room-hole-audit.json',JSON.stringify({scope:'Polygon intersection in source-image pixel coordinates',models:15,issues:report,passed:report.length===0},null,2));
if(report.length)process.exitCode=1;
