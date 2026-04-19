# Dula Assets — Agent Context

> 本文档供 AI 开发代理阅读。记录资产库与 engine 的接口、目录结构及开发规范。

---

## 1. 角色定位

`dula-assets` 是 **三层架构的中间层**：

```
dula-engine   ← 纯净框架（基类 + Registry + 通用系统）
   ↑ 注册
dula-assets   ← 本仓库（具体角色 / 动画 / 场景 / 运镜 / 配音 / CourtDirector）
   ↑ 消费
dula-story    ← 内容仓库（剧本 + 配置 + 素材）
```

**原则**：本仓库只包含*可复用的官方资产*，不包含特定剧集的剧情配置或素材。

---

## 2. 目录结构

```
dula-assets/
├── index.js              # 统一入口：export registerAll()
├── package.json
├── characters/           # 角色实现
│   ├── Doraemon.js
│   ├── Nobita.js
│   └── Shizuka.js
├── animations/           # 动画实现
│   ├── common/           # 通用动画（所有角色可用）
│   ├── doraemon/         # 哆啦A梦专属
│   ├── nobita/           # 大雄专属
│   └── shizuka/          # 小静专属
├── scenes/               # 场景实现
│   ├── RoomScene.js
│   └── ParkScene.js
├── camera/               # 运镜实现
│   └── common/
├── voices/               # 配音配置
│   ├── DoraemonVoice.js
│   ├── NobitaVoice.js
│   └── ShizukaVoice.js
└── lib/
    └── CourtDirector.js  # 网球场语义化站位与球轨迹计算
```

---

## 3. 与 Engine 的接口

`index.js` 从 `dula-engine` 导入注册函数，调用后将具体类注入 Registry：

```js
import { registerCharacter, registerAnimation, registerScene, registerCameraMove, registerVoice } from 'dula-engine';

export function registerAll() {
  registerCharacter('Doraemon', Doraemon);
  // ... 其他注册
}
```

**注意**：所有 voice 文件必须从 `dula-engine` 导入 `VoiceBase`，而非本地相对路径：

```js
// ✅ 正确
import { VoiceBase } from 'dula-engine';

// ❌ 错误（会导致 browser 404）
import { VoiceBase } from './VoiceBase.js';
```

---

## 4. 浏览器加载链

Story 仓库的浏览器页面通过 import map 解析 `dula-engine` 和 `dula-assets`：

```html
<script type="importmap">
{
  "imports": {
    "dula-engine": "/node_modules/dula-engine/index.js",
    "dula-assets": "/node_modules/dula-assets/index.js"
  }
}
</script>
```

`bootstrap.js` → `import { registerAll } from 'dula-assets'` → `dula-assets/index.js` → `import { registerCharacter } from 'dula-engine'` → 注册完成。

**关键**：engine 内部代码也通过 `/node_modules/dula-engine/` 统一加载，避免浏览器创建双重模块实例。

---

## 5. 发版流程

```bash
# 1. 更新版本号
npm version patch   # 或 minor / major

# 2. 打包
npm pack            # 生成 dula-assets-X.Y.Z.tgz

# 3. 打 tag 并推送
git tag vX.Y.Z
git push origin main --tags

# 4. 创建 GitHub Release 并上传 .tgz
gh release create vX.Y.Z dula-assets-X.Y.Z.tgz --title "dula-assets vX.Y.Z" --notes "..."
```

---

## 6. 已知约束

- `CourtDirector.js` 目前被 `dula-engine/storyboard/Storyboard.js` 硬编码 `import`。长期应改为动态注入或从 Registry 获取，使 engine 彻底不依赖 assets。
