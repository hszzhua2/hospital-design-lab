export type Floor={level:number;label:string;title:string;functions:string[];status:'documented'|'partial'|'unknown';image?:string;imageNote?:string;sources:string[];note?:string;height?:number};
export type Source={id:string;title:string;url:string;date:string;kind:string;note:string};
export type Journey={id:string;title:string;kind:'public'|'bed'|'logistics';floors:number[];labels:string[];note:string};
export type Hospital={id:string;name:string;short:string;city:string;phase:string;bedLabel:string;areaLabel:string;scope:string;tag:string;floors:Floor[];sources:Source[];notes:string[];journeys:Journey[];publicOD:[number,number][];bedOD:[number,number][];ground:number;knownHeight:boolean;section?:string};
const ds='https://www.ehscare.com/uploads/file/20210902/02575123c8d3d14600b619d72eff53ac.pdf';
const floor=(level:number,title:string,functions:string[],image:string|undefined,sources:string[],note?:string,status:Floor['status']='documented'):Floor=>({level,label:level<0?`B${-level}`:`${level}F`,title,functions,image,sources,note,status});
const dushuFloors=[
 floor(-2,'设备层',['设备间'],undefined,['ds-accept'],'未取得对应平面；不从上层图复制。'),
 floor(-1,'地下后勤层',['核医学 / 放疗 / 高压氧','药品中心 / 病理科','洗衣 / 洁净储存 / 厨房','垃圾中心 / 停尸与告别','能源设备 / 停车'], '/projects/dushu/B1.png',['ds-accept'],'报告在 B1 与 5F 均列病理科，保留原始记载；物流权限与房间点位待核对。'),
 floor(1,'急诊 · 影像 · 首诊',['普通及重症急诊','急诊影像与检验','影像中心','神经科 / 骨科 / 感染科','药房与公共服务','多学科会诊'],'/projects/dushu/F1.png',['ds-accept']),
 floor(2,'门诊 · 医技 · 供应',['泌尿 / 肾内 / 普外 / 心内等门诊','超声 / 心电 / 内镜 / 检验','EICU','消毒供应中心','静脉药物配置','药房与公共服务'],'/projects/dushu/F2.png',['ds-accept']),
 floor(3,'门诊 · 手术 · 围产',['皮肤 / 口腔 / 眼 / 呼吸等门诊','血液透析与体检','手术区','产房 / NICU','药房与公共服务'],'/projects/dushu/F3.png',['ds-accept']),
 floor(4,'手术 · ICU · 管理',['手术区','ICU','血库','信息中心 / 行政 / 图书馆','员工餐厅'],'/projects/dushu/F4.png',['ds-accept']),
 floor(5,'日间 · 病理 · 生活',['日间门诊','病理科','员工生活'],'/projects/dushu/F5.png',['ds-accept']),
 ...[[6,'脊柱 / 关节外科'],[7,'神经内科 / 神经外科'],[8,'妇科 / 产科'],[9,'消化内科 / 普外科'],[10,'呼吸科 / 泌尿科'],[11,'心内 / 心外与介入'],[12,'血液科']].map(([n,t])=>floor(Number(n),'护理单元',[String(t),'病房与护理支持'],`/projects/dushu/F${Number(n)>=8&&Number(n)<=11?'8-11':n}.png`,['ds-accept'],'科别按 2021 验收资料记载；不代表当前科室地址。'))
];
const nanFloors=[floor(1,'首层大厅与公共组织',['多入口 / 中庭 / 垂直交通','具体科室房间对应待核对'],'/projects/nanjing/F1.jpg',['nj-design'],'图纸为 2012 工程发表版本。','partial'),floor(2,'公共层 · 改造项目',['2025 核准新增超声空间','494.67 ㎡改造范围：原馨园餐厅 / 手术等待区','分诊 / 检查 / 推床与座椅等候等'],'/projects/nanjing/F2.jpg',['nj-design','nj-approval'],'图像为原设计平面；2025 批复是后期拟改造依据，不能当作已建成图。','partial'),floor(3,'超声与公共层',['2022 超声科二期投入使用','供稿记载 30 间超声室、3 间介入室','约 2733 ㎡'],'/projects/nanjing/F3.jpg',['nj-design','nj-ultrasound'],'原设计图未定位 2022 科室边界，图像与功能证据分版本展示。','partial'),floor(4,'裙房四层',['剖面确认楼层；具体科室待核验'],undefined,['nj-section'],undefined,'unknown'),floor(5,'裙房五层',['剖面确认楼层；具体科室待核验'],undefined,['nj-section'],undefined,'unknown'),floor(6,'转换与裙房顶层',['主块 F6 +22.60 m','另一裙房屋面标注 +21.60 m'],undefined,['nj-section'],'不同部分标高不同，不按统一层高复制。','partial'),...Array.from({length:8},(_,i)=>floor(i+7,'标准病区',['标准护理单元平面','具体病区科别待核验'],'/projects/nanjing/ward.jpg',['nj-section','nj-design'],'标准图结合剖面确定 7–14F 范围，不代表各层家具和房间配置完全相同。','partial'))];
const elevations:Record<number,number>={1:0,2:4.8,3:9,4:13.2,5:17.4,6:22.6};nanFloors.forEach(f=>{f.height=f.level>=7?28.8+(f.level-7)*3.5:elevations[f.level]});
const hkFunctions:Record<number,[string,string[],string[]]>={0:['急症 · 影像 · 入院',['急症中心','放射影像及介入','入院登记'],['hk-ground']],1:['专科门诊',['专科门诊中心'],['hk-faq']],2:['内镜 · 眼科 · 泌尿',['内镜中心','眼科中心','泌尿中心'],['hk-two']],3:['透析 · 病理',['血液透析中心','病理学部'],['hk-three']],5:['日间手术 · 分娩',['日间手术中心','分娩中心'],['hk-five']],7:['病区与专科服务',['病房：医院历史资料明确','临床神经科学中心'],['hk-seven','hk-ward']]};
const hkFloors=[0,1,2,3,5,7].map(n=>{const info=hkFunctions[n];const f=floor(n,info?.[0]??'楼层资料待补充',info?.[1]??['未获取可核验功能及平面'],n===7?'/projects/hongkong/ward.png':undefined,info?.[2]??['hk-opening'],n===7?'病区图来自 2024 演讲中的疫情分区示例；图内房号与官方 7F 病房资料交叉对应，并非当前常规病区图。':n===5?'此处仅确认日间手术与分娩中心，不将全院 28 间手术室归到 5F。':undefined,info?'documented':'unknown');f.label=n===0?'G/F':`${n}/F`;return f;});
export const hospitals:Hospital[]=[
 {id:'dushu',name:'苏州市独墅湖医院 · 一期',short:'独墅湖医院',city:'苏州',phase:'2021 验收资料 / 2020 建成一期',bedLabel:'800 床',areaLabel:'13.1 万㎡',scope:'床位与 13.1 万㎡采用一期公开口径；验收报告另列 123802 ㎡，保留定义差异。',tag:'五层裙房 + 十二层病房楼',floors:dushuFloors,ground:1,knownHeight:false,section:'/projects/dushu/section.jpg',sources:[
 {id:'ds-accept',title:'一期竣工环境保护验收监测报告',url:ds,date:'2021',kind:'验收报告',note:'PDF 第 25–26 页项目组成与实际楼层功能；第 13–22 页为各层消防栓分布平面。图中房间文字清晰度有限。'},
 {id:'ds-design',title:'LEMANARC 设计方供稿 · 独墅湖一期',url:'https://www.gooood.cn/suzhou-dushu-lake-hospital-china-by-lemanarc-sa.htm',date:'2021-07',kind:'建筑师发表',note:'一期 131000 ㎡ / 800 床；公共环路、外围医护通道及双人字病区设计组织。建筑师图与验收图存在版本差异。'}],notes:['通过医疗街和多个交通核连接门急诊、医技与住院功能，不能用一个房间中心点替代一个科室。','2F 消毒供应与 3–4F 手术、4F ICU 之间存在跨层服务关系；门禁、清洁物流与污物回收的实际通道需专项图核实。','5F 和上部病区的形态与低区裙房明显不同，楼层图分别保留。'],journeys:[
 {id:'outpatient',title:'门诊—影像—返回',kind:'public',floors:[1,2,1,2,1],labels:['首层到达','2F 门诊','1F 影像','2F 返回原诊区','首层离开'],note:'假定需影像检查并返回诊区；预约、检查与报告流程不是源报告的运营记录。'},
 {id:'bed',title:'病区—影像往返',kind:'bed',floors:[8,1,8],labels:['8F 护理单元','1F 影像','8F 返回'],note:'用一个护理层测试推床联系，未将所有患者或检查都视为必须转运。'},
 {id:'logistics',title:'消毒供应—手术联系',kind:'logistics',floors:[2,4],labels:['2F 消毒供应','4F 手术区'],note:'表示功能层间联系；清洁与污物应分别核验，未据此宣称共用梯或洁污合规。'}],publicOD:[[1,2],[2,1],[1,3],[3,1],[2,3],[3,2]],bedOD:[[6,1],[1,6],[8,1],[1,8],[10,1],[1,10],[12,1],[1,12]]},
 {id:'nanjing',name:'南京鼓楼医院 · 南扩工程',short:'南京鼓楼医院',city:'南京',phase:'2012 建成设计 + 2022 / 2025 后期资料',bedLabel:'新增 1600 床',areaLabel:'23 万㎡',scope:'床位为南扩新增规模，面积为工程公开口径；不等于当前全院床位和面积。',tag:'5F 门诊 / 6F 医技 / 14F 住院',floors:nanFloors,ground:1,knownHeight:true,section:'/projects/nanjing/section.jpg',sources:[
 {id:'nj-design',title:'南京鼓楼医院 · 建筑师项目发表',url:'https://www.archdaily.com/461173/nanjing-drum-tower-hospital-lemanarc-sa',date:'2013-12',kind:'建筑师发表',note:'LEMANARC 图纸与设计说明；230000 ㎡，南扩新增 1600 床。1–3F 与标准层按图内标题识别，图库英文命名有错位。'},
 {id:'nj-section',title:'南京鼓楼医院 · 剖面 1–1',url:'https://www.archdaily.com/461173/nanjing-drum-tower-hospital-lemanarc-sa/52b385d3e8e44e5f02000086-nanjing-drum-tower-hospital-lemanarc-sa-section-1-1',date:'2013-12',kind:'建筑师图纸',note:'剖面标高确认 F7 +28.80 m 至 F14 +53.30 m，标准病区层高 3.5 m；低区层高不统一。'},
 {id:'nj-ultrasound',title:'医院供稿 · 超声科二期工程完工',url:'https://njwshgxh.cn/news/show-1941.aspx',date:'2022-09-27',kind:'医院供稿',note:'南京市卫生系统后勤管理协会刊载，末尾注明南京鼓楼医院供稿；南扩楼 3F 超声科二期已投入使用。'},
 {id:'nj-approval',title:'南京市发改委 · 超声检查室改造核准',url:'https://fgw.nanjing.gov.cn/njsfzhggwyh/202506/t20250624_5592581.html',date:'2025-06-24',kind:'改造核准',note:'10 号南扩楼 2F 东北角改造 494.67 ㎡；核准文件不是完工证明。'}],notes:['老院与南扩大楼相互衔接，多庭院公共基座与上部病房组合，交通核不只一组。','超声空间在 2022 与 2025 资料中发生变化；页面把原设计图、运营供稿与拟改造范围分别标记。','标准病区与裙房的轮廓、标高和组织不同。尚无可靠当前科室到房间的一一对应表。'],journeys:[
 {id:'outpatient',title:'到达—3F 超声—离开',kind:'public',floors:[1,3,1],labels:['首层到达','3F 超声服务','首层离开'],note:'2022 供稿确认超声在 3F。假定已满足检查申请、登记与准备条件。'},
 {id:'bed',title:'病区—超声往返',kind:'bed',floors:[10,3,10],labels:['10F 标准病区','3F 超声','10F 返回'],note:'仅测试层间运输；是否床旁检查、实际病区与受控通道需医院确认。'},
 {id:'relocation',title:'2F 新增超声的联系测试',kind:'public',floors:[2,3,2],labels:['2F 服务节点','既有 3F 超声','返回 2F'],note:'若符合条件的检查可在拟改造 2F 完成，这一假设往返链可减少 2 次换层。不能把核准当作已实施。'}],publicOD:[[1,3],[3,1],[1,2],[2,1],[2,3],[3,2]],bedOD:[[7,3],[3,7],[10,3],[3,10],[12,3],[3,12],[14,3],[3,14]]},
 {id:'hongkong',name:'香港中文大学医院 · 沙田',short:'香港中文大学医院',city:'香港',phase:'2021 开院口径 + 官方中心地址 / 历史病区图',bedLabel:'516 + 90 床',areaLabel:'10 万㎡',scope:'516 住院床 + 90 日间床，开院公告口径；官方称 14 层，楼层编号按香港习惯保留。',tag:'六个已核实功能层级',floors:hkFloors,ground:0,knownHeight:false,sources:[
 {id:'hk-opening',title:'医院正式投入服务公告',url:'https://www.cuhkmc.hk/sc/press-release/cuhk-medical-centre-opens-today',date:'2021-01-06',kind:'医院公告',note:'14 层、100000 ㎡、516 住院床及 90 日间床；不将当期全部设计容量等同首日开放量。'},
 {id:'hk-ground',title:'放射影像及介入中心 · 医院官网',url:'https://www.cuhkmc.hk/medical-centres-allied-health/imaging-and-interventional-radiology-centre',date:'访问 2026-09-08',kind:'医院地址',note:'影像中心在 G/F；急症和入院地址见医院相关服务页。'},
 {id:'hk-faq',title:'医院常见问题 · 专科门诊地址',url:'https://www.cuhkmc.hk/tc/knowing-us/faq',date:'访问 2026-09-08',kind:'医院地址',note:'专科门诊在 1/F。'},
 {id:'hk-two',title:'内镜中心 · 医院官网',url:'https://www.cuhkmc.hk/tc/centres/endoscopy-centre',date:'访问 2026-09-08',kind:'医院地址',note:'内镜在 2/F；同层眼科、泌尿分别依据对应官方中心页。'},
 {id:'hk-three',title:'香港政府 HOKLAS · 病理学部认证地址',url:'https://www.itc.gov.hk/en/quality/hkas/doc/scopes/858P.pdf',date:'访问 2026-09-08',kind:'政府认证',note:'PDF 第 1 页地址为 Level 3；透析中心同层另有官网地址。'},
 {id:'hk-five',title:'日间手术中心 · 医院官网',url:'https://www.cuhkmc.hk/sc/medical-centres-allied-health/day-surgery-centre',date:'访问 2026-09-08',kind:'医院地址',note:'5/F。分娩中心同层另有官网地址；不推断全院手术室所在层。'},
 {id:'hk-seven',title:'7 楼病房历史说明 · 医院官网',url:'https://www.cuhkmc.hk/page/detail/4102',date:'疫情时期资料',kind:'医院历史说明',note:'确认 7 楼病房及分隔的日间负压区域，不声称当前继续该用途。'},
 {id:'hk-ward',title:'Hong Fung · 公开会议演讲病区图',url:'https://internationalforum.bmj.com/wp-content/uploads/2024/09/S19_-Digital-Connectivity-and-IoT-in-Improving-Flow-and-Logistics_Hong-Fung.pptx.pdf#page=27',date:'2024-08-28',kind:'医院管理者演讲',note:'第 27 页疫情病区分区图。根据房号与官方病房资料交叉对应 7F；无米制标尺。'}],notes:['已核实 G/F、1/F、2/F、3/F、5/F、7/F 功能。其余楼层的编号、用途和平面未补造。','仅 7F 有公开病区拓扑图；其余层显示有来源的功能关系，不用病区图复制成全楼平面。','病例、标本、供应与公共就诊具有不同到达权限。图中连线表示关系，不视为现场可直接通行。'],journeys:[
 {id:'outpatient',title:'专科—影像—返回',kind:'public',floors:[0,1,0,1,0],labels:['G/F 到达','1/F 专科','G/F 影像','1/F 返回','G/F 离开'],note:'按官方中心楼层构造需影像后返回专科的情景；不是医院公布的统一患者流程。'},
 {id:'bed',title:'7F 病区—影像往返',kind:'bed',floors:[7,0,7],labels:['7/F 病区','G/F 影像','7/F 返回'],note:'用于层间联系研究。病区图是历史分区状态，当前权限与转运规则未核实。'},
 {id:'logistics',title:'病区—病理标本联系',kind:'logistics',floors:[7,3],labels:['7/F 病区','3/F 病理'],note:'只表示来源明确的科室层级关系，未假定标本与患者乘用同一梯。'}],publicOD:[[0,1],[1,0],[0,2],[2,0],[1,2],[2,1],[0,3],[3,0],[0,5],[5,0]],bedOD:[[7,0],[0,7],[7,5],[5,7]]}
];
// Keep each additional centre address traceable rather than attaching every floor claim to one article.
const hkExtra:{id:string;title:string;url:string;level:number}[]=[
 {id:'hk-emergency',title:'急症中心 · 官方地址',url:'https://www.cuhkmc.hk/tc/medical-centres-allied-health/emergency-medicine-centre',level:0},
 {id:'hk-admission',title:'入院程序 · 官方地址',url:'https://www.cuhkmc.hk/sc/hospital-service/inpatient-services/admission-procedure',level:0},
 {id:'hk-eye',title:'眼科中心 · 官方地址',url:'https://www.cuhkmc.hk/sc/medical-centres-allied-health/eye-centre',level:2},
 {id:'hk-urology',title:'泌尿中心 · 官方地址',url:'https://www.cuhkmc.hk/medical-centres-allied-health/urology-centre',level:2},
 {id:'hk-dialysis',title:'血液透析中心 · 官方地址',url:'https://www.cuhkmc.hk/sc/medical-centres-allied-health/haemodialysis-centre',level:3},
 {id:'hk-delivery',title:'分娩中心 · 官方地址',url:'https://www.cuhkmc.hk/tc/medical-centres-allied-health/labour-and-delivery-centre',level:5},
 {id:'hk-neuro',title:'临床神经科学中心 · 官方地址',url:'https://www.cuhkmc.hk/sc/medical-centres-allied-health/clinical-neuroscience-centre',level:7}
];
for(const s of hkExtra){const h=hospitals[2];h.sources.push({id:s.id,title:s.title,url:s.url,date:'访问 2026-09-08',kind:'医院中心地址',note:`为 ${s.level===0?'G/F':s.level+'/F'} 功能提供直接医院地址依据。`});h.floors.find(f=>f.level===s.level)!.sources.push(s.id);}
export const hospital=(id:string)=>{const p=hospitals.find(x=>x.id===id);if(!p)throw Error('未知医院项目');return p};
export function journeyStats(j:Journey){return {rides:j.floors.slice(1).filter((f,i)=>f!==j.floors[i]).length,levelIntervals:j.floors.slice(1).reduce((s,f,i)=>s+Math.abs(f-j.floors[i]),0)}}
