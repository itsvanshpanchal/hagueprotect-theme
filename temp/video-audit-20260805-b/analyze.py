from pathlib import Path
from PIL import Image
import numpy as np

out = Path(r"C:\Users\vansh\Downloads\theme_export__hagueprotect-com-theme-export-hagueprotect-com-theme-export-hag__01MAY2026-0446pm\temp\video-audit-20260805-b")
frames = sorted(out.glob("frame_*.jpg"))
prev = None
print("=== PIXEL DIFF TIMELINE ===")
stuck_runs = []
run_start = None
for f in frames:
    im = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32)
    n = int(f.stem.split("_")[1])
    t = n * 1.2
    mean = im.mean(axis=(0,1))
    h,w,_ = im.shape
    top = im[:h//5].mean()
    mid = im[h//3:2*h//3].mean()
    bot = im[4*h//5:].mean()
    diff = 0.0 if prev is None else float(np.mean(np.abs(im - prev)))
    flag = ""
    if prev is not None:
        if diff < 2.0:
            flag = " STUCK"
            if run_start is None: run_start = t
        else:
            if run_start is not None:
                stuck_runs.append((run_start, t - 1.2, t - 1.2 - run_start))
                run_start = None
            if diff > 25: flag = " JUMP"
    print(f"{t:05.1f}s f{n:03d} diff={diff:6.1f} mean={mean.mean():5.1f} top={top:5.1f} mid={mid:5.1f} bot={bot:5.1f}{flag}")
    prev = im
if run_start is not None:
    stuck_runs.append((run_start, frames[-1] and int(frames[-1].stem.split('_')[1])*1.2, 0))
print("\n=== STUCK RUNS ===")
for s,e,d in stuck_runs:
    if d >= 2.0:
        print(f"  {s:.1f}s -> {e:.1f}s ({d:.1f}s frozen)")

# Contact sheets in batches
key_sets = [
    list(range(1, 15)),
    list(range(15, 29)),
    list(range(29, 43)),
    list(range(43, 57)),
    list(range(57, 71)),
]
for bi, keys in enumerate(key_sets):
    imgs = []
    for n in keys:
        p = out / f"frame_{n:03d}.jpg"
        if p.exists():
            imgs.append(Image.open(p).convert("RGB").resize((130, 282)))
    cols = 7
    rows = (len(imgs)+cols-1)//cols
    sheet = Image.new("RGB", (cols*130, rows*282), (18,18,18))
    for i,im in enumerate(imgs):
        sheet.paste(im, ((i%cols)*130, (i//cols)*282))
    sp = out / f"sheet_{bi+1}.jpg"
    sheet.save(sp, quality=85)
    print("SHEET", sp)
