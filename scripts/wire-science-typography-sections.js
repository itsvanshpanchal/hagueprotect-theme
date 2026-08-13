const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sections = fs
  .readdirSync(path.join(root, 'sections'))
  .filter((f) => f.startsWith('hp-science-') && f.endsWith('.liquid') && f !== 'hp-science-typography.liquid');

const topTypoLine = "  {% render 'hp-science-section-typography', section: section %}";

for (const file of sections) {
  const filePath = path.join(root, 'sections', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  while (content.includes(topTypoLine)) {
    content = content.replace(topTypoLine + '\n', '');
    content = content.replace(topTypoLine + '\r\n', '');
    content = content.replace(topTypoLine, '');
    changed = true;
  }

  const endApply = "{% render 'hp-science-section-typography-apply-only', section: section %}";
  const endStyles = "{% render 'hp-science-section-typography-styles', section: section %}";

  if (content.includes(endApply) && !content.includes(endStyles)) {
    content = content.replace(endApply, endStyles);
    changed = true;
  }

  if (!content.includes('hp-science-section-typography-styles') && content.includes('{%- endstyle -%}')) {
    content = content.replace(
      '{%- endstyle -%}',
      `  ${endStyles}\n{%- endstyle -%}`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('updated', file);
  } else {
    console.log('skip', file);
  }
}
