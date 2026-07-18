#!/usr/bin/env python3
"""Validate trimmed section typography schemas for orphans / JSON breakage."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "sections"
bad: list[str] = []

for path in sorted(ROOT.glob("*.liquid")):
    text = path.read_text(encoding="utf-8")
    match = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", text, re.S)
    if not match:
        continue
    schema_raw = match.group(1).strip()
    try:
        schema = json.loads(schema_raw)
    except json.JSONDecodeError as exc:
        bad.append(f"{path.name}: invalid schema JSON ({exc})")
        continue

    settings = schema.get("settings") or []
    ids = [s.get("id") for s in settings if isinstance(s, dict) and s.get("id")]
    headers = [s.get("content") for s in settings if isinstance(s, dict) and s.get("type") == "header"]

    for prefix in ("h1", "h2", "paragraph", "eyebrow"):
        family = f"{prefix}_font_family" in ids
        others = [i for i in ids if i and i.startswith(f"{prefix}_font_") and i != f"{prefix}_font_family"]
        if others and not family:
            bad.append(f"{path.name}: orphan {prefix} settings without family")
        if family and not others:
            bad.append(f"{path.name}: {prefix} family without weight/style/size settings")

    # If Typography header exists, there should be at least one font setting
    if "Typography" in headers:
        font_ids = [i for i in ids if i and i.endswith("_font_family")]
        if not font_ids:
            bad.append(f"{path.name}: Typography header with no font settings")

if not bad:
    print("OK: all section schemas with typography look valid")
else:
    print("\n".join(bad))
    raise SystemExit(1)
