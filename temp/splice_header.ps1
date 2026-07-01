# splice_header.ps1 — Replaces hardcoded mega menu with dynamic linklist-based version

$basePath = "c:\Users\vansh\Downloads\theme_export__hagueprotect-com-theme-export-hagueprotect-com-theme-export-hag__01MAY2026-0446pm"
$file = Join-Path $basePath "sections\header.liquid"

Write-Host "Reading $file ..."
$lines = [System.IO.File]::ReadAllLines($file)
Write-Host "Original line count: $($lines.Count)"

# ── Desktop mega menu replacement (replaces file-lines 630–770, array 629–769) ──

$desktop = @'
    {%- assign mega_links = linklists[section.settings.shop_all_menu] -%}
    {%- if mega_links != blank and mega_links.links.size > 0 -%}
    <div class="megamenu-grid" style="grid-template-columns: repeat({{ mega_links.links.size }}, 1fr); gap: 40px;">
      {%- for column_link in mega_links.links -%}
        {%- assign col_index = forloop.index -%}
        {%- assign col_heading_color = '#111111' -%}
        {%- for block in section.blocks -%}
          {%- if block.type == 'mega_column_style' and block.settings.column_index == col_index -%}
            {%- assign col_heading_color = block.settings.heading_color -%}
          {%- endif -%}
        {%- endfor -%}
        <div class="megamenu-col">
          {%- for heading_link in column_link.links -%}
            <h3 class="megamenu-heading" style="color: {{ col_heading_color }} !important; margin-bottom: 12px;">{{ heading_link.title }}</h3>
            {%- if heading_link.links.size > 0 -%}
            <ul class="megamenu-links" style="margin-bottom: 24px;">
              {%- for product_link in heading_link.links -%}
                <li class="megamenu-link-item">
                  {%- assign link_parts = product_link.title | split: '|' -%}
                  {%- if link_parts.size > 1 -%}
                    <span style="font-size: 11px; font-weight: 700; color: #999; text-transform: uppercase; display: block; margin-top: 5px;">{{ link_parts[0] | strip }}</span>
                    <a href="{{ product_link.url }}" style="font-size: 13px;">{{ link_parts[1] | strip }}</a>
                  {%- else -%}
                    <a href="{{ product_link.url }}">{{ product_link.title }}</a>
                  {%- endif -%}
                </li>
              {%- endfor -%}
            </ul>
            {%- endif -%}
          {%- endfor -%}
        </div>
      {%- endfor -%}
    </div>
    {%- else -%}
    <div class="megamenu-grid" style="grid-template-columns: 1fr; gap: 40px;">
      <div class="megamenu-col" style="text-align: center; padding: 24px;">
        <h3 class="megamenu-heading" style="color: #FF2B2B !important; margin-bottom: 12px;">Shop All Menu</h3>
        <p style="font-size: 14px; color: #888; font-weight: 500; margin-bottom: 16px;">Configure the mega menu in Theme Settings &rarr; Header &rarr; &ldquo;Shop All Mega Menu&rdquo;.</p>
        <a href="/collections/all" style="font-size: 14px; color: #FF2B2B; font-weight: 700; text-decoration: none;">Browse All Products &rarr;</a>
      </div>
    </div>
    {%- endif -%}
'@ -split "`r`n|`n"


# ── Mobile accordion replacement (replaces file-lines 827–925, array 826–924) ──

