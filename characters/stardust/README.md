# 《星屑战壳》viewer 角色

晋升自 `dula-story/episodes/stardust_clad_op` R7 验收版（viewer 链直接 import 子路径，
默认不自动注册，剧集在 bootstrap 显式注册）。六个角色共用同一战壳体系（`buildOrnateClad` 贴身华丽铠甲 + 分段生长）：

| 类 | 角色 | 配色 | 备注 |
|---|---|---|---|
| `AoaoCraft` | 阿鏊（平底锅座） | 鎏金橙铜+青绿核 | 锅盖盾（`shieldDome` 探针锚）、白披风、冲天翘发呆毛 |
| `XiaozaoCraft` | 小凿（漏勺座） | 亮银+银蓝核 | 漏勺花窗盘护腕（`bracerDiscL` 探针锚）、斜刘海泪痣 |
| `DafuCraft` | 大釜（汤釜座） | 铁灰鎏金+琥珀核 | 三层肩甲、深短披风、眯缝笑眼方脸 |
| `HestiaCraft` | 赫斯提亚（炉灶女神） | 白金长袍+金饰 | 坐姿直出腿链（不走步行 IK）、锅铲权杖、火焰光环 |
| `AzuCraft` | 阿箸（筷子座） | 漆黑漆器+白银勾边+朱红核 | 修长高挑梯队、双持筷刃（前臂甲延伸）、双簪细角冠 |
| `YekariCraft` | 夜刈（链镰） | 黑紫甲+银边+紫核 | 主镰与短链回刃；`sickleTip` / `chainSocket` / `chestMark` 为实际接触锚点 |

## 契约

每角色四件套：`setPose(p)` / `setCladState(t)`（0→1 生长）/ `updateCladFX(t,cladT)` /
`setEmotion(e,blink)`，字段 `mesh/body/limbs/hands/feet/headGroup`（+ `face` animatedHead
句柄、`shieldDome`/`bracerDiscL`/`fitRefs` 探针锚点）。pose 对象契约见
本目录 `pose-rig.js` 的 `buildPose`（twoBone 三点链 + rootX/rootZ/yaw/bob/
headYaw/headPitch/headRoll/fist/open/point/capeLift）。

## 肤色板

模块加载时把本系列默认肤色写进 craft3d 共享表 `SKIN`（`lei`/`aoi`；同 kind 复用者共享）。
调用方可在首次构建角色前用 `setStardustSkin(kind, palette)` 覆盖。

## 纪律

- DIMS：髋高+直立偏移+最大 bob ≤ legA+legB+footY（twoBone 永不超伸；离线验证
  见 OP 集 `tools/scan_reach.mjs`）。
- rig 局部方向：`forearmRig.align`（+z→骨轴）下局部 **+y 才是肢体前向**——甲件弧心角
  据此排布（R7 胫甲/R8 臂板翻车史），改动前用旋转验算，别凭直觉注释。
- 生长/特效全部是纯 (t,state) 确定函数（seek 一致铁律）。
- 剧集侧谱面、探针契约、纹理素材留在内容仓库，本包只含角色/战壳本体。

## R19 守宫对决复用入口

S1E2《焰阶宫·盾与暗链》于2026-10-19获得用户“效果好了非常多”的反馈。
此记录绑定该集成片，不能把两个角色的参数无验证套到全部角色。

| 模块 / 接口 | 使用方式与范围 |
|---|---|
| `palace-clad.js` / `applyPalaceClad(actor, kind)` | 在原角色构建后显式调用，`kind`仅为`aoao`或`yekari`；为阿鏊加铜金叠甲、铆钉盾及导火鳍，为夜刈加斜链胸纹、单侧月肩与腕部棘轮。默认构造器保持原样。 |
| `actor.updatePalaceClad(t,T)` | 每帧按绝对时间更新；`T.SCAR`显示盾裂，`T.LOCK`启动棘轮挣脱，`T.C7`留下烧损。事件秒点由剧本编译，不在共享资产写单集时长。 |
| `pose-rig.js` / `buildPose(actor,state,t,dims)` | 适配本系列骨架，使用每个角色实际骨长。`state.supportShift`为根位移的世界XZ偏移，解算器反向补偿脚点；行走与转身分别走有限步态。换角色需重新验证。 |
| `../../lib/craft3d/combat-light.js` / `createCombatLight(scene)` | 返回`impact(id,time,point,options)`与`update(t,camera,{arc,charge,beamShot})`；碰撞点注册时复制世界坐标，光刃使用有宽度的网格。调用方负责命中时刻、目标锚点和声音同步。 |
| `../../scenes/stardust/EmberTierPalaceScene.js` | 九阶前庭、铜闸、固定槽口与街区；调用`build()`后显式`await applyHybrid(textureBase)`再开始渲染。`update(t,events)`由剧本事件驱动开闸及复火。纹理仍由内容仓库提供。 |

