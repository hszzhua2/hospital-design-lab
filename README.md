# Hospital Design Lab · 综合医院设计研究

基于公开真实项目的医院平面建模、家具表达与跨层交通实验工具。使用 TypeScript、React、Three.js 和 Vinext 构建。

软件采用 [MIT License](LICENSE)。第三方图纸、依赖和案例资料的权利范围见 [第三方声明](THIRD_PARTY_NOTICES.md)。

## 功能

- **15张独立平面模型**：独墅湖一期10张、南京鼓楼南扩4张、香港中大医院历史病区1张。标准图保留对应楼层范围。
- **三维与家具**：墙体剖切、房间分区、家具和设备表达、构件依据点选；支持单层GLB、JSON和全部模型包。
- **证据与推定分离**：保留源图出处、历史阶段、比例假设和 `traced` / `symbol` / `inferred` 标记。
- **跨层实验**：3个项目 × 3种需求倍率 × 12组配对种子 × 2种策略，共216次默认运行，包含可复算结果。
- **F1示例**：`/f1` 保留项目发起人提供的离线模型、路径计算和原有内嵌许可。

## 本地运行

需要 Node.js 22.13+（已在24.x验证）和 pnpm。建议使用 Node.js 24。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开命令输出的本地地址。运行不需要 GitHub Token、OpenAI API Key 或专属站点账号。

```sh
pnpm typecheck
pnpm build
pnpm start
```

`build` 使用 Vinext / Cloudflare Workers 构建；`start` 在本机运行构建产物。仓库不包含原托管站点的项目标识或发布凭据。

## 原图为什么没有包含在仓库里

公开来源不等于 MIT 再分发许可。因此仓库保留模型、来源链接和导入路径，下载的第三方原始平面/剖面/总图不进入 Git。

三维模型和实验可直接运行。原图叠合区域在未补入素材时会显示说明。取得相应使用权限后，把图像放入各模型 `image` 字段指定的 `public/projects/...` 路径，刷新页面即可使用原图叠合；该目录默认被 Git 忽略。

源资料目录见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，每层更细的出处见 `lib/projects.ts`。

## 复现计算与模型检查

```sh
pnpm analyze:transport
pnpm models:build
pnpm models:check
```

`models:build` 根据 JSON 生成15份GLB，检查对象编号、楼层对应、有限几何、家具在房间和楼板内、导出构件在记录的家具足迹内，以及门窗洞口样例。原始图像是可选本地资产；是否存在会在审计中单独记录。

`models:check` 检查房间面与庭院多边形不发生交叠。结果写入 `public/models/` 的审计文件。

F1 示例另有复现入口：

```sh
node scripts/analyze-f1.mjs
node --experimental-strip-types scripts/report.ts
```

若替换 F1 离线文件，使用 `node scripts/import-f1.mjs /path/to/hospital_F1_offline.html`，然后重新执行分析。该导入器针对本仓库示例的特定内嵌数据格式。

## 主要目录

| 路径 | 内容 |
|---|---|
| `app/model-workspace.tsx` | 模型选择、图层、构件信息与下载 |
| `app/plan-viewer.tsx` / `plan-overlay.tsx` | 三维与二维描图视图 |
| `lib/plan-model.ts` | 像素坐标模型数据类型 |
| `lib/plan-scene.ts` | 墙体、洞口、家具几何及GLB导出 |
| `lib/projects.ts` | 三院功能楼层、来源与版本 |
| `lib/vertical-sim.ts` | 配对跨层交通模拟 |
| `public/models/` | 15份模型、JSON、审计和下载包 |
| `scripts/` | 几何检查、分析与数据复现 |
| `research/` | 方法、局限与F1提取内容 |
| `licenses/` | 保留的第三方许可与通知 |

## 数据使用边界

模型是公开光栅图纸的近似研究表达，未经过现场或CAD测绘。独墅湖与香港的米制比例为假设；香港源图带有斜投影，不能作为正投影施工平面。南京标准病区图不代表各层现状家具完全一致。

家具数量是模型对象数，不能当作医院核定床位、采购量或资产台账。全部高度与家具立体造型经过简化。推定布置始终保留标签。

跨层交通实验的需求、梯组与服务参数为假设，结果不是医院实测运营绩效。新增家具几何尚未作为该实验的水平通行障碍输入。

这些结果用于设计讨论与方法复现，不代表医疗工艺、消防、无障碍或设备安装审查结论。详细说明见 [建模说明](research/MODELING.md) 和 [多层实验](research/MULTIFLOOR.md)。
