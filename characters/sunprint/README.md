# 晴印咖啡厅角色

供自包含 Three.js viewer 使用的角色组件。当前入口是 `RiggedCafeKid`：复用已绑定身体，
接曲面头脸、生成绘画和连续裙面。它没有接入 `CharacterBase` 或资产库的 `registerAll()`；
调用方注册角色、等待资源加载，再提供表演姿态。外观仍是待用户复看的候选。

| 文件 | 职责 |
|---|---|
| `RiggedCafeKid.js` | 蒙皮身体、手脚 IK、衣料投影、实际鞋底采样、裙面与腿部连接 |
| `CafeKid.js` | 曲面头脸、五官与前发、表情及基础姿态接口 |
| `CafeFaceIntegration.js` | 五官绘画与头、耳、颈肤色响应的衔接 |
| `CafeHairIntegration.js` | 共同深度映射收回后脑/后发，保留原画 XY/UV；颈侧发束回绕候选 |
| `CafeRearHair.js` | 侧后发曲面与绘画覆盖 |
| `CafeSkirt.js` | 随实际髋膝更新的褶裙、腰带、格纹和有限腿部胶囊拟合 |
| `IllustratedCafeKid.js` | 历史整图变形路线，非当前三维入口 |

## 调用方式

```js
import {RiggedCafeKid} from './RiggedCafeKid.js';

const actor = new RiggedCafeKid('Girl', {
  bodyUrl, clothingUrl, portraitUrl, hairUrl, rearHairUrl, sideHairUrl,
});
await actor.ready;
scene.add(actor.mesh);
const evidence = actor.setPose(pose);
```

`kind` 使用 `Girl` 或 `Boy`，男主不需要 `sideHairUrl`。图片和 GLB 由调用方提供，
本目录不包含单集素材。`pose` 必须包含当前接口所需的左右腕、脚目标和面部/朝向数据；
不要以空对象作为默认姿势。`setPose()` 返回实际关节、脚底及服装的有限检查数据。

完整接入例子是内容仓
[`craft3d/bootstrap.js`](../../../dula-story/episodes/cat_leads_cafe_musical/craft3d/bootstrap.js)，
姿态谱见同集 `craft3d/dialogue-v4.js` 和 `craft3d/dance-v5.js`。
坐标的画面左右与导入骨架左右在适配层明确转换；换身体时须重新标定，不能直接套数值。

## 约束与证据

裙面由已求解髋膝和当前时间确定，适配坐姿、起身及转身；它不是通用布料物理系统。
腿部胶囊净空和鞋底顶点采样都是有限代理检查，不覆盖实际全网格、桌椅或头发碰撞。
身体衣料投影、头面融合、侧后发覆盖各有适用角度，生成图并不等于完整三维重建。

V4 角色代码基线为 `f3c9242`（包含 `fd0d0f5` 的面部及坐姿修订）。
[单集制作证据](../../../dula-story/episodes/cat_leads_cafe_musical/craft3d/UNIFIED_V4.md)
保留首次 seek 异常、独立复查和审美限制；
[工艺复盘](../../../dula-skills/character-modeler/references/sunprint-dance-revision.md)
记录面具感、旧裙删除造成断腿、坐姿后摆和动作融合问题。

V5 候选追加裙腰重叠、保护低位手臂不被旧裙裁切、有限腕弯和后脑共同深度映射。
首次独立后发重建被用户否定颜值，现已撤回；当前仍有侧发折片、强侧面拉伸等限制。
见 [V5 记录](../../../dula-story/episodes/cat_leads_cafe_musical/craft3d/INTEGRATION_V5.md)。
不要把首轮实验或新候选写成已通过用户美术验收的样板。