当前消费入口是 `dula-story/episodes/stardust_clad_s1e2/viewer_palace.js`。
数值证据范围及剩余读音观察项见该集 `NOTES.md`；通用制作纪律维护在相应skill。

## R20 金属材质与环境通行候选

`metal-clad.js` 的 `createArmorEnvironment(renderer)` 返回 PMREM render target；
`await applyMetalClad(actor,{url,environment:target.texture})` 为宫殿圣衣启用金属反射、
生成刻纹和曲面甲片，排除皮肤、披风、宝石与伤痕。先 `applyPalaceClad()` 再应用，
素材 URL 由内容仓库传入。`refinePalaceLimbs(actor)` 可选调整四肢连续轮廓，保留 IK。
二者都不自动修改所有角色的默认外观。R20随后收到肩甲薄板和盾背缺面反馈，
后续曲壳及金属手套修订见下；原材质接入不代表所有部位都已获认可。

`createCombatLight(scene,{detailed:true})` 启用 `impact-particles.js` 的实例化拖尾火星、
柔边冲击波和低透明烟尘，按命中绝对时间求值。场景 `navigationObstacles` 登记真实
box 实体，供 `lib/craft3d/stage-clearance.js` 做采样通行检查。范围及反例见单集 R20。

## R21—R23 可选装备形体

- `sculpted-clad.js`：`applyPalaceClad()` 默认调用曲面肩壳和封闭盾背；传
  `{sculpted:false}` 可保留旧片状肩甲。肩甲已获用户认可。
- `gauntlet-clad.js` / `applyPalaceGauntlets(actor)`：在宫殿饰甲后、PBR转换前调用，
  连续前臂壳、手背甲及随原指骨的金属指节片。保留盾/武器挂点，护臂已获认可。
- `lower-clad.js` / `applyPalaceLowerClad(actor)`：同样在PBR转换前显式调用；
  本例顺序为宫殿饰甲→护臂→腿套/腰带→金属转换→可选人体轮廓细化。
  只用于阿鏊、夜刈：腿套独立跟旧膝踝轴，踝靴跟原脚；不改足底与骨长。
  腰带按腰围抬高并同步裙甲挂点。`actor.lowerClad`提供壳体与位置供检查，
  旧默认角色不受影响。R23腿套及腰带外观待用户评价。

## R24 连肩胸甲、骨盆和装备区分

`body-clad.js` 的 `applyPalaceCuirass(actor)` 在PBR转换前调用，封闭胸背壳拥有
领口、真实臂孔与肩桥；`applyPalaceAnatomy(actor)` 在 `refinePalaceLimbs` 之后
调用，加入衣内臀部体积和大腿—膝盖收束。它消费 `pose.pelvisOffset`，使深蹲
骨盆向后坐、腰部仍与上身连接；不改原骨长与脸。

`applyPalaceGauntlets(actor,{distinct:true})`、`applyPalaceLowerClad(actor,{distinct:true})`
启用两种装备形体：圆弧炉心/盾扣/圆靴与斜脊月纹/偏心扣/尖膝尖靴。
默认不启用，以保留其他消费方原外观。`actor.anatomicalHands=true` 将垂臂的拇指
方向随前臂旋转，避免把固定前向投影到抬臂平面后造成拇指翻下。

`foot-clearance.js` / `makeFootClearance(actor,scene.lockSolids)` 是本场景的显式
适配器，读取实际足部、墩座与滑舌行程形成连续落脚映射；它不是通用寻路器。
剧集同时调整靠墩站位和深蹲重心，不能只挂适配器便认为任意动作都正确。
`stage-clearance` 新增可选 `includeMesh`，供低位互动实体的局部配对使用。
R24检查包含真实腿/臀/靴与四个墩座实体，历史70个导航实体检查不含这四件。
外观及范围见S1E2 `storyboard/palace_r24/REVIEW.md`；R24仍待用户美术评价。

版本对照、真实剧情姿势和验证范围见S1E2各轮 `storyboard/palace_r21…r23/REVIEW.md`。
