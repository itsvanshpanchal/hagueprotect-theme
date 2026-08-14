const fs = require('fs');
const path = require('path');

const newSettings = `    {
      "type": "color",
      "id": "sci_typo_heading_color",
      "label": "Heading text color"
    },
    {
      "type": "color",
      "id": "sci_typo_eyebrow_color",
      "label": "Eyebrow text color"
    },`;

// Update fragment
const fragPath = path.join('config', 'hp-science-section-typography-schema.fragment');
if (fs.existsSync(fragPath)) {
    let frag = fs.readFileSync(fragPath, 'utf8');
    if (!frag.includes('sci_typo_heading_color')) {
        frag = frag.replace(
            /("id": "sci_typo_body_color"[\s\S]*?},)/,
            `$1\n${newSettings}`
        );
        fs.writeFileSync(fragPath, frag);
    }
}

// Update sections
const sectionsDir = 'sections';
const files = fs.readdirSync(sectionsDir).filter(f => f.startsWith('hp-science-') && f.endsWith('.liquid'));

for (const file of files) {
    const filePath = path.join(sectionsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('sci_typo_heading_color') && content.includes('"id": "sci_typo_body_color"')) {
        content = content.replace(
            /("id": "sci_typo_body_color"[\s\S]*?},)/,
            `$1\n${newSettings}`
        );
        fs.writeFileSync(filePath, content);
    }
}

// Update hp-science-section-typography-styles.liquid snippet
const snippetPath = path.join('snippets', 'hp-science-section-typography-styles.liquid');
let snippet = fs.readFileSync(snippetPath, 'utf8');

