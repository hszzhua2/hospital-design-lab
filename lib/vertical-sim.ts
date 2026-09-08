import {hospital} from './projects.ts';
export type Options={fleet:number;dedicated:number;demand:number;floorSeconds:number;publicPerHour:number;bedPerHour:number};
export const DEFAULTS:Options={fleet:4,dedicated:1,demand:1,floorSeconds:4,publicPerHour:360,bedPerHour:24};
export const SEEDS=[13,29,47,71,101,137,179,223,269,317,373,431];
export type Request={id:number;at:number;from:number;to:number;kind:'public'|'bed'};
export type Completion=Request & {pickup:number;completed:number;car:number;wait:number};
export type Run={publicP90:number;bedP90:number;publicMean:number;bedMean:number;served:number;publicCount:number;bedCount:number;trips:number;utilization:number;clearanceMinutes:number;timeline:{minute:number;publicQueue:number;bedQueue:number}[]};
export function validateOptions(o:Options){if(!o||Object.keys(o).some(k=>!Object.keys(DEFAULTS).includes(k))||Object.keys(DEFAULTS).some(k=>!Number.isFinite(o[k as keyof Options])))throw Error('参数必须为有效数字');if(!Number.isInteger(o.fleet)||o.fleet<2||o.fleet>8||!Number.isInteger(o.dedicated)||o.dedicated<1||o.dedicated>=o.fleet||o.demand<.4||o.demand>2||o.floorSeconds<2||o.floorSeconds>10||o.publicPerHour<60||o.publicPerHour>1200||o.bedPerHour<4||o.bedPerHour>120)throw Error('参数超出情景范围');}
function rng(seed:number){let a=seed|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
export function requestsFor(id:string,o:Options,seed:number){validateOptions(o);const h=hospital(id),random=rng(seed),requests:Request[]=[];for(const kind of ['public','bed'] as const){const rate=(kind==='public'?o.publicPerHour:o.bedPerHour)*o.demand,ods=kind==='public'?h.publicOD:h.bedOD;let t=0;while((t+=-Math.log(Math.max(1e-12,1-random()))*3600/rate)<10800){const [from,to]=ods[Math.floor(random()*ods.length)];requests.push({id:requests.length,at:t,from,to,kind});}}return requests.sort((a,b)=>a.at-b.at||a.id-b.id)}
const mean=(a:number[])=>a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN;
const quantile=(a:number[],p:number)=>{if(!a.length)return NaN;const s=[...a].sort((a,b)=>a-b),pos=(s.length-1)*p,lo=Math.floor(pos),hi=Math.ceil(pos);return s[lo]+(s[hi]-s[lo])*(pos-lo)};
export function simulate(id:string,o:Options,requests:Request[],mode:'shared'|'dedicated',includeRecords=false){
 validateOptions(o);const h=hospital(id);type Car={id:number;floor:number;phase:'idle'|'pickup'|'dropoff';at:number;reserved:Request[];busy:number;start:number;trips:number};
 const cars:Car[]=Array.from({length:o.fleet},(_,id)=>({id,floor:h.ground,phase:'idle',at:Infinity,reserved:[],busy:0,start:0,trips:0}));
 const waiting:Request[]=[],records:Completion[]=[],timeline:Run['timeline']=[];let cursor=0,t=0,sample=0,guard=0,maxTime=0;
 const z=(f:number)=>h.knownHeight?(h.floors.find(x=>x.level===f)?.height??(f-h.ground)*4):(f-h.ground)*4;
 const transit=(a:number,b:number)=>Math.abs(z(a)-z(b))/4*o.floorSeconds;
 const eligible=(car:Car,r:Request)=>mode==='shared'||(car.id<o.dedicated?r.kind==='bed':r.kind==='public');
 while(records.length<requests.length){if(++guard>requests.length*8+100)throw Error('事件循环未收敛');const next=Math.min(requests[cursor]?.at??Infinity,...cars.map(c=>c.at));if(!Number.isFinite(next))throw Error('存在无法服务的请求');t=next;
   while(sample<=t&&sample<=10800){timeline.push({minute:sample/60,publicQueue:waiting.filter(r=>r.kind==='public').length,bedQueue:waiting.filter(r=>r.kind==='bed').length});sample+=300;}
   while(cursor<requests.length&&requests[cursor].at<=t+1e-8)waiting.push(requests[cursor++]);
   for(const car of cars){if(car.at>t+1e-8)continue;
     if(car.phase==='pickup'){
       const first=car.reserved[0];if(first.kind==='public')for(let i=0;i<waiting.length&&car.reserved.length<12;){const r=waiting[i];if(r.kind==='public'&&r.from===first.from&&r.to===first.to){car.reserved.push(r);waiting.splice(i,1)}else i++;}
       const load=first.kind==='bed'?40:15,travel=transit(first.from,first.to);
       const done=t+load+travel+15;for(const r of car.reserved)records.push({...r,pickup:t,completed:done,car:car.id,wait:t-r.at});
       car.phase='dropoff';car.floor=first.to;car.at=done;car.busy+=Math.max(0,Math.min(done,10800)-car.start);car.trips++;maxTime=Math.max(maxTime,done);
     }else{car.phase='idle';car.at=Infinity;car.reserved=[];}
   }
   // Dispatch the oldest eligible request to the closest idle eligible car; no speculative future batching.
   while(true){let wi=-1,choice:Car|undefined;for(let i=0;i<waiting.length;i++){const r=waiting[i];const idle=cars.filter(c=>c.phase==='idle'&&eligible(c,r)).sort((a,b)=>Math.abs(a.floor-r.from)-Math.abs(b.floor-r.from)||a.id-b.id);if(idle.length){wi=i;choice=idle[0];break;}}if(wi<0||!choice)break;const r=waiting.splice(wi,1)[0];choice.reserved=[r];choice.phase='pickup';choice.start=t;choice.at=t+transit(choice.floor,r.from)+10;}
 }
 const pub=records.filter(r=>r.kind==='public').map(r=>r.wait),bed=records.filter(r=>r.kind==='bed').map(r=>r.wait);
 const run:Run={publicP90:quantile(pub,.9),bedP90:quantile(bed,.9),publicMean:mean(pub),bedMean:mean(bed),served:records.length,publicCount:pub.length,bedCount:bed.length,trips:cars.reduce((s,c)=>s+c.trips,0),utilization:cars.reduce((s,c)=>s+c.busy,0)/(10800*o.fleet)*100,clearanceMinutes:Math.max(0,maxTime-10800)/60,timeline};
 if(records.length!==requests.length||new Set(records.map(r=>r.id)).size!==requests.length||records.some(r=>r.wait<0||r.completed<=r.pickup))throw Error('完成记录核查失败');
 return {...run,...(includeRecords?{records}:{} )};
}
const metrics=['publicP90','bedP90','publicMean','bedMean','served','publicCount','bedCount','trips','utilization','clearanceMinutes'] as const;
export function experiment(id:string,o:Options=DEFAULTS){validateOptions(o);const runs=SEEDS.map(seed=>{const req=requestsFor(id,o,seed);return {seed,a:simulate(id,o,req,'shared'),b:simulate(id,o,req,'dedicated')}});const avg=(variant:'a'|'b')=>Object.fromEntries(metrics.map(m=>[m,mean(runs.map(r=>r[variant][m]).filter(Number.isFinite))])) as Omit<Run,'timeline'>;
 const critical=[NaN,NaN,12.706,4.303,3.182,2.776,2.571,2.447,2.365,2.306,2.262,2.228,2.201];
 const delta=Object.fromEntries(metrics.map(m=>{const d=runs.map(r=>r.b[m]-r.a[m]).filter(Number.isFinite),mu=mean(d),sd=Math.sqrt(d.reduce((s,x)=>s+(x-mu)**2,0)/(d.length-1)),half=critical[d.length]*sd/Math.sqrt(d.length);return [m,{mean:mu,low:mu-half,high:mu+half,n:d.length}]})) as Record<typeof metrics[number],{mean:number;low:number;high:number;n:number}>;
 return {id,options:{...o},a:avg('a'),b:avg('b'),delta,runs,seedCount:SEEDS.length};
}
