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
二者都不自动修改所有角色的默认外观；R20 用户审美反馈待收集。

`createCombatLight(scene,{detailed:true})` 启用 `impact-particles.js` 的实例化拖尾火星、
柔边冲击波和低透明烟尘，按命中绝对时间求值。场景 `navigationObstacles` 登记真实
box 实体，供 `lib/craft3d/stage-clearance.js` 做采样通行检查。范围及反例见单集 R20。
