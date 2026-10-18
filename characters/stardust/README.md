# 《星屑战壳》viewer 角色

晋升自 `dula-story/episodes/stardust_clad_op` R7 验收版（viewer 链直接 import 子路径，
不走 Registry）。五个角色共用同一战壳体系（`buildOrnateClad` 贴身华丽铠甲 + 分段生长）：

| 类 | 角色 | 配色 | 备注 |
|---|---|---|---|
| `AoaoCraft` | 阿鏊（平底锅座） | 鎏金橙铜+青绿核 | 锅盖盾（`shieldDome` 探针锚）、白披风、冲天翘发呆毛 |
| `XiaozaoCraft` | 小凿（漏勺座） | 亮银+银蓝核 | 漏勺花窗盘护腕（`bracerDiscL` 探针锚）、斜刘海泪痣 |
| `DafuCraft` | 大釜（汤釜座） | 铁灰鎏金+琥珀核 | 三层肩甲、深短披风、眯缝笑眼方脸 |
| `HestiaCraft` | 赫斯提亚（炉灶女神） | 白金长袍+金饰 | 坐姿直出腿链（不走步行 IK）、锅铲权杖、火焰光环 |
| `AzuCraft` | 阿箸（筷子座） | 漆黑漆器+白银勾边+朱红核 | 修长高挑梯队、双持筷刃（前臂甲延伸）、双簪细角冠 |

## 契约

每角色四件套：`setPose(p)` / `setCladState(t)`（0→1 生长）/ `updateCladFX(t,cladT)` /
`setEmotion(e,blink)`，字段 `mesh/body/limbs/hands/feet/headGroup`（+ `face` animatedHead
句柄、`shieldDome`/`bracerDiscL`/`fitRefs` 探针锚点）。pose 对象契约见
stardust_clad_op `performance.js` 的 `buildPose`（twoBone 三点链 + rootX/rootZ/yaw/bob/
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
