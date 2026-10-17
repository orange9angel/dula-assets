# yuki-crafted

Portable viewer-chain character assets for Yuki and Mochi. These modules preserve the procedural faces, hair, body shapes, five-finger hands, toon surfaces, and geometric singing mouths used by the craft3d Yuki episodes.

## Imports

```js
import {YukiCraft3D,MochiCraft3D,CraftMouth,installEnhancedFace,enhanceYukiBody}
  from '/assets/characters/yuki-crafted/index.js';
```

The modules import `three`, `three/addons/*`, and the shared `lib/craft3d` helpers. They do not mount or read any episode directory and do not use the engine Registry.

- `character3d.js` / `head3d.js` / `eye.js`: Yuki-specific proportions, clothing, curved head, hair, and canvas face.
- `mochi3d.js`: Mochi-specific loaf body, face, paws, articulated short legs, feet, and tail.
- `refine3d.js`: enhanced Yuki eyes, deterministic gaze offset, hair and garment detail.
- `mouth3d.js`: visible geometric mouth cavity, lips, teeth, and tongue driven by continuous lip channels.

## Source lineage

Promoted from the read-only originals:

- `dula-story/episodes/yuki_morning_battle/craft_trial/{character3d.js,head3d.js,character.js}`
- `dula-story/episodes/yuki_fish_musical/craft3d/{mochi3d.js,mouth3d.js,refine3d.js}`

Generic `LimbSurface`, `ringsGeometry`, `shoeGeometry`, materials, `ArticulatedHand`, and `twoBone` remain in `dula-assets/lib/craft3d/`; this directory imports rather than forks them. Mochi's legs expose their actual surfaces and foot meshes so an episode can perform contact-checked dancing without replacing the character with generic primitives.
