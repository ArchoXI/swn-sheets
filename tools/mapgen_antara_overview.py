"""Antara large-scale maps: the ocean chart (1 square = 1 km) and the raft city (1 square = 150 m).
Run: python3 tools/mapgen_antara_overview.py"""
import sys, math, random
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from mapkit import Deck, SS, INK, update_index, shade, GLOW, TEAL
from PIL import Image, ImageDraw, ImageFilter, ImageChops


def poly_round(cx, cy, rx, ry, n=28, jitter=.05, seed=0):
    rnd = random.Random(seed)
    return [(cx + math.cos(a) * rx * (1 + rnd.uniform(-jitter, jitter)), cy + math.sin(a) * ry * (1 + rnd.uniform(-jitter, jitter))) for a in [k / n * 6.2832 for k in range(n)]]


def glow_spot(D, x, y, r, col, blur=40):
    g = Image.new("RGB", D.img.size, (0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse([D.p(x - r), D.p(y - r), D.p(x + r), D.p(y + r)], fill=col)
    D.img = ImageChops.add(D.img, g.filter(ImageFilter.GaussianBlur(D.u(blur)))); D.d = ImageDraw.Draw(D.img)


def building(D, x, y, w, h, col, height=1.0):
    """Top-down rooftop with a long drop shadow and a little roof clutter."""
    X1, Y1, X2, Y2 = D.p(x), D.p(y), D.p(x + w), D.p(y + h)
    off = D.u(6 + 10 * height)
    D.d.rectangle([X1 + off, Y1 + off, X2 + off, Y2 + off], fill=(20, 26, 32))
    D.d.rectangle([X1, Y1, X2, Y2], fill=col, outline=INK, width=D.u(3))
    D.d.line([(X1 + D.u(4), Y1 + D.u(4)), (X2 - D.u(4), Y1 + D.u(4))], fill=shade(col, 1.18), width=D.u(2))
    for _ in range(random.randint(0, 3)):
        bw, bh = random.uniform(.12, .25) * D.S, random.uniform(.12, .25) * D.S
        bx, by = random.uniform(X1 + D.u(6), max(X1 + D.u(7), X2 - bw - D.u(6))), random.uniform(Y1 + D.u(6), max(Y1 + D.u(7), Y2 - bh - D.u(6)))
        D.d.rectangle([bx, by, bx + bw, by + bh], fill=shade(col, .78), outline=INK, width=D.u(1))
    if random.random() < .25:
        D.d.line([(X1 + D.u(6), Y2 - D.u(6)), (X2 - D.u(6), Y1 + D.u(6))], fill=shade(col, .86), width=D.u(2))


def tower(D, x, y, r, col):
    X, Y, R = D.p(x), D.p(y), int(r * D.S)
    D.d.ellipse([X - R + D.u(22), Y - R + D.u(22), X + R + D.u(22), Y + R + D.u(22)], fill=(20, 26, 32))
    D.d.ellipse([X - R, Y - R, X + R, Y + R], fill=col, outline=INK, width=D.u(3))
    D.d.ellipse([X - R * .6, Y - R * .6, X + R * .6, Y + R * .6], outline=shade(col, .8), width=D.u(2))
    D.d.ellipse([X - D.u(5), Y - D.u(5), X + D.u(5), Y + D.u(5)], fill=(255, 220, 140))


def dashed(D, pts, col=(200, 255, 240), dash=.35, gap=.25, width=4):
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        L = math.hypot(x2 - x1, y2 - y1); t = 0
        while t < L:
            a, b = t / L, min(1, (t + dash) / L)
            D.d.line([D.pt(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a), D.pt(x1 + (x2 - x1) * b, y1 + (y2 - y1) * b)], fill=col, width=D.u(width))
            t += dash + gap


# ======================= OCEAN CHART (1 km squares) =======================
def chart():
    D = Deck(40, 28, seed=707, px=100); D.ocean(.7)
    # deep trench and reef shallows
    tr = Image.new("L", D.img.size, 0); td = ImageDraw.Draw(tr)
    td.line([D.pt(-1, 27), D.pt(12, 24.5), D.pt(24, 26.5), D.pt(41, 21)], fill=255, width=D.u(220), joint="curve")
    D.img.paste((3, 26, 46), (0, 0), tr.filter(ImageFilter.GaussianBlur(D.u(90))).point(lambda v: int(v * .85))); D.d = ImageDraw.Draw(D.img)
    sh = Image.new("L", D.img.size, 0); sd = ImageDraw.Draw(sh)
    for (x, y, r) in [(4.5, 4.5, 2.6), (7, 3, 1.6), (3, 8, 1.3), (37, 26, 1.8)]:
        sd.ellipse([D.p(x - r), D.p(y - r * .7), D.p(x + r), D.p(y + r * .7)], fill=255)
    sh = sh.filter(ImageFilter.GaussianBlur(D.u(40)))
    D.img.paste((70, 190, 180), (0, 0), sh.point(lambda v: int(v * .6))); D.d = ImageDraw.Draw(D.img)
    for _ in range(26):   # reef rocks
        x, y = random.choice([(4.5, 4.5), (7, 3), (3, 8), (37, 26)]); x += random.uniform(-1.8, 1.8); y += random.uniform(-1.2, 1.2); r = random.uniform(.06, .2)
        D.d.ellipse([D.p(x - r), D.p(y - r), D.p(x + r), D.p(y + r)], fill=(110, 112, 104), outline=INK, width=D.u(2))
    # plankton bloom field
    for k in range(7): glow_spot(D, 16 + random.uniform(-3, 3), 6 + random.uniform(-2, 2), random.uniform(1.2, 2.6), (20, 120, 90), blur=60)
    # whirlpool
    cx, cy = 35.5, 14
    for k in range(14):
        r = .2 + k * .14; D.d.arc([D.p(cx - r), D.p(cy - r), D.p(cx + r), D.p(cy + r)], k * 40, k * 40 + 230, fill=(160, 240, 230) if k % 2 else (20, 70, 90), width=D.u(4))
    # trade lanes
    city, scrap, rig, farm, beacon = (12, 14), (28.5, 8), (31, 21.5), (20, 23), (21, 13.2)
    for a, b in [(city, beacon), (beacon, scrap), (beacon, rig), (city, farm), (farm, rig)]:
        dashed(D, [a, b])
    # raft city
    rp = poly_round(*city, 2.2, 1.8, n=24, seed=1)
    glow_spot(D, *city, 3.4, (40, 60, 40), blur=50)
    D.platform(rp, base=(170, 178, 184))
    for k in range(8):
        a = k / 8 * 6.283; ex, ey = city[0] + math.cos(a) * 2.35, city[1] + math.sin(a) * 1.95
        D.circle(ex, ey, .28, (70, 74, 82), ring=(150, 156, 166))
    for (x, y, r, c) in [(12, 14, .8, (200, 204, 210)), (13.2, 13, .4, (226, 142, 52)), (10.6, 13.4, .5, (110, 170, 120)), (11, 15.2, .45, (190, 130, 90)), (13.1, 15.3, .5, (120, 150, 190))]:
        D.circle(x, y, r, c)
    for _ in range(40):
        x, y = city[0] + random.uniform(-1.8, 1.8), city[1] + random.uniform(-1.4, 1.4)
        if ((x - city[0]) / 1.9) ** 2 + ((y - city[1]) / 1.55) ** 2 < 1: building(D, x, y, random.uniform(.1, .22), random.uniform(.1, .22), random.choice([(200, 204, 210), (180, 186, 196), (214, 206, 190)]), .2)
    D.pad(13.4, 12.6, .7, .7)
    # scrap city: lashed hulls
    for (x, y, rx, ry, c) in [(28, 7.6, .7, .5, (130, 120, 108)), (29.2, 7.4, .6, .45, (120, 128, 136)), (28.2, 8.7, .55, .45, (136, 118, 96)), (29.3, 8.6, .55, .5, (126, 124, 112)), (30.2, 8.1, .4, .55, (110, 118, 124))]:
        D.platform(poly_round(x, y, rx, ry, n=10, jitter=.18, seed=int(x * 10 + y)), base=c, rust=.4)
    for a, b in [((28.6, 7.5), (28.7, 7.5)), ((28.3, 8.1), (28.3, 8.3)), ((28.7, 8.7), (28.85, 8.7)), ((29.75, 8.4), (29.85, 8.3))]:
        D.d.line([D.pt(*a), D.pt(*b)], fill=(150, 112, 70), width=D.u(10))
    # harvester rig with its glowing intake wake
    wk = Image.new("RGB", D.img.size, (0, 0, 0)); wd = ImageDraw.Draw(wk)
    wd.line([D.pt(31, 21.5), D.pt(34, 23), D.pt(38, 23.4)], fill=(30, 200, 160), width=D.u(70), joint="curve")
    D.img = ImageChops.add(D.img, wk.filter(ImageFilter.GaussianBlur(D.u(30)))); D.d = ImageDraw.Draw(D.img)
    D.platform([(30.4, 21), (31.6, 21), (31.6, 22), (30.4, 22)], base=(132, 140, 136), rust=.2)
    for (x, y) in [(30.75, 21.3), (31.25, 21.3)]: D.circle(x, y, .15, (196, 200, 196))
    D.water([(30.55, 21.6), (31.45, 21.6), (31.45, 21.88), (30.55, 21.88)], glow=1.9)
    # fish-farm raft (net pens)
    D.platform([(19.2, 22.4), (20.8, 22.4), (20.8, 23.6), (19.2, 23.6)], base=(150, 140, 120))
    for gx in range(4):
        for gy in range(3):
            D.water([(19.35 + gx * .37, 22.55 + gy * .35), (19.6 + gx * .37, 22.55 + gy * .35), (19.6 + gx * .37, 22.78 + gy * .35), (19.35 + gx * .37, 22.78 + gy * .35)], glow=1.4, rim=(170, 150, 110))
    # navigation beacon buoy
    for r, c in ((.5, (40, 120, 110)), (.3, TEAL), (.14, GLOW)): glow_spot(D, *beacon, r * 2.2, shade(c, .5), blur=20)
    D.circle(*beacon, .18, (226, 142, 52), ring=(255, 230, 160))
    # shipwreck, half sunk, with debris
    D.boat(6.5, 22.5, 2.2, .7, -28, col=(150, 140, 130), trim=(110, 70, 50))
    sk = Image.new("L", D.img.size, 0); ImageDraw.Draw(sk).polygon([D.pt(6.9, 21.6), D.pt(8.2, 22.2), D.pt(7.4, 23.6), D.pt(6.2, 23)], fill=200)
    D.img.paste((10, 70, 84), (0, 0), sk.filter(ImageFilter.GaussianBlur(D.u(10)))); D.d = ImageDraw.Draw(D.img)
    for _ in range(14):
        x, y = 6.5 + random.uniform(-1.4, 1.4), 22.5 + random.uniform(-1, 1)
        D.d.rectangle([D.p(x), D.p(y), D.p(x) + D.u(random.randint(6, 16)), D.p(y) + D.u(random.randint(4, 10))], fill=(120, 110, 96), outline=INK, width=D.u(1))
    # storm cell, top-right corner
    st = Image.new("L", D.img.size, 0); sd2 = ImageDraw.Draw(st)
    for k in range(40):
        a = k * .5; r = .3 + k * .1; x, y = 36 + math.cos(a) * r, 3.5 + math.sin(a) * r * .8
        sd2.ellipse([D.p(x - .9), D.p(y - .7), D.p(x + .9), D.p(y + .7)], fill=random.randint(110, 190))
    st = st.filter(ImageFilter.GaussianBlur(D.u(26)))
    D.img.paste((224, 232, 236), (0, 0), st.point(lambda v: int(v * .78))); D.d = ImageDraw.Draw(D.img)
    for _ in range(4):
        x, y = 35 + random.uniform(-2, 2), 4 + random.uniform(-1.5, 1.5); pts = [(x, y)]
        for _k in range(5): x += random.uniform(-.3, .3); y += random.uniform(.15, .35); pts.append((x, y))
        D.d.line([D.pt(*p) for p in pts], fill=(255, 250, 200), width=D.u(4))
    # compass (arrow only)
    X, Y = D.pt(38, 25.6)
    D.d.ellipse([X - D.u(46), Y - D.u(46), X + D.u(46), Y + D.u(46)], fill=(236, 238, 240), outline=INK, width=D.u(4))
    D.d.polygon([(X, Y - D.u(40)), (X + D.u(14), Y), (X, Y + D.u(8)), (X - D.u(14), Y)], fill=(198, 60, 50), outline=INK)
    D.d.polygon([(X, Y + D.u(40)), (X + D.u(14), Y), (X, Y - D.u(8)), (X - D.u(14), Y)], fill=(200, 204, 210), outline=INK)
    D.save("antara-ocean-chart")
    return D


# ======================= RAFT CITY (150 m squares) =======================
def raft_city():
    D = Deck(40, 30, seed=808, px=100); D.ocean(.6)
    C = (20, 15); RX, RY = 15.2, 12.2
    rim = poly_round(*C, RX, RY, n=36, jitter=.035, seed=4)
    glow_spot(D, *C, 17, (20, 44, 40), blur=80)
    # engine pods on struts
    for k in range(10):
        a = k / 10 * 6.283 + .2; ex, ey = C[0] + math.cos(a) * (RX + 1.2), C[1] + math.sin(a) * (RY + 1.1)
        D.d.line([D.pt(C[0] + math.cos(a) * RX * .95, C[1] + math.sin(a) * RY * .95), D.pt(ex, ey)], fill=INK, width=D.u(40)); D.d.line([D.pt(C[0] + math.cos(a) * RX * .95, C[1] + math.sin(a) * RY * .95), D.pt(ex, ey)], fill=(110, 116, 124), width=D.u(30))
        wk = Image.new("L", D.img.size, 0); ImageDraw.Draw(wk).ellipse([D.p(ex - 1.8), D.p(ey - 1.8), D.p(ex + 1.8), D.p(ey + 1.8)], fill=110)
        D.img.paste((190, 255, 245), (0, 0), wk.filter(ImageFilter.GaussianBlur(D.u(30)))); D.d = ImageDraw.Draw(D.img)
        D.circle(ex, ey, 1.05, (70, 74, 82), ring=(150, 156, 166))
        X, Y = D.pt(ex, ey)
        for b in range(0, 360, 30): D.d.line([(X, Y), (X + math.cos(math.radians(b)) * D.u(80), Y + math.sin(math.radians(b)) * D.u(80))], fill=(150, 156, 166), width=D.u(5))
        D.circle(ex, ey, .3, (226, 142, 52))
    D.platform(rim, base=(150, 158, 166))
    inner = poly_round(*C, RX - .8, RY - .7, n=36, jitter=.02, seed=4)
    D.d.line([D.pt(*p) for p in inner + [inner[0]]], fill=(110, 118, 126), width=D.u(10))
    # districts as sectors between avenues
    angs = [-90, -30, 30, 90, 150, 210, 270]
    fills = [(176, 182, 188), (150, 154, 150), (160, 168, 176), (196, 182, 160), (172, 178, 192), (150, 180, 140)]
    def sector(a1, a2, r0=3.6):
        pts = [(C[0] + math.cos(math.radians(a)) * r0 * 1.25, C[1] + math.sin(math.radians(a)) * r0) for a in range(a1, a2 + 1, 5)]
        pts += [(C[0] + math.cos(math.radians(a)) * (RX - 1.2), C[1] + math.sin(math.radians(a)) * (RY - 1.1)) for a in range(a2, a1 - 1, -5)]
        return pts
    secs = [sector(angs[i], angs[i + 1]) for i in range(6)]
    for poly, col in zip(secs, fills):
        D.d.polygon([D.pt(*p) for p in poly], fill=col)
    # roads: ring road, avenues, rim promenade
    road = Image.new("L", D.img.size, 0); rd = ImageDraw.Draw(road)
    rd.ellipse([D.p(C[0] - 4.7), D.p(C[1] - 3.75), D.p(C[0] + 4.7), D.p(C[1] + 3.75)], outline=255, width=D.u(60))
    rd.ellipse([D.p(C[0] - 10), D.p(C[1] - 8), D.p(C[0] + 10), D.p(C[1] + 8)], outline=255, width=D.u(44))
    for a in angs[:-1]:
        rd.line([D.pt(C[0] + math.cos(math.radians(a)) * 4.4, C[1] + math.sin(math.radians(a)) * 3.5), D.pt(C[0] + math.cos(math.radians(a)) * (RX - .9), C[1] + math.sin(math.radians(a)) * (RY - .8))], fill=255, width=D.u(60))
    rd.line([D.pt(*p) for p in inner + [inner[0]]], fill=255, width=D.u(40))
    D.img.paste((96, 102, 110), (0, 0), road); D.d = ImageDraw.Draw(D.img)
    edge = road.filter(ImageFilter.FIND_EDGES)
    D.img.paste(INK, (0, 0), edge.point(lambda v: 255 if v > 40 else 0)); D.d = ImageDraw.Draw(D.img)
    for a in angs[:-1]:
        dashed(D, [(C[0] + math.cos(math.radians(a)) * 4.6, C[1] + math.sin(math.radians(a)) * 3.7), (C[0] + math.cos(math.radians(a)) * (RX - 1), C[1] + math.sin(math.radians(a)) * (RY - .9))], col=(236, 210, 120), dash=.4, gap=.4, width=3)
    road_px = road.load()
    def free(x, y, w, h):
        for px_, py_ in [(x, y), (x + w, y), (x, y + h), (x + w, y + h), (x + w / 2, y + h / 2)]:
            X, Y = D.p(px_), D.p(py_)
            if not (0 <= X < D.img.size[0] and 0 <= Y < D.img.size[1]) or road_px[X, Y] > 0: return False
        return True
    def inside(poly, x, y):
        ins = False; j = len(poly) - 1
        for i in range(len(poly)):
            xi, yi = poly[i]; xj, yj = poly[j]
            if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi): ins = not ins
            j = i
        return ins
    def fill_buildings(poly, palette, sizes=(.6, 1.6), step=1.05, height=1.0, prob=.85):
        y = min(p[1] for p in poly)
        while y < max(p[1] for p in poly):
            x = min(p[0] for p in poly)
            while x < max(p[0] for p in poly):
                w, h = random.uniform(*sizes), random.uniform(*sizes)
                if random.random() < prob and all(inside(poly, xx, yy) for xx, yy in [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]) and free(x, y, w, h) and clear(x, y, w, h, .05):
                    occ.append((x, y, w, h)); building(D, x, y, w * .9, h * .9, random.choice(palette), height * random.uniform(.6, 1.4))
                x += step * random.uniform(.9, 1.3)
            y += step * random.uniform(.9, 1.2)
    occ = []
    def clear(x, y, w, h, pad=.25):
        return all(x + w + pad < a or a + c + pad < x or y + h + pad < b or b + d + pad < y for a, b, c, d in occ)
    def place(poly, w, h, tries=400):
        xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
        for _ in range(tries):
            x, y = random.uniform(min(xs), max(xs) - w), random.uniform(min(ys), max(ys) - h)
            if all(inside(poly, xx, yy) for xx, yy in [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]) and free(x, y, w, h) and clear(x, y, w, h):
                occ.append((x, y, w, h)); return x, y
        return None
    # 0: spaceport (north-east): landing pads, hangars, fuel tanks
    for _ in range(4):
        q = place(secs[0], 2.3, 2.3)
        if q: D.pad(q[0], q[1], 2.3, 2.3)
    for _ in range(4):
        q = place(secs[0], 1.6, 1.0)
        if q: building(D, q[0], q[1], 1.6, 1.0, (150, 160, 172), .9)
    for _ in range(5):
        q = place(secs[0], .9, .9)
        if q: D.tank(q[0] + .45, q[1] + .45, .4)
    # 1: industrial (east): tank farms and big sheds
    for _ in range(9):
        q = place(secs[1], 1.1, 1.1)
        if q: D.tank(q[0] + .55, q[1] + .55, .5, col=(196, 200, 196))
    for _ in range(14):
        w, h = random.uniform(1, 2.2), random.uniform(1, 1.8); q = place(secs[1], w, h)
        if q: building(D, q[0], q[1], w * .95, h * .95, random.choice([(130, 136, 140), (150, 146, 136), (120, 128, 136)]), .8)
    # 2: harbor (south-east): inlet of open water with piers and ferries, warehouses around it
    bay = poly_round(23, 25.6, 3.4, 2.2, n=20, jitter=.03, seed=9)
    occ.append((19.4, 23.2, 7.2, 4.6))
    D.water(bay, glow=1.2)
    for x in (21, 22.6, 24.2):
        D.platform([(x, 23.6), (x + .45, 23.6), (x + .45, 26.6), (x, 26.6)], base=(160, 166, 172), shadow=False)
    D.boat(21.8, 25.6, 1.4, .5, 90); D.boat(23.4, 25.2, 1.6, .55, 92, col=(206, 196, 170), trim=(214, 90, 70)); D.boat(25.4, 25.8, 1.5, .5, 70)
    for _ in range(26):
        w, h = random.uniform(.8, 1.7), random.uniform(.6, 1.2); q = place(secs[2], w, h)
        if q: building(D, q[0], q[1], w, h, random.choice([(170, 176, 186), (186, 180, 168), (150, 140, 120)]), .7)
    for _ in range(18):
        q = place(secs[2], .4, .4, tries=100)
        if q: D.crate(q[0], q[1], .4, .4)
    # 3: market (south-west): dense, colourful
    fill_buildings(secs[3], [(204, 120, 96), (214, 190, 120), (120, 170, 190), (196, 176, 150), (170, 120, 150), (220, 214, 200)], sizes=(.45, .95), step=.8, height=.5, prob=.92)
    # 4: residential towers (west)
    for _ in range(40):
        r = random.uniform(.45, .75); q = place(secs[4], r * 2, r * 2, tries=200)
        if q: tower(D, q[0] + r, q[1] + r, r, random.choice([(188, 196, 210), (210, 214, 222), (170, 184, 204)]))
    for _ in range(3):
        q = place(secs[4], 1.6, 1.2)
        if q: D.d.ellipse([D.p(q[0]), D.p(q[1]), D.p(q[0] + 1.6), D.p(q[1] + 1.2)], fill=(110, 160, 100), outline=INK, width=D.u(3))
    fill_buildings(secs[4], [(180, 186, 196), (196, 200, 210)], sizes=(.5, .8), step=.9, height=.4, prob=.5)
    # 5: hydroponic gardens (north)
    y = 3.4
    while y < 10:
        x = 3
        while x < 21:
            if inside(secs[5], x, y) and inside(secs[5], x + 1.6, y + .7) and free(x, y, 1.6, .7):
                D.d.rectangle([D.p(x), D.p(y), D.p(x + 1.6), D.p(y + .7)], fill=(96, 150, 90), outline=INK, width=D.u(2))
                for k in range(1, 6): D.d.line([(D.p(x) + k * D.S * 1.6 / 6, D.p(y) + D.u(4)), (D.p(x) + k * D.S * 1.6 / 6, D.p(y + .7) - D.u(4))], fill=(140, 200, 120), width=D.u(3))
            x += 1.9
        y += 1.0
    # civic heart: plaza, council dome, fuel authority tower
    D.d.ellipse([D.p(C[0] - 4.2), D.p(C[1] - 3.3), D.p(C[0] + 4.2), D.p(C[1] + 3.3)], fill=(214, 210, 200), outline=INK, width=D.u(4))
    for k in range(24):
        a = k / 24 * 6.283; D.d.line([D.pt(C[0] + math.cos(a) * 1.6, C[1] + math.sin(a) * 1.3), D.pt(C[0] + math.cos(a) * 4.1, C[1] + math.sin(a) * 3.2)], fill=(196, 190, 178), width=D.u(2))
    D.circle(C[0] - .3, C[1] + .2, 1.6, (180, 200, 196), ring=(226, 176, 52))
    X, Y = D.pt(C[0] - .3, C[1] + .2)
    for k in range(12): a = k / 12 * 6.283; D.d.line([(X, Y), (X + math.cos(a) * D.u(150), Y + math.sin(a) * D.u(150))], fill=(150, 170, 166), width=D.u(3))
    D.circle(C[0] - .3, C[1] + .2, .35, (240, 236, 220))
    building(D, C[0] + 2, C[1] - 2.3, 1.2, 1.2, (110, 120, 140), 3)
    D.circle(C[0] + 2.6, C[1] - 1.7, .32, (226, 142, 52))
    for (x, y) in [(C[0] - 3, C[1] - 1.5), (C[0] - 3, C[1] + 1.6), (C[0] + 2.9, C[1] + 1.5)]: D.circle(x, y, .3, (110, 160, 100))
    D.grime()
    D.save("antara-raft-city")
    return D


if __name__ == "__main__":
    a = chart(); b = raft_city()
    update_index([
        dict(id="antara-ocean-chart", name="Antara: Ocean Chart", desc="Large-scale chart, 1 square = 1 km: raft city, scrap city, harvester rig, beacon, fish farm, reefs, bloom, wreck, whirlpool, storm.",
             file="maps/antara-ocean-chart.jpg", thumb="maps/antara-ocean-chart-thumb.jpg", w=a.W, h=a.H, gridPx=100, offX=0, offY=0, scale=1000, lighting="lit", fog=False, walls=[],
             notes="1 square = 1 km. Raft city centre-left, scrap city north-east, harvester rig south-east with its glowing wake, fish farm south, beacon in the middle of the lanes, reefs north-west, wreck south-west, whirlpool east, storm north-east, deep trench along the south."),
        dict(id="antara-raft-city", name="Antara: Raft City", desc="The main floating city, 1 square = 150 m: spaceport, industry, harbor, markets, towers, gardens, civic plaza, engine pods.",
             file="maps/antara-raft-city.jpg", thumb="maps/antara-raft-city-thumb.jpg", w=b.W, h=b.H, gridPx=100, offX=0, offY=0, scale=150, lighting="lit", fog=False, walls=[],
             notes="1 square = 150 m (the city is ~4.5 km across, matching the ocean chart). Clockwise from the top-right: spaceport pads, industrial tanks, harbor inlet (south), markets (south-west), residential towers (west), hydroponic gardens (north). Centre: council dome and the fuel authority tower."),
    ])
    print("ok", a.W, a.H, b.W, b.H)
