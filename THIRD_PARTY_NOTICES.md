# Third-party notices / 第三方声明

本仓库自有软件与文档采用根目录的 MIT License。第三方作品保留其原有许可和权利，根 MIT 不替代第三方许可，也不授予原医院建筑设计、原图或商标的权利。

## 医院项目参考资料

公开仓库不包含下载的医院原始平面、剖面、总图和含原图底图的叠加 PNG。`public/projects/` 是本地可选素材目录，已被 Git 忽略。可从下列来源查阅；取得适当权利后，按模型 JSON 的 `image` 路径放入本地即可恢复原图叠合功能。

| 资料 | 来源 | 在项目中的用途 |
|---|---|---|
| 苏州市独墅湖医院一期验收附图 | [2021 验收报告](https://www.ehscare.com/uploads/file/20210902/02575123c8d3d14600b619d72eff53ac.pdf) | 楼层功能、参考轮廓与空间描绘 |
| 独墅湖一期建筑师发表资料 | [LEMANARC 供稿](https://www.gooood.cn/suzhou-dushu-lake-hospital-china-by-lemanarc-sa.htm) | 建筑组织与独立版本剖面 |
| 南京鼓楼医院南扩 | [LEMANARC](https://www.lemanarc.com/projects/nanjing-drum-tower-hospital/)、[建筑师发表图](https://www.archdaily.com/461173/nanjing-drum-tower-hospital-lemanarc-sa) | 1–3F、标准病区及剖面资料 |
| 香港中文大学医院历史病区 | [Hong Fung 2024 公开演讲第27页](https://internationalforum.bmj.com/wp-content/uploads/2024/09/S19_-Digital-Connectivity-and-IoT-in-Improving-Flow-and-Logistics_Hong-Fung.pptx.pdf#page=27) | 7/F 历史病区近似几何 |

`public/models/*.json`、`.glb` 与模型下载包保留了源图归属、历史版本、尺度假设和推定说明。这些是本研究制作的近似模型及表达，不是原图的开放许可副本。MIT 适用于贡献者有权许可的代码、表达和新增内容；源设计及第三方作品的既有权利仍归原权利人。复用案例资料时请保留出处并自行核实对应使用权限。

## 用户提供的 F1 示例

`public/source-f1.html` 来自本项目发起人提供的离线示例，原有许可字段完整保留。其中嵌入：

- Three.js r180、OrbitControls、GLTFExporter：MIT，见 `licenses/THREE-LICENSE.txt`。
- Apache ECharts 6.0.0：Apache-2.0，完整许可及通知见 `licenses/ECHARTS_LICENSE.txt`、`licenses/ECHARTS_NOTICE.txt`。其组件许可说明仍保留在完整许可中。

`lib/f1.json`、`public/navigation.json`、`research/navigation.json` 和 `research/module-routing.js` 是对该示例的提取；没有移除原始离线文件的第三方声明。

## 组件与安装依赖

`components/ui` 基于 shadcn UI / Base UI，原上游 MIT 归属见 `licenses/`。Lucide 使用 ISC，并含 Feather 派生部分的 MIT 声明；CVA、TypeScript 和 ECharts 等使用 Apache-2.0。其他安装依赖依各自包中的许可证，锁定版本见 `pnpm-lock.yaml`。

本仓库不分发 `node_modules`；根 MIT 不表示所有依赖都采用 MIT。分发自行构建的二进制时，应保留所包含依赖的许可与通知。
