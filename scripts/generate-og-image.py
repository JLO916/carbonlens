from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
out_dir = 'public'

img = Image.new('RGB', (W, H), '#FFFFFF')
draw = ImageDraw.Draw(img)

# Background gradient effect — subtle green top bar
draw.rectangle([0, 0, W, 8], fill='#89B56C')

# Logo circle
cx, cy, r = 80, H // 2 - 30, 36
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill='#89B56C')

# "C" in logo — use default font large
try:
    font_logo = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 40)
except:
    font_logo = ImageFont.load_default()
draw.text((cx - 12, cy - 24), 'C', fill='white', font=font_logo)

# Title text
try:
    font_title = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 52)
    font_sub = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 26)
    font_small = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 20)
except:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_small = font_title

# Brand name
draw.text((140, H // 2 - 80), 'CarbonLens', fill='#1a1a1a', font=font_title)

# Tagline
draw.text((140, H // 2 - 15), 'Carbon Pricing & EU CBAM Calculator', fill='#6E9156', font=font_sub)
draw.text((140, H // 2 + 20), 'for Asia-Pacific Exporters', fill='#6E9156', font=font_sub)

# Bottom info
draw.text((140, H // 2 + 80), '6 Countries  ·  Domestic Carbon Cost  ·  CBAM Exposure  ·  Cross-border Deductions', fill='#999999', font=font_small)

# Country flags row
flags = ['🇹🇼', '🇸🇬', '🇰🇷', '🇯🇵', '🇹🇭', '🇻🇳']
# Can't render emoji easily with PIL, use text labels instead
labels = ['TW', 'SG', 'KR', 'JP', 'TH', 'VN']
x_start = 140
for i, label in enumerate(labels):
    x = x_start + i * 70
    y = H // 2 + 120
    draw.rounded_rectangle([x, y, x + 55, y + 30], radius=4, fill='#F3F4F6', outline='#D1D5DB')
    draw.text((x + 12, y + 4), label, fill='#374151', font=font_small)

# Right side decorative element — simple bar chart silhouette
bar_x = 850
bar_base = H // 2 + 100
bars = [(40, 120), (40, 180), (40, 90), (40, 150), (40, 60), (40, 200)]
for i, (w, h) in enumerate(bars):
    x = bar_x + i * 55
    color = '#89B56C' if i % 2 == 0 else '#3B82F6'
    draw.rectangle([x, bar_base - h, x + w, bar_base], fill=color)

# "Free" badge
draw.rounded_rectangle([bar_x, H // 2 - 80, bar_x + 100, H // 2 - 45], radius=14, fill='#89B56C')
draw.text((bar_x + 22, H // 2 - 76), 'FREE', fill='white', font=font_small)

img.save(os.path.join(out_dir, 'og-image.png'), 'PNG', quality=95)
print(f'Generated {out_dir}/og-image.png ({W}x{H})')
