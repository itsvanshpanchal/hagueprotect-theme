const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const fragment = fs.readFileSync(path.join(root, 'config/hp-science-section-typography-schema.fragment'), 'utf8').trim();
const typoSettings = JSON.parse(`[${fragment}]`);
const misplacedTypes = new Set(['header', 'paragraph', 'range', 'select']);

const files = fs.readdirSync(path.join(root, 'sections'))
  .filter((f) => f.startsWith('hp-science-') && f.endsWith('.liquid') && f !== 'hp-science-typography.liquid');

for (const file of files) {
  const filePath = path.join(root, 'sections', file);
  let content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/\{% schema %\}([\s\S]*)\{% endschema %\}/);
  if (!match) continue;

  const schema = JSON.parse(match[1]);
  const moved = [];

  if (Array.isArray(schema.blocks)) {
    schema.blocks = schema.blocks.filter((block) => {
      if (misplacedTypes.has(block.type)) {
        moved.push(block);
        return false;
      }
      return true;
    });
  }

  schema.settings = (schema.settings || []).filter((s) => {
    if (s.id && s.id.startsWith('sci_typo_')) return false;
    if (s.type === 'header' && String(s.content || '').startsWith('Typography')) return false;
    if (s.type === 'paragraph' && String(s.content || '').includes("Control this section's text sizes")) return false;
    return true;
  });

  schema.settings.push(...(moved.length ? moved : typoSettings));

  const newSchema = JSON.stringify(schema, null, 2);
  content = content.replace(/\{% schema %\}[\s\S]*\{% endschema %\}/, `{% schema %}\n${newSchema}\n{% endschema %}`);
  fs.writeFileSync(filePath, content);

  const ok = schema.settings.some((s) => s.id === 'sci_typo_heading_desktop');
  console.log(`${file}: typography in settings=${ok}, blocks=${schema.blocks?.length ?? 0}`);
}