if (!snippet.includes('typo_heading_color')) {
    const colorExtract = `
  assign typo_heading_color = section.settings.sci_typo_heading_color | strip
  if typo_heading_color == 'rgba(0,0,0,0)' or typo_heading_color == 'rgba(0, 0, 0, 0)' or typo_heading_color == 'transparent'
    assign typo_heading_color = blank
  endif

  assign typo_eyebrow_color = section.settings.sci_typo_eyebrow_color | strip
  if typo_eyebrow_color == 'rgba(0,0,0,0)' or typo_eyebrow_color == 'rgba(0, 0, 0, 0)' or typo_eyebrow_color == 'transparent'
    assign typo_eyebrow_color = blank
  endif
`;
    snippet = snippet.replace('-%}', `${colorExtract}-%}`);

    snippet = snippet.replace('--hp-sci-sec-heading-size: 52px;', '--hp-sci-sec-heading-size: {{ section.settings.sci_typo_heading_desktop | default: 52 }}px;');
    snippet = snippet.replace('--hp-sci-sec-subheading-size: 52px;', '--hp-sci-sec-subheading-size: {{ section.settings.sci_typo_subheading_desktop | default: 52 }}px;');
    snippet = snippet.replace('--hp-sci-sec-body-size: 23px;', '--hp-sci-sec-body-size: {{ section.settings.sci_typo_body_desktop | default: 23 }}px;');
    snippet = snippet.replace('--hp-sci-sec-eyebrow-size: 19px;', '--hp-sci-sec-eyebrow-size: {{ section.settings.sci_typo_eyebrow_desktop | default: 19 }}px;');

    snippet = snippet.replace('--hp-sci-sec-heading-size: 24px;', '--hp-sci-sec-heading-size: {{ section.settings.sci_typo_heading_mobile | default: 24 }}px;');
    snippet = snippet.replace('--hp-sci-sec-subheading-size: 24px;', '--hp-sci-sec-subheading-size: {{ section.settings.sci_typo_subheading_mobile | default: 24 }}px;');
    snippet = snippet.replace('--hp-sci-sec-body-size: 17px;', '--hp-sci-sec-body-size: {{ section.settings.sci_typo_body_mobile | default: 17 }}px;');
    snippet = snippet.replace('--hp-sci-sec-eyebrow-size: 12px;', '--hp-sci-sec-eyebrow-size: {{ section.settings.sci_typo_eyebrow_mobile | default: 12 }}px;');

    snippet = snippet.replace(/font-size: 23px !important;/g, 'font-size: var(--hp-sci-sec-body-size) !important;');
    snippet = snippet.replace(/font-size: 17px !important;/g, 'font-size: var(--hp-sci-sec-body-size) !important;');
    
    snippet = snippet.replace(/font-size: 52px !important;/g, 'font-size: var(--hp-sci-sec-heading-size) !important;');
    snippet = snippet.replace(/font-size: 24px !important;/g, 'font-size: var(--hp-sci-sec-heading-size) !important;');
    
    snippet = snippet.replace(/font-size: 19px !important;/g, 'font-size: var(--hp-sci-sec-eyebrow-size) !important;');
    snippet = snippet.replace(/font-size: 12px !important;/g, 'font-size: var(--hp-sci-sec-eyebrow-size) !important;');

    const colorVars = `
  {%- if typo_heading_color != blank -%}
  --hp-sci-sec-heading-color: {{ typo_heading_color }};
  {%- endif -%}
  {%- if typo_eyebrow_color != blank -%}
  --hp-sci-sec-eyebrow-color: {{ typo_eyebrow_color }};
  {%- endif -%}
`;
    snippet = snippet.replace('{%- if body_color != blank -%}', `${colorVars}\n  {%- if body_color != blank -%}`);

    snippet = snippet.replace(/margin-bottom: 12px !important;/g, 'margin-bottom: 12px !important;\n  {%- if typo_eyebrow_color != blank -%}\n  color: var(--hp-sci-sec-eyebrow-color) !important;\n  {%- endif -%}');
    snippet = snippet.replace(/margin-bottom: 10px !important;/g, 'margin-bottom: 10px !important;\n  {%- if typo_eyebrow_color != blank -%}\n  color: var(--hp-sci-sec-eyebrow-color) !important;\n  {%- endif -%}');

    snippet = snippet.replace(/letter-spacing: -0.02em !important;\n  text-align: inherit;/g, 'letter-spacing: -0.02em !important;\n  text-align: inherit;\n  {%- if typo_heading_color != blank -%}\n  color: var(--hp-sci-sec-heading-color) !important;\n  {%- endif -%}');
    
    // Add spacing logic
    const spacingCSS = `
{{ sec }} > .hp-sci,
{{ sec }} > div > .hp-sci,
{{ sec }} {
  {% if section.settings.sci_typo_padding_top_desktop != blank %}
  padding-top: {{ section.settings.sci_typo_padding_top_desktop }}px !important;
  {% endif %}
  {% if section.settings.sci_typo_padding_bottom_desktop != blank %}
  padding-bottom: {{ section.settings.sci_typo_padding_bottom_desktop }}px !important;
  {% endif %}
}
{{ sec }} .hp-sci__inner {
  {% if section.settings.sci_typo_gutter_desktop != blank %}
  padding-left: {{ section.settings.sci_typo_gutter_desktop }}px !important;
  padding-right: {{ section.settings.sci_typo_gutter_desktop }}px !important;
  {% endif %}
}
@media screen and (max-width: 989px) {
  {{ sec }} > .hp-sci,
  {{ sec }} > div > .hp-sci,
  {{ sec }} {
    {% if section.settings.sci_typo_padding_top_mobile != blank %}
    padding-top: {{ section.settings.sci_typo_padding_top_mobile }}px !important;
    {% endif %}
    {% if section.settings.sci_typo_padding_bottom_mobile != blank %}
    padding-bottom: {{ section.settings.sci_typo_padding_bottom_mobile }}px !important;
    {% endif %}
  }
  {{ sec }} .hp-sci__inner {
    {% if section.settings.sci_typo_gutter_mobile != blank %}
    padding-left: {{ section.settings.sci_typo_gutter_mobile }}px !important;
    padding-right: {{ section.settings.sci_typo_gutter_mobile }}px !important;
    {% endif %}
  }
}
`;
    snippet = snippet + `\n${spacingCSS}`;

    fs.writeFileSync(snippetPath, snippet);
}
console.log('Done!');
