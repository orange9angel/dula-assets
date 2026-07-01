# Dula Assets

Official asset pack for [`dula-engine`](https://github.com/orange9angel/dula-engine).

This package contains concrete implementations of characters, animations, scenes, camera moves, voices, and the `CourtDirector` court-positioning system. It registers everything into `dula-engine`'s empty registries via `registerAll()`.

## Installation

```bash
npm install dula-assets
```

Or via GitHub Release tarball:

```bash
npm install https://github.com/orange9angel/dula-assets/releases/download/v0.1.0/dula-assets-0.1.0.tgz
```

## Usage

In your story's `bootstrap.js`:

```js
import { registerAll } from 'dula-assets';

registerAll(); // registers all characters, animations, scenes, camera moves, voices
```

## What's Included

| Category | Items |
|----------|-------|
| **Characters** | 30+ 角色，覆盖多个主题宇宙：哆啦A梦（Doraemon / Nobita / Shizuka）、She-Ra（Adora / SheRa / Catra / Hordak / ShadowWeaver / Klaw / Vex）、圣斗士星矢（Seiya / Shiryu / Hyoga / Shun / Ikki / Aiolos）、幽游白书（Yusuke / Kuwabara）、火影忍者（RockLee）、奥特曼（Ultraman），以及 Xiaoyue、Xingzai、Yokai、Shota、Gabura、Rex、Zorak、Reporter、Cameraman 等原创/辅助角色 |
| **Animations (common)** | Walk, Run, Jump, WaveHand, Bow, Nod, ShakeHead, TurnToCamera, SwingRacket, SitDown, CrossArms, and 16 more |
| **Animations (theme)** | doraemon, nobita, shizuka, rocklee, shera, ultraman, xiaoyue, xingzai, yuyuhakusho 等角色/主题专属动画 |
| **Scenes** | RoomScene, ParkScene (tennis court), SkyScene, BeachScene, CityScene, NightStreetScene, BasketballArenaScene, StadiumScene, AlienPlanetScene, BrightMoonScene, FrightZoneScene, WhisperingWoodsScene, DestroyedCityScene, SpaceStationScene, StarSkyScene, SarayashikiRoofScene, NightRoomScene, LockerRoomScene, GLTFArenaScene 等 |
| **Camera Moves** | common（Static / ZoomIn / ZoomOut / Pan / Orbit / Shake / FollowCharacter / LowAngle / CloseUp / OverShoulder / TwoShot / TrackingCloseUp / WhipPan / ReactionShot），ultraman、yuyuhakusho 主题运镜 |
| **Voices** | Doraemon, Nobita, Shizuka, RockLee, Yusuke, Kuwabara TTS configs（edge-tts） |
| **Utilities** | CourtDirector — semantic tennis court positioning & ball-flight computation |
| **Transitions** | Fade, Flash, Iris, Wipe, Dissolve, Pixelate |

## Peer Dependencies

- `dula-engine` >= 0.1.6
- `three` >= 0.160.0

## Architecture

This is the **middle layer** of the three-tier Dula architecture:

```
dula-engine  (framework: base classes + registries)
     ↑
dula-assets  (this repo: concrete assets registered into engine)
     ↑
dula-story   (content: scripts, configs, audio materials, episodes)
```

The engine provides empty registries and base classes. This package fills them. The story consumes them.
