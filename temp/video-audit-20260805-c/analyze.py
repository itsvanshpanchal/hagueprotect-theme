from pathlib import Path
from PIL import Image
import numpy as np
out = Path(r"C:\Users\vansh\Downloads\theme_export__hagueprotect-com-theme-export-hagueprotect-com-theme-export-hag__01MAY2026-0446pm\temp\video-audit-20260805-c")
frames = sorted(out.glob("frame_*.jpg"))
prev = None
print("=== TIMELINE ===")
for f in frames:
    im = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
    n = int(f.stem.split("_")[1]); t = n * 1.25
    diff = 0.0 if prev is None else float(np.mean(np.abs(im - prev)))
    flag = " STUCK" if prev is not None and diff < 2 else (" JUMP" if diff > 25 else "")
    h = im.shape[0]
    print(f"{t:05.1f}s f{n:03d} diff={diff:6.1f} mid={im[h//3:2*h//3].mean():5.1f}{flag}")
    prev = im
# sheets
for bi, keys in enumerate([list(range(1,15)), list(range(15,29)), list(range(29,43)), list(range(43,57)), list(range(57, len(frames)+1))]):
    imgs=[]
    for n in keys:
        p=out/f"frame_{n:03d}.jpg"
        if p.exists(): imgs.append(Image.open(p).convert("RGB").resize((130,282)))
    if not imgs: continue
    cols=7; rows=(len(imgs)+cols-1)//cols
    sheet=Image.new("RGB",(cols*130,rows*282),(18,18,18))
    for i,im in enumerate(imgs): sheet.paste(im,((i%cols)*130,(i//cols)*282))
    sheet.save(out/f"sheet_{bi+1}.jpg", quality=85)
    print("SHEET", bi+1, len(imgs))
