# craft3d — 程序化三维积木

可复用的 Three.js 程序化角色/步态积木，从已验收的 episode 实现晋升
（`yuki_morning_battle/craft_trial` 与 `bio_armor_academy_s1e2`）。

**加载方式**：本目录是 viewer 链直接 import 的 ES module，不走 dula-engine
Registry、不进 `dula-assets/index.js` 的 `registerAll()`。浏览器页面经静态挂载
直接引用，并用 import map 解析 `three` / `three/addons/*`：

```html
<script type="importmap">
{ "imports": {
    "three": "/node_modules/three/build/three.module.js",
    "three/addons/": "/node_modules/three/examples/jsm/"
} }
</script>
<script type="module">
  import {LimbSurface, mat, jointInk} from '/node_modules/dula-assets/lib/craft3d/surface.js';
  import {ArticulatedHand} from '/node_modules/dula-assets/lib/craft3d/hand.js';
  import {twoBone} from '/node_modules/dula-assets/lib/craft3d/pose.js';
  import {walkingFeet, turningFeet} from '/node_modules/dula-assets/lib/craft3d/locomotion.js';
  import {outlined, coolShadowRamp, skinMaterial} from '/node_modules/dula-assets/lib/craft3d/look.js';
</script>
```

依赖纪律：模块只允许 import `three` 与 `three/addons/*`（`pose.js` /
`locomotion.js` 为纯数学，零依赖），模块间用相对路径互引。

## 导出符号表

| 模块 | 导出 | 说明 |
|------|------|------|
| `surface.js` | `LimbSurface` | 环形截面连续肢体曲面（肘/膝局部圆角过渡，非全局样条） |
| | `ringsGeometry(levels,{pleats,faceUV})` | 变截面环带几何（裙/衣身，可褶） |
| | `shoeGeometry()` | 圆头鞋几何（真实平底） |
| | `mesh(parent,geometry,material,outline)` | 建网格并附法线外扩轮廓壳 |
| | `ellipsoid(parent,center,radii,color,outline)` | 缩放球体积木 |
| | `mat(color)` | 3 阶 toon 材质缓存工厂（共享 ramp） |
| | `jointInk` | 开口关节轮廓材质（按顶点 `contour` 加权，端环不描） |
| `hand.js` | `ArticulatedHand(sign,material,outlineMaterial)` | 五指关节手：MarchingCubes 连续掌面 + 真实指骨蒙皮；`setGesture({point,fist,open})`、`stats()`、`validateDeformation()`、`validatePointIsolation()` |
| `pose.js` | `twoBone(start,end,pole,a,b)` | 两骨 IK：返回肘/膝位置；骨长不拉伸，不可达即抛错 |
| `supported-performance.js` | `torsoFrame`, `transformPoint`, `applySupportedPerformance` | 腰部支点的躯干、袖臂和手同步变换；腿 IK 独立接世界落脚点。仅适配裸手对话姿态，武器与附加前臂物件尚未联动。S1E4 R2 数值试验，非美术验收样例。 |
| `locomotion.js` | `walkingFeet(walk,rootX,rootZ,yaw,half,footY,stride)` | 有限落脚步行：落脚点不滑、摆动脚抬升弧、髋部起伏/摆臂量输出；支撑期足踝滚动（脚跟触地→放平→前掌蹬离，绕踝俯仰带触地支点补偿） |
| | `turningFeet(turn,rootX,rootZ,yaw,half,footY)` | 换脚转身：按角增量分步 |
| | `angleDelta(a,b)` | 最短角差 |
| | `createLocomotion(params)` | 定制步态风格量（抬脚/俯仰/摆臂/转身步角/`heelStrike`/`toeOff` 等），默认值=S1E2 已验收值 + P19 足踝滚动 |
| `look.js` | `outlined(parent,geometry,material,width)` | 法线外扩壳描边（宽度分级：躯干/头 .0014、四肢 .0010、细节 .0006） |
| | `coolShadowRamp()` | 共享 4 阶冷阴影 toon ramp（阴影阶偏蓝紫、受光阶偏暖） |
| | `skinMaterial(base)` | 肤色平涂材质缓存（按基色取；逆光兜底件，颜色需预调暗 ×0.85–0.92） |

