#!/usr/bin/env python3
"""Trim section Typography schemas to only the text groups each section uses."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ROOT / "sections"

GROUP_ORDER = ("h1", "h2", "paragraph", "eyebrow")

GROUP_LABELS = {
    "h1": "Biggest title",
    "h2": "Section heading",
    "paragraph": "Normal text",
    "eyebrow": "Tiny text above title",
}

HEADER_LABELS = {
    "h1": "Logo text",
    "h2": "Mega menu text (titles + links)",
    "paragraph": "Shop All menu",
    "eyebrow": "Search text",
}

GROUP_HEADER_ALIASES = {
    "h1": {
        "1. Biggest title",
        "Biggest title",
        "Logo text",
    },
    "h2": {
        "2. Section heading",
        "Section heading",
        "Mega menu subheadings",
        "Mega menu text (titles + links)",
    },
    "paragraph": {
        "3. Normal text",
        "Normal text",
        "Shop All menu",
    },
    "eyebrow": {
        "4. Tiny text above title",
        "Tiny text above title",
        "Search text",
    },
}

# Keep matrix from local CSS + section-typography.css audit (stricter).
KEEP_MAP: dict[str, tuple[str, ...]] = {
    "header.liquid": ("h1", "h2", "paragraph", "eyebrow"),
    "story-block.liquid": ("h1", "h2", "paragraph", "eyebrow"),
    "hero.liquid": ("h1", "paragraph", "eyebrow"),
    "corporate-gifting-hero.liquid": ("h1", "paragraph", "eyebrow"),
    "corporate-gifting-features.liquid": ("h1", "h2", "paragraph"),
    "horizontal-product-slider.liquid": ("h1", "h2", "paragraph"),
    "skincare-guide.liquid": ("h1", "h2", "paragraph"),
    # brand-page has h1/h2 tags + wired eyebrow text; keep those three + body
    "brand-page.liquid": ("h1", "h2", "paragraph", "eyebrow"),
    "business-advantages.liquid": ("h1", "paragraph"),
    "business-form.liquid": ("h1", "paragraph"),
    "business-hero.liquid": ("h1", "paragraph"),
    "business-process.liquid": ("h1", "paragraph"),
    "business-solutions.liquid": ("h1", "paragraph"),
    "care-kit-collection.liquid": ("h1", "paragraph"),
    "corporate-gifting-form.liquid": ("h1", "paragraph"),
    "corporate-gifting-packages.liquid": ("h1", "paragraph"),
    "corporate-gifting-process.liquid": ("h1", "paragraph"),
    "faq.liquid": ("h1", "paragraph"),
    "how-to-use-guide.liquid": ("h1", "paragraph"),
    "premium-scrolling-hero.liquid": ("h1", "paragraph"),
    "product-hero.liquid": ("h1", "paragraph"),
    "search-results.liquid": ("h1", "paragraph"),
    "sor-product-hero.liquid": ("h1", "paragraph"),
    "vanrosector-product-hero.liquid": ("h1", "paragraph"),
    "collection-aplus-slider.liquid": ("h1",),
    "business-marquee.liquid": ("h1",),
    "corporate-gifting-marquee.liquid": ("h1",),
    "how-to-use-banner.liquid": ("h1",),
    "bestsellers.liquid": ("h2", "paragraph", "eyebrow"),
    "community-testimonials.liquid": ("h2", "paragraph", "eyebrow"),
    "feature-grid.liquid": ("h2", "paragraph", "eyebrow"),
    "featured-brands.liquid": ("h2", "paragraph", "eyebrow"),
    "function-category.liquid": ("h2", "paragraph", "eyebrow"),
    "materials-showcase.liquid": ("h2", "paragraph", "eyebrow"),
    "bundle-upsell.liquid": ("h2", "paragraph"),
    "hague-protect-dna.liquid": ("h2", "paragraph"),
    "product-recommendations.liquid": ("h2", "paragraph"),
    "promo-banner.liquid": ("h2", "paragraph"),
    "reviews-grid.liquid": ("h2", "paragraph"),
    "social-slider.liquid": ("h2", "paragraph"),
    "trending-social.liquid": ("h2", "eyebrow"),
    "brand-banner.liquid": ("h2",),
    "trust-statement.liquid": ("h2",),
    "announcement-bar.liquid": ("paragraph",),
    "brand-selection.liquid": ("paragraph",),
    "dtc-product-card.liquid": ("paragraph",),
    "footer.liquid": ("paragraph",),
    "product-banner.liquid": ("paragraph",),
    "product-family.liquid": ("paragraph",),
    # No editable text driven by section typography controls
    "cart-drawer.liquid": tuple(),
    "category.liquid": tuple(),
    "collection-aplus-banner.liquid": tuple(),
    "community.liquid": tuple(),
    "how-to-use-videos.liquid": tuple(),
    "social-proof.liquid": tuple(),
    "video-demo.liquid": tuple(),
}


def group_of(setting: dict) -> str | None:
    sid = setting.get("id")
    if isinstance(sid, str):
        for g in GROUP_ORDER:
            if sid.startswith(f"{g}_font_"):
                return g
    if setting.get("type") == "header":
        content = setting.get("content")
        if isinstance(content, str):
            for g, aliases in GROUP_HEADER_ALIASES.items():
                if content in aliases:
                    return g
    return None


def is_typo_meta(setting: dict) -> bool:
    if setting.get("type") == "header" and setting.get("content") == "Typography":
        return True
    if setting.get("type") == "paragraph":
        content = setting.get("content") or ""
        return bool(
            re.match(
                r"^(Fonts for (this section only|the header only)|Only fonts used in this section)",
                content,
            )
        )
    return False


def intro_for(keep: tuple[str, ...], filename: str) -> str:
    parts: list[str] = []
    n = 1
    for g in GROUP_ORDER:
        if g not in keep:
            continue
        if filename == "header.liquid":
            label = HEADER_LABELS[g].replace(" (titles + links)", "")
        else:
            label = GROUP_LABELS[g]
        parts.append(f"{n}. {label}")
        n += 1
    if filename == "header.liquid":
        return (
            f"Fonts for the header only: {', '.join(parts)}. "
            "Brand fonts are at the top of each list."
        )
    return (
        f"Only fonts used in this section: {', '.join(parts)}. "
        "Brand fonts are at the top of each list."
    )


def trim_settings(settings: list, keep: tuple[str, ...], filename: str) -> list:
    before: list = []
    typo_items: list = []
    after: list = []
    in_typo = False

    for setting in settings:
        if not isinstance(setting, dict):
            (after if in_typo else before).append(setting)
            continue

        if is_typo_meta(setting) or group_of(setting) is not None:
            in_typo = True
            typo_items.append(setting)
            continue

        if in_typo:
            after.append(setting)
        else:
            before.append(setting)

    if not keep:
        return before + after

    rebuilt: list = [
        {"type": "header", "content": "Typography"},
        {"type": "paragraph", "content": intro_for(keep, filename)},
    ]

    n = 1
    for g in GROUP_ORDER:
        if g not in keep:
            continue
        if filename == "header.liquid":
            label = HEADER_LABELS[g]
        else:
            label = f"{n}. {GROUP_LABELS[g]}"
        rebuilt.append({"type": "header", "content": label})
        for item in typo_items:
            if group_of(item) == g and item.get("id"):
                rebuilt.append(item)
        n += 1

    return before + rebuilt + after


def main() -> None:
    updated = 0
    skipped: list[str] = []

    for path in sorted(SECTIONS.glob("*.liquid")):
        if path.name not in KEEP_MAP:
            continue

        keep = KEEP_MAP[path.name]
        text = path.read_text(encoding="utf-8")
        match = re.search(
            r"(\{% schema %\}\r?\n)(.*?)(\r?\n\{% endschema %\})",
            text,
            flags=re.S,
        )
        if not match:
            skipped.append(f"{path.name} (no schema)")
            continue

        try:
            schema = json.loads(match.group(2))
        except json.JSONDecodeError as exc:
            skipped.append(f"{path.name} (parse failed: {exc})")
            continue

        settings = schema.get("settings")
        if not isinstance(settings, list):
            skipped.append(f"{path.name} (no settings)")
            continue

        schema["settings"] = trim_settings(settings, keep, path.name)
        new_schema = json.dumps(schema, indent=2, ensure_ascii=False)
        new_text = (
            text[: match.start()]
            + match.group(1)
            + new_schema
            + match.group(3)
            + text[match.end() :]
        )

        if new_text != text:
            path.write_text(new_text, encoding="utf-8", newline="\n")
            updated += 1
            print(f"Updated: {path.name} -> keep [{', '.join(keep) or 'none'}]")

    print(f"\nUpdated files: {updated}")
    if skipped:
        print("Skipped: " + ", ".join(skipped))


if __name__ == "__main__":
    main()
