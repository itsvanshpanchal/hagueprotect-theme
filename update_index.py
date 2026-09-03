import json
import re

path = 'templates/index.json'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Strip block comment at top
match = re.search(r'^/\*.*?\*/\s*', text, flags=re.DOTALL)
comment = ""
if match:
    comment = match.group(0)
    text = text[match.end():]

data = json.loads(text)

# Create the new section data
new_section = {
  'type': 'hp-composition',
  'settings': {
    'bg_color': '#F2EFE8',
    'accent_color': '#d2fa3c',
    'heading': 'ONE SHOE. ONE DROP. <span class="highlight">NO RESTOCK.</span>'
  },
  'blocks': {
    'card_1': {
      'type': 'card',
      'settings': {
        'bg_color': '#ffffff',
        'text_color': '#111111',
        'title': 'SR-FOAM™',
        'subtitle': 'Dual-density 34% rebound',
        'show_line': True
      }
    },
    'card_2': {
      'type': 'card',
      'settings': {
        'bg_color': '#ffffff',
        'text_color': '#111111',
        'title': 'FULL-GRAIN',
        'subtitle': 'Suede over abrasion knit',
        'show_line': True
      }
    },
    'card_3': {
      'type': 'card',
      'settings': {
        'bg_color': '#d2fa3c',
        'text_color': '#111111',
        'title': '300 PAIRS',
        'subtitle': 'Numbered. Then never again.',
        'show_line': True
      }
    },
    'card_4': {
      'type': 'card',
      'settings': {
        'bg_color': '#ffffff',
        'text_color': '#111111',
        'title': '312 G',
        'subtitle': 'Featherweight at a US 9',
        'show_line': True
      }
    },
    'card_5': {
      'type': 'card',
      'settings': {
        'bg_color': '#ffffff',
        'text_color': '#111111',
        'title': '8 MM DROP',
        'subtitle': 'Tuned for all-day wear',
        'show_line': True
      }
    },
    'card_6': {
      'type': 'card',
      'settings': {
        'bg_color': '#ffffff',
        'text_color': '#111111',
        'title': 'WAXED LACES',
        'subtitle': 'Volt dip finish',
        'show_line': True
      }
    }
  },
  'block_order': ['card_1', 'card_2', 'card_3', 'card_4', 'card_5', 'card_6']
}

# Insert it into sections
data['sections']['hp_composition'] = new_section

# Find 'hero' in order and insert after it, else just append
order = data.get('order', [])
if 'hero' in order:
    idx = order.index('hero')
    if 'hp_composition' in order:
        order.remove('hp_composition')
    order.insert(idx + 1, 'hp_composition')
else:
    if 'hp_composition' not in order:
        order.append('hp_composition')
    
data['order'] = order

out_json = json.dumps(data, indent=2, ensure_ascii=False)
with open(path, 'w', encoding='utf-8') as f:
    f.write(comment + out_json)

print("SUCCESS")