$mobile = @'
        {%- assign mega_links_mobile = linklists[section.settings.shop_all_menu] -%}
        {%- if mega_links_mobile != blank and mega_links_mobile.links.size > 0 -%}
          {%- for column_link in mega_links_mobile.links -%}
            {%- assign col_index_m = forloop.index -%}
            {%- assign mobile_heading_color = '#111' -%}
            {%- for block in section.blocks -%}
              {%- if block.type == 'mega_column_style' and block.settings.column_index == col_index_m -%}
                {%- assign mobile_heading_color = block.settings.heading_color -%}
              {%- endif -%}
            {%- endfor -%}
            {%- for heading_link in column_link.links -%}
              <div>
                <h4 class="mobile-accordion-category-heading" style="color: {{ mobile_heading_color }};">{{ heading_link.title }}</h4>
                {%- if heading_link.links.size > 0 -%}
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; padding-left: 8px;">
                  {%- for product_link in heading_link.links -%}
                    {%- assign link_parts_m = product_link.title | split: '|' -%}
                    {%- if link_parts_m.size > 1 -%}
                      <a href="{{ product_link.url }}" style="color:#666; text-decoration:none; font-size:14px;">{{ link_parts_m[0] | strip }} &mdash; {{ link_parts_m[1] | strip }}</a>
                    {%- else -%}
                      <a href="{{ product_link.url }}" style="color:#666; text-decoration:none; font-size:14px;">{{ product_link.title }}</a>
                    {%- endif -%}
                  {%- endfor -%}
                </div>
                {%- endif -%}
              </div>
            {%- endfor -%}
          {%- endfor -%}
        {%- else -%}
          <div style="padding: 16px 0;">
            <p style="font-size: 13px; color: #888;">Menu not configured. Visit Theme Settings to set up the Shop All menu.</p>
            <a href="/collections/all" style="color:#FF2B2B; text-decoration:none; font-size:14px; font-weight: 700;">Browse All Products &rarr;</a>
          </div>
        {%- endif -%}
'@ -split "`r`n|`n"


# ── Schema replacement (replaces file-lines 1144–1168, array 1143–1167) ──

$schema = @'
{% schema %}
{
  "name": "Header",
  "settings": [
    {
      "type": "link_list",
      "id": "menu",
      "label": "Menu",
      "default": "main-menu"
    },
    {
      "type": "link_list",
      "id": "shop_all_menu",
      "label": "Shop All Mega Menu",
      "info": "Select a 3-level navigation menu: Level 1 = Columns, Level 2 = Category Headings, Level 3 = Product Links. Tip: Use a pipe character | in link titles to show subtitles on desktop (e.g. 1. Leather|Leather Care Kit)."
    },
    {
      "type": "text",
      "id": "logo_text",
      "label": "Logo Text",
      "default": "HAGUEPROTECT"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#ffffff"
    }
  ],
  "blocks": [
    {
      "type": "mega_column_style",
      "name": "Column Heading Color",
      "limit": 8,
      "settings": [
        {
          "type": "range",
          "id": "column_index",
          "min": 1,
          "max": 8,
          "step": 1,
          "label": "Column Number",
          "default": 1,
          "info": "Which column in the Shop All menu to apply this color to"
        },
        {
          "type": "color",
          "id": "heading_color",
          "label": "Heading Color",
          "default": "#FF2B2B"
        }
      ]
    }
  ]
}
{% endschema %}
'@ -split "`r`n|`n"


# ── Build new file ──

$newLines = [System.Collections.Generic.List[string]]::new()

# Lines 1–629 (array 0..628) — CSS + HTML up to megamenu-panel opening
$newLines.AddRange([string[]]$lines[0..628])

# Desktop mega menu (dynamic replacement)
$newLines.AddRange([string[]]$desktop)

# Lines 771–826 (array 770..825) — between mega menu closing and mobile accordion
$newLines.AddRange([string[]]$lines[770..825])

# Mobile accordion (dynamic replacement)
$newLines.AddRange([string[]]$mobile)

# Lines 926–1143 (array 925..1142) — after mobile accordion, before schema
$newLines.AddRange([string[]]$lines[925..1142])

# Schema (dynamic replacement)
$newLines.AddRange([string[]]$schema)

# Lines 1169+ (array 1168+) — trailing content after schema
if ($lines.Count -gt 1168) {
    $newLines.AddRange([string[]]$lines[1168..($lines.Count - 1)])
}

# Write back
$encoding = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllLines($file, $newLines.ToArray(), $encoding)

Write-Host "Done! New line count: $($newLines.Count)"
Write-Host "Desktop mega menu: $($desktop.Count) lines"
Write-Host "Mobile accordion: $($mobile.Count) lines"
Write-Host "Schema: $($schema.Count) lines"
