#!/usr/bin/env python3
"""
Audio Asset Download Helper

Reads metadata from audio-registry/ and helps prepare audio assets for an episode.
Since many sources require manual download (Pixabay click-to-download),
this script generates a download plan and attempts direct downloads where possible.

Usage:
    python download.py <episode_path> [--scene RoomScene,ParkScene,SkyScene]
    python download.py <episode_path> --list
    python download.py <episode_path> --plan-only
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent


def load_registry():
    """Load all metadata JSON files from bgm/, ambient/, sfx/"""
    registry = {"bgm": [], "ambient": [], "sfx": []}
    for category in registry:
        cat_dir = REGISTRY_DIR / category
        if not cat_dir.exists():
            continue
        for json_file in sorted(cat_dir.glob("*.json")):
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                registry[category].append(data)
    return registry


def list_all(registry):
    """Print all available assets."""
    print("=" * 60)
    print("Available Audio Assets in Registry")
    print("=" * 60)
    for category, items in registry.items():
        print(f"\n[{category.upper()}] ({len(items)} items)")
        for item in items:
            scenes = ", ".join(item.get("suggested_scenes", []))
            moods = ", ".join(item.get("mood", [])[:3])
            print(f"  - {item['name']:20s} | scenes: {scenes:20s} | mood: {moods}")
            for src in item.get("sources", []):
                print(f"      [{src['platform']}] {src.get('title','')} by {src.get('author','')}")
                print(f"      URL: {src['url']}")


def filter_by_scenes(registry, scene_names):
    """Filter registry items that match any of the given scene names."""
    scene_set = set(s.strip() for s in scene_names.split(","))
    filtered = {"bgm": [], "ambient": [], "sfx": []}
    for category, items in registry.items():
        for item in items:
            item_scenes = set(item.get("suggested_scenes", []))
            if item_scenes & scene_set:
                filtered[category].append(item)
    return filtered


def generate_plan(episode_path, registry, scenes=None):
    """Generate a download plan for the episode."""
    episode_dir = Path(episode_path)
    audio_dir = episode_dir / "materials" / "audio"
    sfx_dir = episode_dir / "materials" / "sfx"
    bgm_dir = episode_dir / "materials" / "bgm"

    # Create dirs
    audio_dir.mkdir(parents=True, exist_ok=True)
    sfx_dir.mkdir(parents=True, exist_ok=True)
    bgm_dir.mkdir(parents=True, exist_ok=True)

    if scenes:
        registry = filter_by_scenes(registry, scenes)

    plan = []
    for category, items in registry.items():
        for item in items:
            if category == "bgm":
                dest = bgm_dir / item["local_filename"]
            elif category == "ambient":
                dest = audio_dir / item["local_filename"]
            else:
                dest = sfx_dir / item["local_filename"]

            exists = dest.exists()
            primary_source = item.get("sources", [{}])[0]
            plan.append({
                "name": item["name"],
                "category": category,
                "local_path": str(dest),
                "exists": exists,
                "source_url": primary_source.get("url", ""),
                "platform": primary_source.get("platform", ""),
                "license": primary_source.get("license", ""),
                "author": primary_source.get("author", ""),
                "notes": primary_source.get("notes", ""),
            })
    return plan


def write_plan_files(plan, episode_path):
    """Write download plan as JSON and a human-readable markdown list."""
    episode_dir = Path(episode_path)
    plan_file = episode_dir / "audio_download_plan.json"
    md_file = episode_dir / "audio_download_plan.md"

    with open(plan_file, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)

    with open(md_file, "w", encoding="utf-8") as f:
        f.write("# Audio Download Plan\n\n")
        f.write("Generated from `dula-assets/audio-registry/`.\n\n")
        f.write("## Instructions\n\n")
        f.write("1. Files marked **MISSING** need to be downloaded manually.\n")
        f.write("2. Click the source URL and download the audio file.\n")
        f.write("3. Rename it to the `Local Filename` and place it in the indicated directory.\n")
        f.write("4. Files marked **EXISTS** are already in place.\n\n")

        missing = [p for p in plan if not p["exists"]]
        exists = [p for p in plan if p["exists"]]

        if missing:
            f.write("## Missing Files\n\n")
            for p in missing:
                f.write(f"### {p['name']} ({p['category']})\n\n")
                f.write(f"- **Local path:** `{p['local_path']}`\n")
                f.write(f"- **Source:** [{p['platform']}]({p['source_url']})\n")
                f.write(f"- **Author:** {p['author']}\n")
                f.write(f"- **License:** {p['license']}\n")
                f.write(f"- **Notes:** {p['notes']}\n\n")

        if exists:
            f.write("\n## Already Present\n\n")
            for p in exists:
                f.write(f"- [{p['category']}] `{p['local_path']}`\n")

    print(f"Download plan written to:")
    print(f"  JSON: {plan_file}")
    print(f"  MD:   {md_file}")


def try_download(plan_item, timeout=30):
    """Attempt to download a file from a known direct URL."""
    url = plan_item["source_url"]
    dest = Path(plan_item["local_path"])

    # Skip if already exists
    if dest.exists():
        return True, "already exists"

    # Only attempt direct file URLs
    if not any(url.endswith(ext) for ext in [".mp3", ".wav", ".ogg", ".flac"]):
        return False, "not a direct file URL — manual download required"

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, "wb") as f:
                f.write(response.read())
        return True, "downloaded"
    except Exception as e:
        return False, f"download failed: {e}"


def main():
    parser = argparse.ArgumentParser(description="Audio asset download helper")
    parser.add_argument("episode_path", nargs="?", default=None, help="Path to the episode directory")
    parser.add_argument("--scene", help="Comma-separated scene names to filter by (e.g. RoomScene,ParkScene)")
    parser.add_argument("--list", action="store_true", help="List all available assets and exit")
    parser.add_argument("--plan-only", action="store_true", help="Generate plan files without attempting downloads")
    parser.add_argument("--try-download", action="store_true", help="Attempt automatic downloads for direct URLs")
    args = parser.parse_args()

    registry = load_registry()

    if args.list:
        list_all(registry)
        return

    if not args.episode_path:
        print("Error: episode_path is required unless using --list")
        sys.exit(1)

    if not Path(args.episode_path).exists():
        print(f"Error: Episode path does not exist: {args.episode_path}")
        sys.exit(1)

    plan = generate_plan(args.episode_path, registry, scenes=args.scene)
    write_plan_files(plan, args.episode_path)

    print(f"\n{'='*60}")
    print(f"Plan summary: {len(plan)} assets")
    missing = sum(1 for p in plan if not p["exists"])
    print(f"  Missing: {missing}")
    print(f"  Present: {len(plan) - missing}")
    print(f"{'='*60}")

    if args.try_download and missing > 0:
        print("\nAttempting automatic downloads for direct URLs...")
        for p in plan:
            if not p["exists"]:
                ok, msg = try_download(p)
                status = "OK" if ok else "SKIP"
                print(f"  [{status}] {p['name']}: {msg}")

    print("\nDone. Please review the markdown plan for manual download instructions.")


if __name__ == "__main__":
    main()
