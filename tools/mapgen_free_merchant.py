"""Draws the 'Free Merchant - Main Deck' tabletop map and its wall data.
Run: python3 tools/mapgen_free_merchant.py  (writes into maps/ and updates maps/index.json)
Grid: 70 px per square, 1 m per square."""
import json, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

G = 70; COLS, ROWS = 31, 19; SS = 2  # supersample
W, H = COLS * G, ROWS * G
root = Path(__file__).resolve().parent.parent
random.seed(7)

# rooms in grid cells (x1,y1,x2,y2)
ROOMS = {
    "Engineering": (2, 4, 7, 15, (52, 44, 40)),
    "Cargo Bay":   (7, 3, 14, 16, (44, 48, 54)),
    "Crew Cabin":  (14, 4, 18, 8, (46, 50, 66)),
    "Galley":      (18, 4, 23, 8, (58, 52, 44)),
    "Cabin 2":     (14, 11, 18, 15, (46, 50, 66)),
    "Medbay":      (18, 11, 23, 15, (40, 58, 58)),
    "Corridor":    (14, 8, 23, 11, (38, 42, 50)),
    "Bridge":      (23, 6, 28, 13, (36, 46, 64)),
    "Airlock":     (9, 16, 12, 18, (60, 44, 44)),
}
# door unit edges: ('v', x, y) is the vertical edge at x from y..y+1; ('h', x, y) horizontal at y from x..x+1
DOORS = [("v", 7, 9), ("v", 7, 10), ("v", 14, 9), ("v", 14, 10), ("h", 15, 8), ("h", 16, 8), ("h", 20, 8), ("h", 21, 8),
         ("h", 15, 11), ("h", 16, 11), ("h", 20, 11), ("h", 21, 11), ("v", 23, 9), ("v", 23, 10), ("h", 10, 16), ("h", 11, 16), ("h", 10, 18), ("h", 11, 18)]
DOORSET = set(DOORS)

def edges(r):
    x1, y1, x2, y2 = r[:4]; e = set()
    for x in range(x1, x2): e.add(("h", x, y1)); e.add(("h", x, y2))
    for y in range(y1, y2): e.add(("v", x1, y)); e.add(("v", x2, y))
    return e

all_e = set()
for name, r in ROOMS.items():
    e = edges(r)
    if name == "Bridge": e = {k for k in e if not (k[0] == "v" and k[1] == 28)}  # nose drawn separately
    all_e |= e
wall_e = all_e - DOORSET

def merge(es, door=False):
    """Join unit edges that touch end-to-end into longer straight segments."""
    out = []
    hs = sorted((y, x) for k, x, y in es if k == "h")
    vs = sorted((x, y) for k, x, y in es if k == "v")
    for line, items, horiz in ((None, hs, True), (None, vs, False)):
        run = None
        for fixed, start in items:
            if run and run[0] == fixed and run[2] == start: run[2] = start + 1
            else:
                if run: out.append((run, horiz))
                run = [fixed, start, start + 1]
        if run: out.append((run, horiz))
    segs = []
    for (fixed, a, b), horiz in out:
        seg = dict(x1=a * G, y1=fixed * G, x2=b * G, y2=fixed * G) if horiz else dict(x1=fixed * G, y1=a * G, x2=fixed * G, y2=b * G)
        if door: seg.update(door=True, open=False)
        segs.append(seg)
    return segs

walls = merge(wall_e)
# doors: merge pairs into single door segments
walls += merge(DOORSET & all_e, door=True)
# bridge nose
walls += [dict(x1=28 * G, y1=6 * G, x2=int(29.6 * G), y2=int(9.5 * G)), dict(x1=int(29.6 * G), y1=int(9.5 * G), x2=28 * G, y2=13 * G)]
# hull (outer boundary, also blocks sight to space)

# ---------- art ----------
S = SS
img = Image.new("RGB", (W * S, H * S), (6, 8, 14))
d = ImageDraw.Draw(img)
for _ in range(900):
    x, y = random.randrange(W * S), random.randrange(H * S); r = random.choice([1, 1, 1, 2, 3]); c = random.randint(120, 255)
    d.ellipse([x, y, x + r, y + r], fill=(c, c, min(255, c + 20)))
P = lambda v: int(v * G * S)
hull = [(1.4, 3.2), (6, 2.4), (14.6, 2.2), (23.4, 4.8), (28.6, 5.4), (30.3, 9.5), (28.6, 13.6), (23.4, 14.2), (14.6, 16.4), (12.6, 18.6), (8.4, 18.6), (6, 16.6), (1.4, 15.8)]
d.polygon([(P(x), P(y)) for x, y in hull], fill=(70, 76, 88), outline=(140, 150, 170))
# hull plating seams
for i in range(0, COLS * 2):
    x = P(i / 2)
    d.line([(x, 0), (x, H * S)], fill=(64, 70, 82), width=S)
hull_mask = Image.new("L", img.size, 0); ImageDraw.Draw(hull_mask).polygon([(P(x), P(y)) for x, y in hull], fill=255)
space = Image.new("RGB", img.size, (6, 8, 14)); dd = ImageDraw.Draw(space)
random.seed(7)
for _ in range(900):
    x, y = random.randrange(W * S), random.randrange(H * S); r = random.choice([1, 1, 1, 2, 3]); c = random.randint(120, 255)
    dd.ellipse([x, y, x + r, y + r], fill=(c, c, min(255, c + 20)))
