import * as THREE from 'three';
import {type PlanModel,type Point,modelBounds,roomColors,furnitureNames,isCirculation,furnishingDetail} from './plan-model.ts';

export type SceneOptions={wallHeight:number;furniture:boolean;circulation?:boolean;inferred:boolean;byEvidence:boolean;rooms:boolean};
export type PickInfo={kind:'room'|'furniture'|'circulation'|'wall'|'opening';id:string;label:string;evidence:string;detail?:string;furnitureType?:string;roomId?:string};
type Part={matrix:THREE.Matrix4;info:PickInfo};
export function buildPlanScene(model:PlanModel,opt:SceneOptions){
 const root=new THREE.Group();root.name=model.id;root.userData={sourceImage:model.image,scaleStatus:model.scaleStatus,scaleNote:model.scaleNote,notes:model.notes,displayWallHeight:opt.wallHeight,scope:'Image-traced approximate study model. Heights and inferred furniture are not surveyed facts.'};
 const bounds=modelBounds(model),cx=(bounds.minX+bounds.maxX)/2,cy=(bounds.minY+bounds.maxY)/2,s=model.unitsPerPixel;
 const xy=(p:Point):[number,number]=>[(p[0]-cx)*s,(p[1]-cy)*s];
 const size=Math.max(bounds.maxX-bounds.minX,bounds.maxY-bounds.minY)*s;Object.assign(root.userData,{imageSize:[model.width,model.height],unitsPerPixel:s,pixelCenter:[cx,cy],levels:model.levels,axes:"Y up; X image-right; Z image-down"});
 const buckets=new Map<string,{parts:Part[];color:string;layer:string}>(),layerGroups=new Map<string,THREE.Group>();
 const group=(name:string)=>{let g=layerGroups.get(name);if(!g){g=new THREE.Group();g.name=name;layerGroups.set(name,g);root.add(g)}return g};
 const materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[];
 const material=(color:string)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.04});materials.push(m);return m};
 const box=(layer:string,color:string,x:number,y:number,z:number,w:number,h:number,d:number,angle:number,info:PickInfo)=>{if(w<=0||h<=0||d<=0)return;const key=layer+'-'+color;if(!buckets.has(key))buckets.set(key,{parts:[],color,layer});buckets.get(key)!.parts.push({matrix:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle),new THREE.Vector3(w,h,d)),info})};
 const shape=(polygon:Point[],holes:Point[][]=[])=>{const sh=new THREE.Shape();polygon.forEach((p,i)=>{const [x,z]=xy(p);if(i===0)sh.moveTo(x,-z);else sh.lineTo(x,-z)});sh.closePath();for(const hole of holes){const path=new THREE.Path();hole.forEach((p,i)=>{const [x,z]=xy(p);if(i===0)path.moveTo(x,-z);else path.lineTo(x,-z)});path.closePath();sh.holes.push(path)}return sh};
 for(const slab of model.slabs){const geo=new THREE.ExtrudeGeometry(shape(slab.outline,slab.holes??[]),{depth:.18,bevelEnabled:false,curveSegments:1});geo.rotateX(-Math.PI/2);geo.translate(0,-.18,0);geometries.push(geo);const mesh=new THREE.Mesh(geo,material('#f4f5f4'));mesh.name='Floor slab';mesh.receiveShadow=true;group('slabs').add(mesh);}
 if(opt.rooms)for(const room of model.rooms){const geo=new THREE.ShapeGeometry(shape(room.polygon));geo.rotateX(-Math.PI/2);geo.translate(0,.008,0);geometries.push(geo);const mesh=new THREE.Mesh(geo,material(roomColors[room.kind]??'#e8ecef'));mesh.name=room.label;mesh.userData.pick={kind:'room',id:room.id,label:room.label,evidence:room.evidence,detail:'房间边界为图像参考描绘；功能名称不等于已核实科室。'} satisfies PickInfo;mesh.receiveShadow=true;group('rooms').add(mesh)}
 // Cut door and window intervals out of traced wall segments. Openings never merely cover a solid wall.
 model.walls.forEach((wall,wi)=>{const [ax,az]=xy(wall.a),[bx,bz]=xy(wall.b),len=Math.hypot(bx-ax,bz-az);if(len<.02)return;const ux=(bx-ax)/len,uz=(bz-az)/len,angle=-Math.atan2(uz,ux),thick=wall.thickness?wall.thickness*s:.19;
  const cuts:{lo:number;hi:number;kind:string}[]=[];
  for(const o of model.openings){const [ox,oz]=xy(o.a),[ex,ez]=xy(o.b),t0=(ox-ax)*ux+(oz-az)*uz,t1=(ex-ax)*ux+(ez-az)*uz;const e0=Math.abs((ox-ax)*uz-(oz-az)*ux),e1=Math.abs((ex-ax)*uz-(ez-az)*ux);if(Math.max(e0,e1)<Math.max(.16,thick)&&Math.max(t0,t1)>0&&Math.min(t0,t1)<len){cuts.push({lo:Math.max(0,Math.min(t0,t1)),hi:Math.min(len,Math.max(t0,t1)),kind:o.kind})}}
  const values=[0,len,...cuts.flatMap(c=>[c.lo,c.hi])].sort((a,b)=>a-b);const info:PickInfo={kind:'wall',id:`wall-${wi}`,label:'墙体参考段',evidence:wall.evidence,detail:'平面位置据源图拟合，厚度与高度用于模型显示，待 CAD 校核。'};
  for(let k=1;k<values.length;k++){const lo=values[k-1],hi=values[k],mid=(lo+hi)/2;if(hi-lo<.005)continue;const overlap=cuts.filter(c=>c.lo<mid&&c.hi>mid),door=overlap.some(c=>c.kind==='door'),window=overlap.length&&!door;
   const part=(bottom:number,top:number)=>{const h=Math.min(top,opt.wallHeight)-bottom;if(h>0)box('walls','#cbd7dc',ax+ux*mid,bottom+h/2,az+uz*mid,hi-lo,h,thick,angle,info)};
   if(door)part(2.15,opt.wallHeight);else if(window){part(0,.85);part(2.2,opt.wallHeight)}else part(0,opt.wallHeight);
  }
 });
 for(const [i,o] of model.openings.entries()){if(o.evidence==='inferred'&&!opt.inferred)continue;const [x,z]=xy(o.a),[ex,ez]=xy(o.b),len=Math.hypot(ex-x,ez-z),angle=-Math.atan2(ez-z,ex-x);const info:PickInfo={kind:'opening',id:`opening-${i}`,label:o.kind==='door'?'门洞 / 开启位置':'窗带示意',evidence:o.evidence,detail:'门窗高程与构造为示意；未进行通行净宽校核。'};
  if(o.kind==='window'){const h=Math.max(0,Math.min(2.15,opt.wallHeight)-.88);if(h>0)box('openings','#7caebc',(x+ex)/2,.88+h/2,(z+ez)/2,len,h,.04,angle,info)}
  else {box('openings',o.evidence==='inferred'&&opt.byEvidence?'#c99755':'#6299a8',(x+ex)/2,.025,(z+ez)/2,len,.05,.19,angle,info);}
 }
 for(const f of model.furniture){const circulation=isCirculation(f.type);if(circulation?opt.circulation===false:!opt.furniture)continue;if(!opt.inferred&&f.evidence==='inferred')continue;const [x,z]=xy([f.x,f.y]);let w=f.w*s,d=f.d*s,a=f.rotation*Math.PI/180;if(w>d&&(["bed","exam","operating","scanner","toilet"].includes(f.type)||(f.type==="stair"&&!f.stairLayout))){[w,d]=[d,w];a+=Math.PI/2}const accent=opt.byEvidence?(f.evidence==='symbol'?'#2a8897':'#c2904e'):'#4f95a3',light='#f7f7f2',frame='#99a8b0',dark='#4e626e';
  const info:PickInfo={kind:circulation?'circulation':'furniture',id:f.id,label:furnitureNames[f.type]??f.type,evidence:f.evidence,furnitureType:f.type,roomId:f.roomId,detail:furnishingDetail(f)};
  const part=(dx:number,dz:number,width:number,depth:number,h:number,y:number,color:string)=>box(circulation?'circulation':'furniture',color,x+dx*Math.cos(a)-dz*Math.sin(a),y,z+dx*Math.sin(a)+dz*Math.cos(a),Math.min(width,Math.max(0,w-2*Math.abs(dx))),h,Math.min(depth,Math.max(0,d-2*Math.abs(dz))),-a,info);
  const legs=(height:number)=>{for(const xx of [-.38,.38])for(const zz of [-.38,.38])part(w*xx,d*zz,.055,.055,height,height/2,frame)};
  if(['bed','exam','operating'].includes(f.type)){const high=f.type==='bed'?.56:.78;part(0,0,w*.88,d*.92,.13,high-.15,frame);part(0,0,w*.84,d*.89,.19,high,light);part(0,-d*.31,w*.69,d*.19,.085,high+.135,light);part(0,d*.1,w*.85,d*.44,.03,high+.108,accent);if(f.type==='bed'){part(0,-d*.46,w,.07,.46,high+.1,accent);part(0,d*.46,w,.06,.32,high-.03,frame);for(const xx of [-.49,.49])part(w*xx,0,.045,d*.56,.035,high+.18,frame)}legs(high-.19)}
  else if(f.type==='chair'||f.type==='sofa'){part(0,0,w,d*.9,.11,.45,accent);part(0,-d*.42,w,d*.12,.44,.68,accent);legs(.4);if(f.type==='sofa')for(const xx of [-.46,.46])part(w*xx,0,w*.08,d,.2,.53,accent)}
  else if(f.type==='desk'){part(0,0,w,d,.07,.76,light);legs(.72);part(w*.26,d*.05,w*.2,d*.68,.58,.35,frame);part(-w*.15,-d*.17,w*.24,.045,.24,.91,dark)}
  else if(f.type==='cabinet'||f.type==='counter'){const h=f.type==='counter'?1.03:(f.yHeight??1.5);part(0,0,w,d,h,h/2,light);part(0,0,w*1.01,d*1.02,.04,h,accent);if(f.type==='cabinet')part(0,d*.505,.025,.02,h*.8,h/2,frame);else part(0,d*.505,w*.9,.025,.19,h*.7,accent)}
  else if(f.type==='sink'){part(0,0,w,d,.16,.78,light);part(0,0,w*.57,d*.53,.012,.865,'#82a6ad');part(0,-d*.31,.04,.04,.15,.94,frame)}
  else if(f.type==='toilet'){part(0,d*.1,w*.73,d*.67,.37,.215,light);part(0,d*.08,w*.58,d*.49,.018,.41,'#a7bfc4');part(0,-d*.34,w*.83,d*.24,.59,.34,light)}
  else if(f.type==='scanner'){part(0,-d*.18,w,d*.37,1.65,.825,light);part(0,-d*.19,w*.58,d*.38,.6,.96,accent);part(0,d*.15,w*.37,d*.70,.15,.65,light);part(0,d*.20,w*.24,d*.6,.48,.32,frame)}
  else if(f.type==='stair'){
   const rise=f.rise??Math.min(3.2,d*.65),dogleg=f.stairLayout==='dogleg',landing=d*.18,run=d-2*landing,steps=12;
   part(0,-d/2+landing/2,w,landing,.08,.04,light);
   const flight=(xx:number,width:number,reverse:boolean,bottom:number,climb:number)=>{for(let i=0;i<steps;i++){const dz=-run/2+run*(i+.5)/steps,h=bottom+climb*(reverse?steps-i:i+1)/steps;part(xx,dz,width,run/steps,.12,h-.06,frame);part(xx,dz-run/steps*.45,width,run/steps*.08,.025,h+.01,accent);for(const side of [-1,1])part(xx+side*width*.45,dz,width*.06,run/steps,.035,h+.83,dark)}for(const j of [0,steps-1]){const dz=-run/2+run*(j+.5)/steps,h=bottom+climb*(reverse?steps-j:j+1)/steps;for(const side of [-1,1])part(xx+side*width*.45,dz,width*.05,run/steps*.35,.82,h+.41,frame)}};
   if(dogleg){flight(-w*.255,w*.46,false,0,rise/2);part(0,d/2-landing/2,w,landing,.15,rise/2-.075,light);flight(w*.255,w*.46,true,rise/2,rise/2);part(w*.255,-d/2+landing/2,w*.46,landing,.15,rise-.075,light);
   }else{flight(0,w*.9,false,0,rise);part(0,d/2-landing/2,w,landing,.15,rise-.075,light)}
  }
  else if(f.type==='escalator'){
   const rise=f.rise??Math.min(3.2,d*.4),run=d*.66,landing=d*.17,steps=28;
   part(0,-d/2+landing/2,w,landing,.12,.06,frame);part(0,d/2-landing/2,w,landing,.12,rise+.06,frame);
   for(let i=0;i<steps;i++){const dz=-run/2+run*(i+.5)/steps,h=rise*(i+.5)/steps;part(0,dz,w*.64,run/steps,.1,h+.07,frame);part(0,dz-run/steps*.42,w*.64,run/steps*.1,.015,h+.127,'#ead578');for(const side of [-1,1]){part(side*w*.41,dz,w*.12,run/steps,.72,h+.48,accent);part(side*w*.41,dz,w*.14,run/steps,.055,h+.87,dark)}}
   for(const [dz,h] of [[-d/2+landing/2,0],[d/2-landing/2,rise]])for(const side of [-1,1]){part(side*w*.41,dz,w*.12,landing,.72,h+.48,accent);part(side*w*.41,dz,w*.14,landing,.055,h+.87,dark)}
  }
  else if(f.type==='lift'){
   const h=Math.max(.45,Math.min(opt.wallHeight,2.5)),doorHeight=Math.min(h,2.1);
   part(0,0,w,d,.055,.035,accent);for(const xx of [-.475,.475])part(w*xx,0,w*.05,d,h,h/2,frame);part(0,-d*.475,w,d*.05,h,h/2,frame);
   for(const side of [-1,1]){part(side*w*.415,d*.455,w*.12,d*.07,h,h/2,frame);part(side*w*.155,d*.40,w*.30,d*.045,doorHeight*.84,doorHeight*.42+.04,light)}
   part(0,d*.403,w*.018,d*.05,doorHeight*.78,doorHeight*.41+.04,dark);part(0,d*.45,w*.74,d*.09,.07,doorHeight+.035,accent);part(w*.36,d*.495,w*.065,d*.01,.14,Math.min(.95,h*.68),'#e6c369');
  }
 }
 const unit=new THREE.BoxGeometry(1,1,1);geometries.push(unit);
 for(const {parts,color,layer} of buckets.values()){const mesh=new THREE.InstancedMesh(unit,material(color),parts.length);mesh.name=layer+' '+color;for(let i=0;i<parts.length;i++)mesh.setMatrixAt(i,parts[i].matrix);mesh.userData.picks=parts.map(p=>p.info);mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=layer!=='openings';mesh.receiveShadow=true;mesh.computeBoundingSphere();group(layer).add(mesh)}
 return {root,size,center:{x:cx,y:cy},scale:s,dispose:()=>{for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}};
}

// Mesh expansion retains per-object evidence in a widely importable glTF without requiring instancing extensions.
export function exportableScene(source:THREE.Group){const out=new THREE.Group();out.name=source.name;out.userData={...source.userData};source.updateMatrixWorld(true);source.traverse(obj=>{if(obj instanceof THREE.InstancedMesh){const matrix=new THREE.Matrix4();for(let i=0;i<obj.count;i++){obj.getMatrixAt(i,matrix);const mesh=new THREE.Mesh(obj.geometry,obj.material);mesh.matrixAutoUpdate=false;mesh.matrix.multiplyMatrices(obj.matrixWorld,matrix);mesh.userData={...obj.userData.picks?.[i]};mesh.name=mesh.userData.id??obj.name;out.add(mesh)}}else if(obj instanceof THREE.Mesh){const mesh=new THREE.Mesh(obj.geometry,obj.material);mesh.matrixAutoUpdate=false;mesh.matrix.copy(obj.matrixWorld);mesh.name=obj.name;mesh.userData={...(obj.userData.pick??obj.userData)};out.add(mesh)}});return out;}



