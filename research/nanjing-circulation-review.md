# 南京鼓楼医院交通设施图面复核

复核日期：2026-09-08。对象为仓库中 `public/models/nanjing.json` 的四张独立图示模型。依据是本地已留存的建筑师公开图：`public/projects/nanjing/F1.jpg`（2000×1366）、`F2.jpg`（2000×1385）、`F3.jpg`（2000×1118）与 `ward.jpg`（2000×2443）。源图来源链接沿用 `lib/projects.ts`，原图不因此纳入 MIT 授权。

本次先查看四张完整原图，再对各交通核、入口、中庭及标准病房层作像素裁切放大，依据连续踏板/扶手、成对反向梯跑及井道内交叉线分别识别扶梯、楼梯与电梯。没有按其他楼层复制设施，也没有把灰底或矩形块本身视为电梯证据。坐标仍为各原图像素，原图比例尺未改。

## 结果

| 图示层 | 楼梯：修前 → 修后 | 电梯：修前 → 修后 | 扶梯：修后 | 主要修正 |
|---|---:|---:|---:|---|
| 1F | 17 → 18 | 30 → 36 | 6 | 中庭一组成对扶梯拆分，东侧两组入口扶梯补建；西端核位置、东侧漏井道/错位、两处漏楼梯修正。 |
| 2F | 16 → 17 | 36 → 36 | 8 | 中庭两条扶梯及中部一对扶梯更正，入口可见短段补建；东侧管井误作电梯删除，两处漏楼梯补建；翼楼楼梯内两件推定桌椅删除。 |
| 3F | 15 → 16 | 35 → 36 | 2 | 两条中庭扶梯更正；东侧两个误认井道删除，楼梯、电梯重新定位；补西翼楼梯和三处漏电梯符号。 |
| 标准病区 F7–F14 参考 | 8 → 8 | 18 → 18 | 0 | 八处双跑楼梯、十八个电梯井道逐处核对，类别和数量保留，明确梯段方向、构造限制和可包含设施的所属交通核。 |

以上是本次图面建模对象数量，不是设备采购数量、竣工清单或运营能力。扶梯按图面能分辨的独立梯道计数，第二层东入口短段只重建该图能看到的平面部分。

## 建模边界与未核事项

- 图面符号和位置采用 `evidence: symbol`；它只证明可辨符号。新增 `note` 明确说明轿厢、栏杆、楼层总高、设备参数等仍为示意。
- 楼梯的 `stairLayout: dogleg` 表示双跑示意。已核实梯跑方向以 `rotation` 指定，行进方向沿本地 `d`；将横向双跑梯的 `w/d` 对换并旋转 90°，保持原平面包络。
- F1-M2、F2-mainN4 可见围绕楼梯井布置的多跑楼梯。本版确认楼梯用途，暂使用双跑组件简化；没有声称重建全部梯跑或楼梯井。
- 六个东侧纵向交通核原包络未涵盖实际井道。按对应本层源图重新调整包络，并同步调整原边界墙段和门洞；仍是图像比例尺下的简化重建。
- 不可辨的小管井/设备格保留为空间；移除其虚假 lift 对象，不给出未经证明的设备名称。
- 扶梯的提升高度、坡度、上下行方向、服务标高与电梯用途/停站均未核实，不能用这些示意构件作交通容量或消防合规判定。
- 标准病房图只是一张参考适用层图，不能据此断言 F7–F14 的实装设施逐层相同。

## 几何检查

写回前逐件以旋转矩形四角验证：全部家具/设施均在楼板内、庭院外；有 `roomId` 的设施全部在所属房间内。楼梯/电梯仅在完整包络落入已核实交通核时才添加 `roomId`，没有为满足检查而把原图符号移动到错误位置。最终 GLB 构件与网页渲染检查由整体发布流程执行。

## 修改 ID 与依据

