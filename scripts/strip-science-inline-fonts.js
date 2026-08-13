const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sectionsDir = path.join(root, 'sections');
const files = fs
  .readdirSync(sectionsDir)
  .filter((f) => f.startsWith('hp-science-') && f.endsWith('.liquid') && f !== 'hp-science-typography.liquid');

const fontProp = /^\s*font-(family|size|weight|style|synthesis):/;

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  content = content.replace(/\{%- style -%\}([\s\S]*?)\{%- endstyle -%\}/g, (match, styleBody) => {
    const lines = styleBody.split('\n');
    const filtered = lines.filter((line) => {
      const trimmed = line.trim();
      if (fontProp.test(trimmed)) return false;
      if (/^\s*letter-spacing:/.test(line)) return false;
      if (/padding:\s*\{\{\s*section\.settings\.(padding_top|formula_padding_top)/.test(line)) return false;
      return true;
    });
    const next = filtered.join('\n');
    if (next !== styleBody) changed = true;
    return `{%- style -%}${next}{%- endstyle -%}`;
  });

  if (content.includes('style="padding-left: 0; padding-right: 0; max-width: none;"')) {
    content = content.replace(/\s*style="padding-left: 0; padding-right: 0; max-width: none;"/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('cleaned', file);
  }
}
