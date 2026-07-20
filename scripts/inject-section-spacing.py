#!/usr/bin/env python3
"""Inject Text spacing settings into section schemas (not Typography)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ROOT / "sections"
SPACING_PATH = ROOT / "config" / "section-spacing-settings.json"

# Sections where title/description spacing is meaningful
INCLUDE = {
    "hero.liquid",
    "story-block.liquid",
    "featured-brands.liquid",
    "bestsellers.liquid",
    "materials-showcase.liquid",
    "community-testimonials.liquid",
    "brand-selection.liquid",
    "trending-social.liquid",
    "function-category.liquid",
    "feature-grid.liquid",
    "promo-banner.liquid",
    "brand-banner.liquid",
    "business-hero.liquid",
    "business-solutions.liquid",
    "business-advantages.liquid",
    "corporate-gifting-hero.liquid",
    "corporate-gifting-features.liquid",
    "corporate-gifting-form.liquid",
    "corporate-gifting-packages.liquid",
    "corporate-gifting-process.liquid",
    "skincare-guide.liquid",
    "how-to-use-banner.liquid",
    "how-to-use-guide.liquid",
    "how-to-use-videos.liquid",
    "premium-scrolling-hero.liquid",
    "product-banner.liquid",
    "product-family.liquid",
    "product-recommendations.liquid",
    "bundle-upsell.liquid",
    "care-kit-collection.liquid",
    "reviews-grid.liquid",
    "trust-statement.liquid",
    "hague-protect-dna.liquid",
    "faq.liquid",
    "brand-page.liquid",
    "social-slider.liquid",
    "horizontal-product-slider.liquid",
}

SPACING_IDS = {
    "heading_subheading_spacing_desktop",
    "heading_subheading_spacing_mobile",
    "eyebrow_title_spacing_desktop",
    "eyebrow_title_spacing_mobile",
}


def extract_schema(text: str) -> tuple[str, dict, str] | None:
    match = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", text, re.S)
    if not match:
        return None
    schema = json.loads(match.group(1))
    return text[: match.start()], schema, text[match.end() :]


def already_has_spacing(settings: list) -> bool:
    return any(
        isinstance(s, dict) and s.get("id") in SPACING_IDS for s in settings
    )


def inject(settings: list, spacing: list) -> list:
    # Insert before Typography header if present, else before presets/end
    for i, item in enumerate(settings):
        if (
            isinstance(item, dict)
            and item.get("type") == "header"
            and str(item.get("content", "")).strip().lower() == "typography"
        ):
            return settings[:i] + spacing + settings[i:]
    return settings + spacing


def main() -> None:
    spacing = json.loads(SPACING_PATH.read_text(encoding="utf-8"))
    updated = 0
    skipped = 0

    for path in sorted(SECTIONS.glob("*.liquid")):
        if path.name not in INCLUDE:
            continue
        text = path.read_text(encoding="utf-8")
        parsed = extract_schema(text)
        if not parsed:
            skipped += 1
            continue
        before, schema, after = parsed
        settings = schema.get("settings") or []
        if already_has_spacing(settings):
            skipped += 1
            continue
        schema["settings"] = inject(settings, spacing)
        new_schema = json.dumps(schema, indent=2, ensure_ascii=False)
        path.write_text(
            f"{before}{{% schema %}}\n{new_schema}\n{{% endschema %}}{after}",
            encoding="utf-8",
            newline="\n",
        )
        updated += 1
        print(f"updated: {path.name}")

    print(f"done. updated={updated} skipped={skipped}")


if __name__ == "__main__":
    main()
