#!/usr/bin/env python3
"""Inject heading_line2 + color settings into section schemas (not Hero)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ROOT / "sections"

INCLUDE = {
    "bestsellers.liquid",
    "brand-banner.liquid",
    "brand-page.liquid",
    "brand-selection.liquid",
    "bundle-upsell.liquid",
    "business-advantages.liquid",
    "business-hero.liquid",
    "business-solutions.liquid",
    "care-kit-collection.liquid",
    "community-testimonials.liquid",
    "corporate-gifting-features.liquid",
    "corporate-gifting-form.liquid",
    "corporate-gifting-hero.liquid",
    "corporate-gifting-packages.liquid",
    "corporate-gifting-process.liquid",
    "faq.liquid",
    "feature-grid.liquid",
    "featured-brands.liquid",
    "function-category.liquid",
    "hague-protect-dna.liquid",
    "horizontal-product-slider.liquid",
    "how-to-use-banner.liquid",
    "how-to-use-guide.liquid",
    "how-to-use-videos.liquid",
    "materials-showcase.liquid",
    "premium-scrolling-hero.liquid",
    "product-banner.liquid",
    "product-family.liquid",
    "product-recommendations.liquid",
    "promo-banner.liquid",
    "reviews-grid.liquid",
    "skincare-guide.liquid",
    "social-slider.liquid",
    "story-block.liquid",
    "trending-social.liquid",
    "trust-statement.liquid",
}

NEW_SETTINGS = [
    {
        "type": "text",
        "id": "heading_line2",
        "label": "Heading — second line",
        "info": "Optional. Shown under the main heading in a different color (sentence case).",
    },
    {
        "type": "color",
        "id": "heading_line2_color",
        "label": "Heading second line color",
        "default": "#6b6b6b",
    },
]


def extract_schema(text: str):
    match = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", text, re.S)
    if not match:
        return None
    return text[: match.start()], json.loads(match.group(1)), text[match.end() :]


def inject(settings: list) -> list:
    if any(isinstance(s, dict) and s.get("id") == "heading_line2" for s in settings):
        return settings

    # Prefer insert right after primary heading field
    for i, item in enumerate(settings):
        if not isinstance(item, dict):
            continue
        if item.get("id") in {"heading", "headline", "title"}:
            return settings[: i + 1] + NEW_SETTINGS + settings[i + 1 :]

    # Else before Typography / Text spacing
    for i, item in enumerate(settings):
        if (
            isinstance(item, dict)
            and item.get("type") == "header"
            and str(item.get("content", "")).lower() in {"typography", "text spacing"}
        ):
            return settings[:i] + NEW_SETTINGS + settings[i:]

    return settings + NEW_SETTINGS


def main() -> None:
    updated = 0
    for path in sorted(SECTIONS.glob("*.liquid")):
        if path.name not in INCLUDE:
            continue
        text = path.read_text(encoding="utf-8")
        parsed = extract_schema(text)
        if not parsed:
            continue
        before, schema, after = parsed
        settings = schema.get("settings") or []
        if any(isinstance(s, dict) and s.get("id") == "heading_line2" for s in settings):
            continue
        schema["settings"] = inject(settings)
        new_schema = json.dumps(schema, indent=2, ensure_ascii=False)
        path.write_text(
            f"{before}{{% schema %}}\n{new_schema}\n{{% endschema %}}{after}",
            encoding="utf-8",
            newline="\n",
        )
        updated += 1
        print(f"updated schema: {path.name}")
    print(f"done schemas={updated}")


if __name__ == "__main__":
    main()