## 从 episode 迁移：只需改 import 路径

导出名与签名全部原样保持。消费方迁移时只改 from 子句：

| 原 import | 新路径 | 迁移范围 |
|-----------|--------|----------|
| `/craft/character3d.js` 的 `LimbSurface/ringsGeometry/shoeGeometry/mesh/ellipsoid/mat/jointInk` | `craft3d/surface.js` | 全部通用积木 |
| `/craft/hand3d.js` 的 `ArticulatedHand` | `craft3d/hand.js` | 整体 |
| `/craft/pose3d.js` 的 `twoBone` | `craft3d/pose.js` | 整体 |
| S1E2 本地 `./locomotion.js` 的 `walkingFeet/turningFeet/angleDelta` | `craft3d/locomotion.js` | 签名一致；换比例用 `createLocomotion()` |
| S1E2 本地 `character_look.js` 的 `outlined` | `craft3d/look.js` | 同名同签名 |
| S1E2 本地 `character_finish.js` 的 `skinMaterial` | `craft3d/look.js` | 通用化：按基色而非角色名取材质 |

⚠️ `locomotion.js` 换角色需重测比例、落脚与重心（`half`/`footY`/`stride`
逐角色传入；风格量默认值绑定 S1E2 验收体态）。

## 未晋升内容与原因

| 符号 | 所在 | 原因 |
|------|------|------|
| `YukiCraft3D`、`samplePose3D` | `craft_trial/character3d.js` / `pose3d.js` | 小雪专属：角色调色板、服装版型与身体比例硬编码 |
| `HeadAssembly` | `craft_trial/head3d.js` | 无 episode 直接 import `/craft/head3d.js`；且依赖 canvas 面部贴图与 episode 本地画法（小雪脸），属角色专属 |
| `HybridRiver` | `craft_trial/environment3d.js` | 剧集环境件（河岸/阵风/飞鸟），非角色积木，超出本次晋升范围 |
| `clothMaterial`、`finishSleeveRoot`、S1E2 肤色板 `SKIN{lei,hong}` | S1E2 `character_finish.js` | 剧集专属调色与袖口修型，暂留本地 |
| 小雪五指手之外的 E08 派生手 | `cat_leads_e08_drifting_page/hybrid/` | E08 本地派生，未回改 craft_trial，不并入 |

## Aoi 绘制角色的斜面与耳发接口

角色参数正本是[`aoi-generated-paint.js`](../../characters/bioarmor/aoi-generated-paint.js)。
`aoiGeneratedFace()`提供脸部、耳部与视角修型配置，`addAoiGeneratedHair()`接入绘画发壳。
本次实现提交`c6d8934`；这是待继续精修的角色配置，不是所有人物的通用脸型模板。

- `drawn-head.js`消费`externalContour:[60,70]`，用stencil区分外轮廓与脸内描边。
  消费方应以`new THREE.WebGLRenderer({stencil:true,...})`创建渲染器；未启用时
  回退旧描边，不能期待同样的深斜面清线效果。S1E4的face lab和viewer已启用。
- `oblique-face-support.js`共享脸、眼及覆盖层的GPU视角修型；`createDrawnHead()`返回的
  `apply(next)`同步注视参数。CPU原始网格探针不包含这些变形，须以实际渲染复核。
- `drawn-ear.js`的`attachedLobe`分支配合变形前`earChartPosition`，减少短耳垂
  纹理挤压；`painted-hair-shell.js`限制马尾侧面调整并让鬓发渐细、不等长分叉。
  几何收尖仍受`profile-hair-paint.js`透明轮廓影响，不能只凭参数判断发梢完整。

当前仍有后发壳感、耳根简化与颈领碎边。实际证据在内容仓库S1E4的
`storyboard/hybrid_character/current/`；接口经验读技能库character-modeler的
`references/multiview-character-fit.md`。后续修改保留已认可脸型，核对邻接转角、
左右侧、表情与逆序取帧；程序一致性通过不等于美术验收。
