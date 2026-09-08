'use client';
import {publicUrl} from '@/lib/public-url';
import {useState} from 'react';
import {svgImageFallback} from './source-image';
import {type PlanModel,type Furnishing,roomColors,furnitureNames,isCirculation,furnishingDetail} from '@/lib/plan-model';
import {type PickInfo,type SceneOptions} from '@/lib/plan-scene';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import {Minus,Plus,Focus} from 'lucide-react';

function CirculationSymbol({f,color}:{f:Furnishing;color:string}){
 let w=f.w,d=f.d,turn=0;
 if(f.type==='stair'&&!f.stairLayout&&w>d){[w,d]=[d,w];turn=90}
 const tread=(x:number,width:number)=><>{Array.from({length:11},(_,i)=><line key={i} x1={x-width/2} x2={x+width/2} y1={-d*.31+i*d*.062} y2={-d*.31+i*d*.062}/>)}</>;
 return <g transform={`rotate(${turn})`} fill="none" stroke={color} strokeWidth={Math.max(.65,Math.min(w,d)*.035)}>
  <rect x={-w/2} y={-d/2} width={w} height={d} fill="#f3f8fa" fillOpacity=".9"/>
  {f.type==='lift'?<>
   <rect x={-w*.36} y={-d*.37} width={w*.72} height={d*.7}/>
   <path d={`M ${-w*.30} ${-d*.31} L ${w*.30} ${d*.27} M ${w*.30} ${-d*.31} L ${-w*.30} ${d*.27}`} opacity=".65"/>
   <path d={`M ${-w*.32} ${d*.44} h ${w*.30} M ${w*.02} ${d*.44} h ${w*.30}`} strokeWidth={Math.max(1,w*.07)}/>
  </>:f.type==='escalator'?<>
   <rect x={-w*.34} y={-d*.34} width={w*.68} height={d*.68}/>
   {tread(0,w*.66)}
   <path d={`M ${-w*.43} ${-d*.46} V ${d*.46} M ${w*.43} ${-d*.46} V ${d*.46}`} strokeWidth={w*.09}/>
   <path d={`M ${-w*.29} ${-d*.43} H ${w*.29} M ${-w*.29} ${d*.43} H ${w*.29}`} stroke="#d99e35"/>
  </>:f.stairLayout==='dogleg'?<>
   {tread(-w*.255,w*.43)}{tread(w*.255,w*.43)}
   <line x1="0" x2="0" y1={-d*.32} y2={d*.32}/>
   <path d={`M ${-w*.255} ${-d*.25} V ${d*.37} H ${w*.255} V ${-d*.25}`} strokeDasharray={`${w*.08} ${w*.05}`}/>
  </>:<>{tread(0,w*.88)}<line x1="0" x2="0" y1={-d*.4} y2={d*.4} strokeDasharray={`${w*.08} ${w*.05}`}/></>}
 </g>;
}

export function PlanOverlay({model,options,onPick}:{model:PlanModel;options:SceneOptions;onPick:(p:PickInfo|null)=>void}){
 const [zoom,setZoom]=useState(1),[opacity,setOpacity]=useState(.65);
 const lines=(p:number[][])=>p.map(a=>a.join(',')).join(' ');
 return <><div className="overlay-toolbar"><span>底图透明度</span><Slider aria-label="底图透明度" min={0} max={1} step={.05} value={[opacity]} onValueChange={v=>setOpacity(Array.isArray(v)?v[0]:v)}/><Button variant="ghost" size="icon" aria-label="缩小描图" onClick={()=>setZoom(Math.max(1,zoom-.5))}><Minus/></Button><span>{zoom.toFixed(1)}×</span><Button variant="ghost" size="icon" aria-label="放大描图" onClick={()=>setZoom(Math.min(6,zoom+.5))}><Plus/></Button><Button variant="ghost" size="icon" aria-label="整张描图" onClick={()=>setZoom(1)}><Focus/></Button></div>
 <div className="model-overlay-scroll"><svg viewBox={`0 0 ${model.width} ${model.height}`} style={{width:`${zoom*100}%`,maxWidth:'none'}} role="img" aria-label={`${model.label} 墙体、家具及扶梯电梯楼梯平面核对`}>
  <image onError={svgImageFallback} href={publicUrl(model.image)} width={model.width} height={model.height} opacity={opacity}/>
  {options.rooms&&model.rooms.map(r=><polygon key={r.id} points={lines(r.polygon)} fill={roomColors[r.kind]} fillOpacity=".2" stroke="#438699" strokeWidth=".7" onClick={()=>onPick({kind:'room',id:r.id,label:r.label,evidence:r.evidence})}><title>{r.label}</title></polygon>)}
  {model.walls.map((w,i)=><line key={i} x1={w.a[0]} y1={w.a[1]} x2={w.b[0]} y2={w.b[1]} stroke={w.evidence==='inferred'?'#b68746':'#2e6479'} strokeWidth={Math.max(1.4,w.thickness??1.4)} strokeOpacity=".75"/>)}
  {model.openings.filter(o=>options.inferred||o.evidence!=='inferred').map((o,i)=><line key={i} x1={o.a[0]} y1={o.a[1]} x2={o.b[0]} y2={o.b[1]} stroke={o.kind==='door'?'#de9e4c':'#3ab0c4'} strokeWidth="3.5"/>)}
  {model.furniture.filter(f=>(isCirculation(f.type)?options.circulation!==false:options.furniture)&&(options.inferred||f.evidence!=='inferred')).map(f=>{
   const circulation=isCirculation(f.type),color=options.byEvidence&&f.evidence==='inferred'?'#a16f28':'#1a7885';
   const pick=()=>onPick({kind:circulation?'circulation':'furniture',id:f.id,label:furnitureNames[f.type],evidence:f.evidence,furnitureType:f.type,roomId:f.roomId,detail:furnishingDetail(f)});
   return <g key={f.id} transform={`translate(${f.x} ${f.y}) rotate(${f.rotation})`} onClick={pick} role={circulation?'button':undefined} tabIndex={circulation?0:undefined} aria-label={circulation?`${furnitureNames[f.type]} ${f.id}`:undefined} onKeyDown={e=>{if(circulation&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick()}}}>
    {circulation?<CirculationSymbol f={f} color={color}/>:<><rect x={-f.w/2} y={-f.d/2} width={f.w} height={f.d} rx={Math.min(f.w,f.d)*.12} fill={color} fillOpacity=".6" stroke={color} strokeWidth=".8"/>{['bed','exam','operating'].includes(f.type)&&<rect x={f.w>f.d?f.w*.25:-f.w*.35} y={f.w>f.d?-f.d*.35:-f.d*.4} width={f.w>f.d?f.w*.15:f.w*.7} height={f.w>f.d?f.d*.7:f.d*.15} rx="1" fill="white"/>}</>}
    <title>{furnitureNames[f.type]} · {f.evidence==='inferred'?'推定':'图示'} · {f.id}</title>
   </g>;
  })}
 </svg></div></>;
}