img = Image.composite(img, space, hull_mask); d = ImageDraw.Draw(img)
d.polygon([(P(x), P(y)) for x, y in hull], outline=(150, 160, 182), width=3 * S)
# floors
for name, (x1, y1, x2, y2, col) in ROOMS.items():
    d.rectangle([P(x1), P(y1), P(x2), P(y2)], fill=col)
    # floor tiles
    for gx in range(x1, x2):
        for gy in range(y1, y2):
            j = random.randint(-5, 5); c2 = tuple(max(0, min(255, v + j)) for v in col)
            d.rectangle([P(gx) + 2 * S, P(gy) + 2 * S, P(gx + 1) - 2 * S, P(gy + 1) - 2 * S], fill=c2)
            if name in ("Corridor", "Engineering", "Airlock"):
                for k in range(1, 5): d.line([(P(gx) + k * G * S // 5, P(gy) + 6 * S), (P(gx) + k * G * S // 5, P(gy + 1) - 6 * S)], fill=tuple(max(0, v - 10) for v in c2), width=S)
# bridge nose floor
d.polygon([(P(28), P(6)), (P(29.6), P(9.5)), (P(28), P(13))], fill=ROOMS["Bridge"][4])

def box(x1, y1, x2, y2, fill, out=(20, 22, 28)):
    d.rectangle([P(x1), P(y1), P(x2), P(y2)], fill=fill, outline=out, width=2 * S)
# props: cargo crates
for (x, y, w, h) in [(8, 4, 2, 2), (10.2, 4, 2, 2), (8, 6.2, 2, 1.6), (12, 12, 1.6, 3.4), (8, 12.5, 3, 2.2), (12.2, 4, 1.6, 1.6)]:
    box(x + .1, y + .1, x + w - .1, y + h - .1, (122, 96, 58))
    d.line([(P(x + .1), P(y + .1)), (P(x + w - .1), P(y + h - .1))], fill=(90, 70, 42), width=2 * S)
    d.line([(P(x + w - .1), P(y + .1)), (P(x + .1), P(y + h - .1))], fill=(90, 70, 42), width=2 * S)
# engineering: reactor + spike drive
cx, cy = P(4.5), P(9.5); r = P(1.6)
d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(30, 34, 42), outline=(90, 200, 255), width=3 * S)
d.ellipse([cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2], fill=(120, 220, 255))
box(2.3, 4.3, 6.7, 5.6, (60, 64, 72)); box(2.3, 13.4, 6.7, 14.7, (60, 64, 72))
# bunks
for (x, y) in [(14.3, 4.3), (16.2, 4.3), (14.3, 13.2), (16.2, 13.2)]:
    box(x, y, x + 1.5, y + 1.5 if y < 10 else y + 1.5, (78, 86, 120))
# galley table + counter
box(19.2, 5.2, 21.8, 6.6, (110, 92, 70)); box(18.2, 4.2, 22.8, 4.7, (90, 90, 96))
# medbay beds
for x in (18.6, 20.8): box(x, 12.4, x + 1.6, 14.6, (210, 220, 220))
# bridge consoles
for (x, y) in [(26.2, 7.2), (26.2, 10.8), (27.6, 9.0)]:
    box(x, y, x + 1.1, y + 1, (40, 70, 110), (120, 200, 255))
box(24.2, 9.1, 25.2, 9.9, (90, 60, 60))
# walls
for w_ in walls:
    col = (230, 150, 40) if w_.get("door") else (200, 208, 224)
    wid = 7 * S if w_.get("door") else 9 * S
    d.line([(w_["x1"] * S, w_["y1"] * S), (w_["x2"] * S, w_["y2"] * S)], fill=(15, 16, 20), width=wid + 4 * S)
    d.line([(w_["x1"] * S, w_["y1"] * S), (w_["x2"] * S, w_["y2"] * S)], fill=col, width=wid)
# labels
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15 * S)
except Exception: font = ImageFont.load_default()
for name, (x1, y1, x2, y2, _) in ROOMS.items():
    if name in ("Corridor",): continue
    tx, ty = P(x1) + 8 * S, P(y1) + 6 * S
    d.text((tx, ty), name.upper(), fill=(220, 228, 245), font=font, stroke_width=3 * S // 2, stroke_fill=(10, 12, 18))
img = img.resize((W, H), Image.LANCZOS)
out = root / "maps"; out.mkdir(exist_ok=True)
img.save(out / "free-merchant-deck.jpg", quality=88, optimize=True)
img.resize((W // 6, H // 6), Image.LANCZOS).save(out / "free-merchant-deck-thumb.jpg", quality=80)
entry = dict(id="free-merchant-deck", name="Free Merchant: Main Deck", desc="Starship deck: bridge, cabins, galley, medbay, cargo, engineering. Walls and doors set.",
             file="maps/free-merchant-deck.jpg", thumb="maps/free-merchant-deck-thumb.jpg", w=W, h=H, gridPx=G, offX=0, offY=0, scale=1, lighting="lit", walls=walls)
idx_p = out / "index.json"
idx = json.loads(idx_p.read_text()) if idx_p.exists() else []
idx = [e for e in idx if e.get("id") != entry["id"]] + [entry]
idx_p.write_text(json.dumps(idx, indent=1))
print("walls", len(walls), "size", W, H)
