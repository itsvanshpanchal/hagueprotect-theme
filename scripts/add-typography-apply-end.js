const fs = require('fs');
const path = require('path');

const sections = [
  'hp-science-hero',
  'hp-science-info-grid',
  'hp-science-media-banner',
  'hp-science-statement',
  'hp-science-feature-split',
  'hp-science-headline-bands',
  'hp-science-results-grid',
  'hp-science-commitment',
  'hp-science-protocol',
  'hp-science-ingredients',
  'hp-science-cta',
];

const applyLine =
  "  {% render 'hp-science-section-typography-apply-only', section: section %}";

for (const s of sections) {
  const file = path.join('sections', s + '.liquid');
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('hp-science-section-typography-apply-only')) {
    console.log('skip', s);
    continue;
  }
  if (!content.includes('{%- endstyle -%}')) {
    console.log('no endstyle', s);
    continue;
  }
  content = content.replace('{%- endstyle -%}', applyLine + '\n{%- endstyle -%}');
  fs.writeFileSync(file, content);
  console.log('updated', s);
}
