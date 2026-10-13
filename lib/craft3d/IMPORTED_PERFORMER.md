# Imported performer components

The S1E4 viewer integrates textured GLB characters alongside its existing hybrid
room, timeline, speech and subtitles. Original GLBs stay in the episode assets;
these modules apply runtime controls without overwriting those sources.

- `imported-performer.js`: normalize a neutral bind pose, retain numbered finger
  bones, reset deterministically, solve world-space limbs and select influence repairs.
- `retargeted-motion.js`: transfer bind-relative world rotations between rigs
  with different local axes; retime and blend with local poses, optional root motion.
- `projected-face.js` / `facial-deform.js`: limited calibrated graphic face with
  eyelid, gaze, eyebrow and mouth controls plus eight local position shapes.
  It does not reconstruct independent eyeballs or an anatomical mouth cavity.
- `secondary-hair.js`: two small ponytail deformation controls on selected
  head-weighted vertices. The caller supplies deterministic lag angles. Current
  region defaults are calibrated for Aoi and require new calibration for other hair.
- `skin-mark.js`: story-controlled forearm pigment on the skinned surface.
- `skinned-samples.js`: representative rendered vertices for hands, arms and feet.
- `table-hand-clearance.js`: a limited near-edge routing constraint for free hands
  behind a desk. It uses real skinned hand samples, preserves wrist orientation and
  moves the arm through IK. It is not a general collision or physical solver.

Example integration: `dula-story/episodes/bio_armor_academy_s1e4/viewer.js` and
`performance_tripo.js`; look calibration: `characters/bioarmor/tripo-look.js`.
The episode-specific imported contact contract replaces its old procedural-body
probe for this route. Sampled contact checks do not certify full self-collision,
hair/cloth clearance, face aesthetics or continuous-time collision freedom.

Do not strip digits when normalizing bone names, reuse animation-pose bounds as
bind-pose scale, copy quaternions blindly across exporters, or repair cloth by a
spatial box alone when skin also occupies that box. The current dark-albedo skirt
selection is a character-specific repair, not a general garment classifier.
