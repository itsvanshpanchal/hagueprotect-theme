#!/usr/bin/env python3
"""Add Darker Grotesque options to every *_font_family select (sections + theme settings)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NEW_OPTIONS = [
    {"value": "darker_grotesque_light", "label": "Darker Grotesque Light"},
    {"value": "darker_grotesque", "label": "Darker Grotesque Regular"},
    {"value": "darker_grotesque_medium", "label": "Darker Grotesque Medium"},
    {"value": "darker_grotesque_semibold", "label": "Darker Grotesque Semibold"},
    {"value": "darker_grotesque_bold", "label": "Darker Grotesque Bold"},
    {"value": "darker_grotesque_extrabold", "label": "Darker Grotesque Extra Bold"},
    {"value": "darker_grotesque_black", "label": "Darker Grotesque Black"},
]

ANCHOR_VALUE = "freight_text_pro"  # insert right after the last custom brand font


def add_options(settings: list) -> int:
    changed = 0
    for setting in settings:
        if not isinstance(setting, dict):
            continue
        sid = setting.get("id") or ""
        if not sid.endswith("_font_family") and not sid.startswith("font_") or "family" not in sid:
            continue
        options = setting.get("options")
        if not isinstance(options, list):
            continue
        values = {o.get("value") for o in options if isinstance(o, dict)}
        if "darker_grotesque" in values:
            continue
        idx = next(
            (i for i, o in enumerate(options) if isinstance(o, dict) and o.get("value") == ANCHOR_VALUE),
            None,
        )
        insert_at = (idx + 1) if idx is not None else 0
        options[insert_at:insert_at] = [dict(o) for o in NEW_OPTIONS]
        changed += 1
    return changed


def process_section(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"(\{% schema %\}\r?\n)(.*?)(\r?\n\{% endschema %\})", text, flags=re.S)
    if not match:
        return 0
    try:
        schema = json.loads(match.group(2))
    except json.JSONDecodeError:
        return 0
    settings = schema.get("settings")
    if not isinstance(settings, list):
        return 0
    changed = add_options(settings)
    if not changed:
        return 0
    new_schema = json.dumps(schema, indent=2, ensure_ascii=False)
    path.write_text(
        text[: match.start()] + match.group(1) + new_schema + match.group(3) + text[match.end() :],
        encoding="utf-8",
        newline="\n",
    )
    return changed


def process_settings_schema(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = 0
    for block in data:
        if isinstance(block, dict) and isinstance(block.get("settings"), list):
            changed += add_options(block["settings"])
    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    return changed


def main() -> None:
    total = 0
    n = process_settings_schema(ROOT / "config" / "settings_schema.json")
    if n:
        print(f"settings_schema.json: {n} dropdowns updated")
        total += n
    for path in sorted((ROOT / "sections").glob("*.liquid")):
        n = process_section(path)
        if n:
            print(f"{path.name}: {n} dropdowns updated")
            total += n
    print(f"\nTotal dropdowns updated: {total}")


if __name__ == "__main__":
    main()
