import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {buildPlanScene,exportableScene} from '../lib/plan-scene.ts';
import {type PlanModel,isCirculation,modelCounts} from '../lib/plan-model.ts';

// Regression fixture: wide and rotated stairs must keep their recorded plan
// footprints; turning furniture off must never erase vertical circulation.
const fixture:PlanModel={id:'circulation-fixture',project:'fixture',label:'fixture',levels:[1],image:'',width:400,height:400,unitsPerPixel:.1,scaleStatus:'assumed',scaleNote:'test fixture',notes:[],slabs:[{outline:[[0,0],[400,0],[400,400],[0,400]],holes:[]}],rooms:[],walls:[],openings:[],furniture:[
 {id:'stair-rotated',type:'stair',x:70,y:80,w:30,d:60,rotation:37,stairLayout:'dogleg',rise:3.2,evidence:'symbol'},
 {id:'stair-wide',type:'stair',x:175,y:80,w:70,d:40,rotation:0,stairLayout:'dogleg',rise:3.2,evidence:'symbol'},
 {id:'lift',type:'lift',x:280,y:80,w:35,d:40,rotation:-20,evidence:'symbol'},
 {id:'escalator',type:'escalator',x:285,y:250,w:30,d:100,rotation:27,rise:3.2,evidence:'symbol'},
 {id:'bed',type:'bed',x:80,y:260,w:20,d:40,rotation:0,evidence:'inferred'},
]};
const options={wallHeight:3.2,furniture:true,circulation:true,inferred:true,byEvidence:true,rooms:false};
function ids(model:PlanModel,furniture:boolean,circulation:boolean){
 const built=buildPlanScene(model,{...options,furniture,circulation});
 const exported=exportableScene(built.root),found=new Set<string>();
 exported.traverse(o=>{if(o.userData.kind==='furniture'||o.userData.kind==='circulation')found.add(o.userData.id)});
 built.dispose();return found;
}
assert.deepEqual(ids(fixture,false,true),new Set(['stair-rotated','stair-wide','lift','escalator']));
assert.deepEqual(ids(fixture,true,false),new Set(['bed']));
assert.equal(modelCounts(fixture).furniture,1);
const built=buildPlanScene(fixture,options);
built.root.traverse(o=>{if(!(o instanceof THREE.InstancedMesh))return;const matrix=new THREE.Matrix4();for(let i=0;i<o.count;i++){
 const info=o.userData.picks[i],f=fixture.furniture.find(f=>f.id===info.id)!;
 assert(f);o.getMatrixAt(i,matrix);const angle=f.rotation*Math.PI/180;
 for(const xx of [-.5,.5])for(const yy of [-.5,.5])for(const zz of [-.5,.5]){
  const p=new THREE.Vector3(xx,yy,zz).applyMatrix4(matrix),dx=p.x/built.scale+built.center.x-f.x,dy=p.z/built.scale+built.center.y-f.y;
  assert(Math.abs(dx*Math.cos(angle)+dy*Math.sin(angle))<=f.w/2+.001,`${f.id}: outside footprint X`);
  assert(Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle))<=f.d/2+.001,`${f.id}: outside footprint Y`);
  if(f.rise)assert(p.y<=f.rise+1,`${f.id}: return flight exceeds its stated rise`);
 }
}});
built.dispose();

const models:unknown[]=[];
for(const project of ['dushu','nanjing','hongkong']){
 const plans=JSON.parse(fs.readFileSync(`public/models/${project}.json`,'utf8')) as PlanModel[];
 for(const model of plans){
  const facilities=model.furniture.filter(f=>isCirculation(f.type));
  assert.deepEqual(ids(model,false,true),new Set(facilities.map(f=>f.id)),`${model.id}: missing circulation in scene / export`);
  assert(facilities.every(f=>f.note?.length),`${model.id}: every reviewed facility needs an evidence note`);
  models.push({id:model.id,counts:modelCounts(model),facilities:facilities.map(f=>({id:f.id,type:f.type,evidence:f.evidence,note:f.note})),checks:{independentLayerAndExport:true}});
 }
}
fs.writeFileSync('public/models/circulation-audit.json',JSON.stringify({scope:'Source-image circulation review; geometry, rises and directions are schematic, not surveyed connections.',checks:{rotatedFootprints:true,separateFurnitureAndCirculation:true,doglegRise:true},models},null,2));
console.log(`Circulation checks passed for ${models.length} plans, including independent visibility and export.`);
