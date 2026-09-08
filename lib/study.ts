import rawRoutes from './routes.json' with {type:'json'};
import f1 from './f1.json' with {type:'json'};
export type Point = number[];
export type Route = {from:string;to:string;distanceM:number;directM:number;minRadiusMm:number;points:Point[]};
export const routes=rawRoutes as Record<string,Route|null>;
export const radii=[100,150,200,250,300,350,400,450];
export const zones:Record<string,{name:string;color:string}>={IMAGING:{name:'影像检查',color:'#b4d8e5'},FUNCTION:{name:'功能检查',color:'#d8cfee'},CLINIC1:{name:'门诊一区',color:'#b6d8c6'},CLINIC2:{name:'门诊二区',color:'#cde5d9'},SUPPORT:{name:'支持用房',color:'#f2dcba'},CORE:{name:'垂直交通',color:'#d2d9e0'}};
export const poi=(id:string)=>{const p=f1.pois.find(x=>x.id===id);if(!p)throw Error('未知到达节点');return p};
export const cases=[
 {id:'outpatient',short:'门诊 · 检查后返回',title:'检查之后，返回原诊区',tag:'跨科联系',description:'需要功能检查、返回原诊区沟通结果，并在首层取药的门诊路径情景。',sequence:['entrance','registration','clinic1','function','clinic1','pharmacy','entrance'],radius:300,speed:60,question:'挂号位置与检查往返，分别增加了多少水平移动？',condition:'假定已有当天门诊安排，需要功能检查、回到原诊区沟通，并有取药需求。并非所有门诊患者都按此流程就诊。',proposal:'若本次所需挂号及支付已完成，且院方允许直接到诊区，略过挂号服务点；保留检查后返回原诊区。',pending:'门诊科别、检查项目、报告返回方式及取药规则待确认。',focus:'clinic1'},
 {id:'imaging',short:'影像 · CT 门前到达',title:'预约 CT，走到检查门前',tag:'医技到达',description:'持有检查申请且满足预约、准备条件的 CT 到达情景。',sequence:['entrance','registration','imaging','ct1','entrance'],radius:300,speed:60,question:'服务办理、影像候诊与 CT 门前之间，哪些移动可以减少？',condition:'假定已取得检查申请并满足预约及准备要求。挂号收费节点只代表一个待确认的现场办理环节，不默认等同于 CT 检查登记。',proposal:'仅在所需检查登记与支付均已完成、院方允许直接报到的前提下，略过该现场办理点；仍经影像候诊节点到 CT 公共侧门前。',pending:'检查登记地点、是否需留观、检查后去向与患者实际出口待确认。',focus:'ct1'},
 {id:'wheelchair',short:'轮椅 · 多目标联系',title:'诊区、MRI 与电梯前室',tag:'包络敏感性',description:'在多个公共到达节点间，探索较大通行包络的路线变化。',sequence:['entrance','registration','clinic2','mri','accessibleLift'],radius:350,speed:36,question:'更大的几何包络，会不会改变原方案的可行路线？',condition:'这是诊区、MRI 筛查准备门前与本层电梯前室的多目标联系测试；待项目方确认是否对应实际患者行程。',proposal:'在完成所需办理且允许直接到达诊区的条件下测试减少往返。同时保持节点顺序，单独比较 300 mm 与较大圆盘半径。',pending:'轮椅长度与转弯、陪护、MRI 安全流程、电梯轿厢与去向楼层均未建模。',focus:'mri'},
];
export type CaseId=typeof cases[number]['id'];
export function chain(sequence:string[],radius:number,speed:number){
 if(!radii.includes(radius)||!Number.isFinite(speed)||speed<20||speed>90)throw Error('参数超出范围');
 const legs=sequence.slice(1).map((id,i)=>{poi(id);poi(sequence[i]);return routes[`${radius}/${sequence[i]}/${id}`]??null;});
 const reachable=legs.every(Boolean),distanceM=reachable?legs.reduce((sum,r)=>sum+r!.distanceM,0):null;
 return {sequence,legs,reachable,distanceM,minutes:distanceM===null?null:distanceM/speed,minRadiusMm:reachable?Math.min(...legs.map(r=>r!.minRadiusMm)):null};
}
export function study(id:string,radius:number,speed:number){
 const c=cases.find(x=>x.id===id);if(!c)throw Error('未知示例');
 const a=chain(c.sequence,radius,speed),b=chain(c.sequence.filter(x=>x!=='registration'),radius,speed);
 const savedM=a.distanceM===null||b.distanceM===null?null:a.distanceM-b.distanceM;
 return {caseId:id,radiusMm:radius,speedMMin:speed,a,b,savedM,savedMinutes:savedM===null?null:savedM/speed,percent:savedM===null||!a.distanceM?null:savedM/a.distanceM*100};
}
export const fmt=(n:number|null|undefined,d=1)=>n==null?'不可达':n.toFixed(d);
export function formatReport(){return ['# F1 首层方案：三组路径情景论证','',`数据来源：${f1.provenance.file}；导入时间 ${f1.provenance.importedAt}。原文件状态：${f1.provenance.status}。`,`源文件 SHA-256：${f1.provenance.sha256}`,'','所有数值对应文件表达的设计方案，不是医院实测。其他楼层和运行数据缺失。三组为同一项目的路径情景，不是三家医院。','',...cases.flatMap(c=>{const s=study(c.id,c.radius,c.speed);return [`## ${c.title}`,c.description,'',`前提：${c.condition}`,`A 路径：${s.a.sequence.map(x=>poi(x).name).join(' → ')}`,`B 路径：${s.b.sequence.map(x=>poi(x).name).join(' → ')}`,`B 适用条件：${c.proposal}`,'',`- 圆盘半径：${c.radius} mm；假设速度：${c.speed} m/min。`,`- A 水平距离：${fmt(s.a.distanceM)} m；B：${fmt(s.b.distanceM)} m。`,`- 条件性省行：${fmt(s.savedM)} m（${fmt(s.percent)}%）；纯移动时间减少 ${fmt(s.savedMinutes,2)} min。`,`- A 路线最小保守包络半径：${s.a.minRadiusMm} mm。`,`- 待确认：${c.pending}`,'','| 圆盘半径 mm | A 路径 m | B 路径 m |','|---|---:|---:|',...radii.map(r=>{const q=study(c.id,r,c.speed);return `| ${r} | ${fmt(q.a.distanceM,3)} | ${fmt(q.b.distanceM,3)} |`;}),''];}),'## 方法与边界','使用原文件内嵌 Navigator，在 200 mm 公共净空栅格上运行八邻接 Dijkstra，禁止斜切角，不借道诊室、设备室或后台。只压缩共线点，保留碰撞约束。','计算 8 个半径 × 13 × 13 个有序节点对，共 1352 条结果（包括自身到自身的零距离）。169 个半径 300 mm 基准值与原文件矩阵核对，误差小于 0.001 m。','所有通行门按有效开启。家具、门禁与人群状态来自固定方案假设。圆盘半径不等于人体或轮椅合规模型；路线保守包络不等于实测走廊净宽。','clinic/function/imaging 为公共候诊点；CT/MRI 为公共侧门前；电梯为本层前室。不包括房内移动、临床操作、排队、检查、等待或乘梯。','纯移动时间=距离/假设速度，不能当作完整就诊时间。B 是有条件的流程提议，未声称项目已采用。',''].join('\n')}
