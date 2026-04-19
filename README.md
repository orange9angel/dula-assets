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
| **Characters** | Doraemon, Nobita, Shizuka |
| **Animations (common)** | Walk, Run, Jump, WaveHand, Bow, Nod, ShakeHead, TurnToCamera, SwingRacket, SitDown, CrossArms, and 16 more |
| **Animations (Doraemon)** | Float, Spin, PanicSpin, PullOutRacket, TakeOutFromPocket, NoseBlink, WaddleWalk |
| **Animations (Nobita)** | Cry, LazyStretch, Grovel, StudyDespair, TriumphPose, RunAway |
| **Animations (Shizuka)** | Curtsy, Giggle, PlayViolin, Scold, Blush, Baking |
| **Scenes** | RoomScene, ParkScene (with tennis court, net, ball, racket) |
| **Camera Moves** | Static, ZoomIn, ZoomOut, Pan, Orbit, Shake, FollowCharacter, LowAngle |
| **Voices** | Doraemon, Nobita, Shizuka TTS configs (edge-tts) |
| **Utilities** | CourtDirector — semantic tennis court positioning & ball-flight computation |

## Peer Dependencies

- `dula-engine` >= 0.1.2
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