| 层 | 类别 | ID | 依据 / 修改 |
|---|---|---|---|
| 1F | 修正 | nanjing-F1-f36 | 中庭成对扶梯之一，原误标 stair；拆开两条梯道 |
| 1F | 补建 | nanjing-F1-circ-atrium-escalator-2 | escalator；按本层源图可辨符号 |
| 1F | 补建 | nanjing-F1-circ-entry-n-escalator-1 | escalator；按本层源图可辨符号 |
| 1F | 补建 | nanjing-F1-circ-entry-n-escalator-2 | escalator；按本层源图可辨符号 |
| 1F | 补建 | nanjing-F1-circ-entry-s-escalator-1 | escalator；按本层源图可辨符号 |
| 1F | 补建 | nanjing-F1-circ-entry-s-escalator-2 | escalator；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f37 | 北侧为直跑台阶，不能与中庭扶梯混同 |
| 1F | 修正 | nanjing-F1-f31 | 西端楼梯移至上排电梯下方的实际梯段，消除原模型叠压 |
| 1F | 修正 | nanjing-F1-f32 | 最西端上排西电梯按图重定位 |
| 1F | 修正 | nanjing-F1-f33 | 最西端上排东电梯按图重定位 |
| 1F | 修正 | nanjing-F1-f35 | 最西端下排东电梯按图重定位 |
| 1F | 补建 | nanjing-F1-circ-farwest-lift-sw | lift；按本层源图可辨符号 |
| 1F | 补建 | nanjing-F1-circ-north-lift-4 | lift；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f697 | 东侧横向交通核小型方井道按本层原图包络校正 |
| 1F | 补建 | nanjing-F1-circ-right-core-0-lift-2 | lift；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f700 | 东侧横向交通核小型方井道按本层原图包络校正 |
| 1F | 补建 | nanjing-F1-circ-right-core-1-lift-2 | lift；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f703 | 东侧横向交通核小型方井道按本层原图包络校正 |
| 1F | 补建 | nanjing-F1-circ-right-core-2-lift-2 | lift；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f706 | 东侧横向交通核小型方井道按本层原图包络校正 |
| 1F | 补建 | nanjing-F1-circ-right-core-3-lift-2 | lift；按本层源图可辨符号 |
| 1F | 修正 | nanjing-F1-f708 | 东北交通核楼梯在电梯下方，原 y569 错位 |
| 1F | 修正 | nanjing-F1-f709 | 东北交通核电梯在楼梯上方东侧，原位置落入梯间 |
| 1F | 修正 | nanjing-F1-f710 | 东南交通核楼梯按图保留 |
| 1F | 修正 | nanjing-F1-f711 | 东南交通核电梯移至楼梯下方东侧井道 |
| 1F | 交通核包络 | F1-REC0 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 1F | 交通核包络 | F1-REC1 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 1F | 补建 | nanjing-F1-circ-west-stair | stair；按本层源图可辨符号 |
| 1F | 空间标签 | F1-L8 | 图示楼梯间（翼楼） |
| 1F | 补建 | nanjing-F1-circ-well-stair | stair；按本层源图可辨符号 |
| 1F | 空间标签 | F1-M2 | 图示多跑楼梯间（围绕楼梯井） |
| 2F | 修正 | nanjing-F2-f625 | 中庭连续梯板符号为扶梯，原误标 stair |
| 2F | 修正 | nanjing-F2-f626 | 中庭连续梯板符号为扶梯，原误标 stair |
| 2F | 修正 | nanjing-F2-f626 | 下侧扶梯按图向东侧翼楼方向斜置 |
| 2F | 修正 | nanjing-F2-f627 | 中部成对扶梯之一，原误标 stair |
| 2F | 补建 | nanjing-F2-circ-atrium-escalator-2 | escalator；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-entry-n-escalator-1 | escalator；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-entry-n-escalator-2 | escalator；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-entry-s-escalator-1 | escalator；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-entry-s-escalator-2 | escalator；按本层源图可辨符号 |
| 2F | 修正 | nanjing-F2-f620 | 西端楼梯移至上排电梯下方实际梯段 |
| 2F | 修正 | nanjing-F2-f621 | 西端上排西电梯按图重定位 |
| 2F | 修正 | nanjing-F2-f622 | 西端上排东电梯按图重定位 |
| 2F | 修正 | nanjing-F2-f623 | 西端下排西电梯按图校正 |
| 2F | 修正 | nanjing-F2-f624 | 西端下排东电梯按图校正 |
| 2F | 删除 | nanjing-F2-f242 | 东侧东北核左侧为无交叉井道符号的设备/管井格，原误建为 lift；保留空间，设备用途待确认 |
| 2F | 修正 | nanjing-F2-f243 | 东北核只有东侧可辨的电梯井道，按图重定位 |
| 2F | 补建 | nanjing-F2-circ-east-n-stair | stair；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-east-s-stair | stair；按本层源图可辨符号 |
| 2F | 补建 | nanjing-F2-circ-east-s-lift | lift；按本层源图可辨符号 |
| 2F | 交通核包络 | F2-CE0 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 2F | 交通核包络 | F2-CE1 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 2F | 补建 | nanjing-F2-circ-well-stair | stair；按本层源图可辨符号 |
| 2F | 空间标签 | F2-mainN4 | 图示多跑楼梯间（围绕楼梯井） |
| 2F | 删除 | nanjing-F2-f634 | 原推定办公桌位于翼楼图示楼梯及平台范围 |
| 2F | 删除 | nanjing-F2-f635 | 原推定椅子位于翼楼图示楼梯及平台范围 |
| 2F | 补建 | nanjing-F2-circ-west-stair | stair；按本层源图可辨符号 |
| 3F | 修正 | nanjing-F3-f620 | 中庭上侧连续梯板符号为扶梯，原误标 stair |
| 3F | 修正 | nanjing-F3-f621 | 中庭下侧斜置连续梯板符号为扶梯，原误标 stair |
| 3F | 修正 | nanjing-F3-f614 | 西端楼梯按本层原图梯段定位 |
| 3F | 修正 | nanjing-F3-f615 | 西端上排西电梯按图重定位 |
| 3F | 修正 | nanjing-F3-f616 | 西端上排东电梯按图重定位 |
| 3F | 修正 | nanjing-F3-f619 | 西端下排东电梯按图重定位 |
| 3F | 补建 | nanjing-F3-circ-farwest-lift-sw | lift；按本层源图可辨符号 |
| 3F | 补建 | nanjing-F3-circ-north-lift-4 | lift；按本层源图可辨符号 |
| 3F | 补建 | nanjing-F3-circ-south-lift-4 | lift；按本层源图可辨符号 |
| 3F | 删除 | nanjing-F3-f212 | 东北核西侧格为管井/设备格，不具有电梯交叉线符号 |
| 3F | 删除 | nanjing-F3-f215 | 东南核原西侧 lift 位于图示楼梯范围，移除错误井道 |
| 3F | 修正 | nanjing-F3-f213 | 东北核电梯按图重定位 |
| 3F | 修正 | nanjing-F3-f216 | 东南核电梯在楼梯下方东侧，原 y659 位于梯间 |
| 3F | 补建 | nanjing-F3-circ-east-n-stair | stair；按本层源图可辨符号 |
| 3F | 补建 | nanjing-F3-circ-east-s-stair | stair；按本层源图可辨符号 |
| 3F | 交通核包络 | F3-CE0 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 3F | 交通核包络 | F3-CE1 | 按本层原图边界调整东侧核包络及原边界墙段，容纳已核实梯道/井道 |
| 3F | 补建 | nanjing-F3-circ-west-stair | stair；按本层源图可辨符号 |
| 1F | 构造明确 | nanjing-F1-f1 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f5 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f11 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f12 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f17 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f22 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f23 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f30 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f31 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f696 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f699 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f702 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f705 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f708 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 构造明确 | nanjing-F1-f710 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f229 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f232 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f235 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f238 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f590 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f594 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f600 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f601 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f606 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f611 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f612 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f619 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 2F | 构造明确 | nanjing-F2-f620 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f199 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f202 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f205 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f208 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f584 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f588 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f594 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f595 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f600 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f605 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f606 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f613 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 3F | 构造明确 | nanjing-F3-f614 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f555 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f559 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f562 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f563 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f567 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f570 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f571 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 标准病区 F7–F14 参考 | 构造明确 | nanjing-ward-f634 | 按图示双跑梯方向设置 stairLayout；高度/栏杆仍为示意 |
| 1F | 修正 | nanjing-F1-f30 | 最终图纸包络叠合发现原楼梯位于上方过道，改至 y862 可辨双跑梯段 |

所有保留的 lift 对象还统一添加了 `note`，说明井道符号依据与轿厢/门向/停站未核实；以上日志不逐条重复这一同样的元数据注释。
