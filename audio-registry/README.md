# Audio Registry

This directory contains **metadata only** — no actual audio files are committed to git.
Each JSON file describes a royalty-free audio asset (BGM, ambient, or SFX) with download links, license info, and usage notes.

## Directory Layout

```
audio-registry/
  bgm/          Background music tracks (by mood/scene)
  ambient/      Environmental / room tone loops
  sfx/          Sound effects (one-shots and short loops)
  download.py   Helper script to download assets to an episode
```

## Workflow

1. **Find assets**: Use the metadata JSONs to locate suitable audio on Pixabay / Freesound.
2. **Download**: Run `python download.py <episode_path>` to fetch missing assets.
3. **Generate episode audio**: Run `npm run audio` inside the episode directory as usual.

## Metadata Schema

Each JSON file follows this schema:

| Field | Description |
|-------|-------------|
| `name` | Internal identifier (matches local filename without extension) |
| `category` | `bgm` / `ambient` / `sfx` |
| `description` | What this sound is and when to use it |
| `mood` | Emotional tags for selection |
| `suggested_scenes` | Which 3D scenes this fits |
| `trigger_hints` | For SFX: which script events trigger this sound |
| `sources` | Array of download sources with URL, license, author |
| `local_filename` | Filename after download (e.g. `room_theme.mp3`) |
| `format` | `mp3` / `wav` / `ogg` |
| `loop` | Whether this should loop |
| `mixing_notes` | Volume, ducking, fade recommendations |

## License Notes

- **Pixabay License**: Free for commercial use, no attribution required.
- **CC0 (Freesound)**: Public domain, free for any use.
- **CC-BY (Freesound)**: Requires attribution in credits.

Always verify the license on the source page before using.
