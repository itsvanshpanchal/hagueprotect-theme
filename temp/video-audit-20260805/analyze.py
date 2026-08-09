from pathlib import Path
from PIL import Image
import numpy as np

out = Path(r"C:\Users\vansh\Downloads\theme_export__hagueprotect-com-theme-export-hagueprotect-com-theme-export-hag__01MAY2026-0446pm\temp\video-audit-20260805")
frames = sorted(out.glob("frame_*.jpg"))
prev = None
print("=== PIXEL DIFF (mean abs) ===")
for f in frames:
    im = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
    n = int(f.stem.split("_")[1])
    t = n * 1.5
    mean = im.mean(axis=(0,1))
    # sample center band brightness
    h,w,_ = im.shape
    center = im[h//3:2*h//3, w//4:3*w//4].mean()
    top = im[:h//5].mean()
    bot = im[4*h//5:].mean()
    diff = 0.0 if prev is None else float(np.mean(np.abs(im - prev)))
    flag = ""
    if prev is not None:
        if diff < 2.0: flag = " STUCK"
        elif diff > 25: flag = " JUMP"
    print(f"{t:05.1f}s f{n:03d} diff={diff:6.1f} meanRGB=({mean[0]:5.1f},{mean[1]:5.1f},{mean[2]:5.1f}) top={top:5.1f} mid={center:5.1f} bot={bot:5.1f}{flag}")
    prev = im

# Export annotated contact sheet of key frames for manual review
key = [1,2,3,4,5,14,15,17,18,20,22,24,25,26,28,29,31]
imgs = []
for n in key:
    p = out / f"frame_{n:03d}.jpg"
    if p.exists():
        im = Image.open(p).convert("RGB")
        im = im.resize((196, 425))
        imgs.append(im)
cols = 4
rows = (len(imgs)+cols-1)//cols
sheet = Image.new("RGB", (cols*196, rows*425), (20,20,20))
for i,im in enumerate(imgs):
    sheet.paste(im, ((i%cols)*196, (i//cols)*425))
sheet_path = out / "contact_sheet.jpg"
sheet.save(sheet_path, quality=85)
print("SHEET", sheet_path)
