"""The Silverfish (free merchant): main deck, command deck and secret hold.
Based on Wyatt's Minecraft build (1 block = 1 square = 1 m). Front faces right.
Run: python3 tools/mapgen_silverfish.py"""
import json, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

PX = 100          # pixels per square in the final image
SS = 2            # supersampling
root = Path(__file__).resolve().parent.parent
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

HULL = (204, 186, 146); HULL_D = (168, 150, 112); HULL_L = (226, 212, 178)
WALL = (108, 120, 114); WALL_HI = (150, 162, 156); WALL_LO = (62, 70, 66)
TEAL = (64, 196, 178); GLOW = (210, 255, 248)

FLOORS = {
    "tile": ((126, 130, 138), (104, 108, 116)),
    "light": ((150, 154, 160), (124, 128, 134)),
    "grate": ((70, 74, 82), (54, 58, 64)),
    "cabin": ((82, 92, 112), (70, 78, 96)),
    "med": ((196, 214, 214), (170, 192, 194)),
    "warm": ((122, 108, 92), (102, 90, 76)),
    "dark": ((48, 50, 56), (38, 40, 46)),
}


class Deck:
    def __init__(self, cols, rows, seed=1):
        self.cols, self.rows = cols, rows
        self.W, self.H = cols * PX, rows * PX
        self.S = PX * SS
        random.seed(seed)
        self.img = Image.new("RGB", (self.W * SS, self.H * SS), (5, 7, 13))
        self.d = ImageDraw.Draw(self.img)
        self.rooms, self.doors, self.opens, self.extra_walls, self.windows = [], set(), set(), [], []
        self.font = lambda s: ImageFont.truetype(FONT, int(s * SS))
        self.fontr = lambda s: ImageFont.truetype(FONT_R, int(s * SS))

    def p(self, v): return int(round(v * self.S))
    def pt(self, x, y): return (self.p(x), self.p(y))
    def rect(self, x1, y1, x2, y2, **k): self.d.rectangle([self.p(x1), self.p(y1), self.p(x2) - 1, self.p(y2) - 1], **k)

    # ---------- background ----------
    def space(self):
        for _ in range(int(self.cols * self.rows * 2.2)):
            x, y = random.randrange(self.W * SS), random.randrange(self.H * SS)
            r = random.choice([1, 1, 2, 2, 3, 4]); c = random.randint(110, 255)
            self.d.ellipse([x, y, x + r, y + r], fill=(c, c, min(255, c + 25)))
        neb = Image.new("RGB", self.img.size, (0, 0, 0)); nd = ImageDraw.Draw(neb)
        for _ in range(6):
            x, y, r = random.randrange(self.W * SS), random.randrange(self.H * SS), random.randint(300, 900) * SS
            nd.ellipse([x - r, y - r, x + r, y + r], fill=random.choice([(30, 18, 50), (12, 30, 48), (40, 20, 30)]))
        self.img = ImageChops.add(self.img, neb.filter(ImageFilter.GaussianBlur(160 * SS)))
        self.d = ImageDraw.Draw(self.img)

    def hull(self, poly, lights=()):
        P = [self.pt(x, y) for x, y in poly]
        sh = Image.new("L", self.img.size, 0); ImageDraw.Draw(sh).polygon([(x + 18 * SS, y + 24 * SS) for x, y in P], fill=170)
        self.img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(20 * SS))); self.d = ImageDraw.Draw(self.img)
        self.d.polygon(P, fill=HULL)
        mask = Image.new("L", self.img.size, 0); ImageDraw.Draw(mask).polygon(P, fill=255)
        tex = Image.new("RGB", self.img.size, HULL); td = ImageDraw.Draw(tex)
        for gx in range(0, self.cols * 2):
            for gy in range(0, self.rows * 2):
                j = random.randint(-9, 9)
                c = tuple(max(0, min(255, v + j)) for v in HULL)
                td.rectangle([self.p(gx / 2), self.p(gy / 2), self.p((gx + 1) / 2) - 1, self.p((gy + 1) / 2) - 1], fill=c, outline=HULL_D)
        for _ in range(int(self.cols * self.rows / 3)):  # weathering streaks
            x, y = random.randrange(self.W * SS), random.randrange(self.H * SS); w = random.randint(40, 260) * SS
            td.line([(x, y), (x + w, y)], fill=random.choice([HULL_D, HULL_L]), width=random.randint(2, 6) * SS)
        self.img.paste(tex, (0, 0), mask); self.d = ImageDraw.Draw(self.img)
        self.d.line(P + [P[0]], fill=(120, 104, 74), width=7 * SS, joint="curve")
        self.d.line(P + [P[0]], fill=HULL_L, width=2 * SS, joint="curve")
        for x, y in lights:
            for r, c in ((26, (40, 120, 110)), (16, TEAL), (9, GLOW)):
                self.d.ellipse([self.p(x) - r * SS, self.p(y) - r * SS, self.p(x) + r * SS, self.p(y) + r * SS], fill=c)

    # ---------- rooms ----------
    def room(self, name, x1, y1, x2, y2, floor="tile", label=True, no_edge=()):
        self.rooms.append(dict(name=name, r=(x1, y1, x2, y2), floor=floor, label=label, no_edge=set(no_edge)))

    def floors(self):
        for rm in self.rooms:
            x1, y1, x2, y2 = rm["r"]; a, b = FLOORS[rm["floor"]]
            self.rect(x1, y1, x2, y2, fill=b)
            for gx in range(x1, x2):
                for gy in range(y1, y2):
                    j = random.randint(-6, 6); c = tuple(max(0, min(255, v + j)) for v in a)
                    X, Y = self.p(gx), self.p(gy); s = self.S
                    if rm["floor"] in ("grate", "dark"):
                        self.d.rectangle([X + 3 * SS, Y + 3 * SS, X + s - 3 * SS, Y + s - 3 * SS], fill=c)
                        for k in range(1, 6): self.d.line([(X + k * s // 6, Y + 8 * SS), (X + k * s // 6, Y + s - 8 * SS)], fill=b, width=3 * SS)
                    elif rm["floor"] == "cabin":
                        self.d.rectangle([X, Y, X + s, Y + s], fill=c)
                    else:  # bevelled plate with a dished centre, like the build's tiles
                        self.d.rectangle([X + 2 * SS, Y + 2 * SS, X + s - 2 * SS, Y + s - 2 * SS], fill=c)
                        self.d.line([(X + 4 * SS, Y + 4 * SS), (X + s - 4 * SS, Y + 4 * SS)], fill=tuple(min(255, v + 22) for v in c), width=3 * SS)
                        self.d.line([(X + 4 * SS, Y + 4 * SS), (X + 4 * SS, Y + s - 4 * SS)], fill=tuple(min(255, v + 22) for v in c), width=3 * SS)
                        m = s // 4; cc = tuple(max(0, v - 14) for v in c)
                        self.d.ellipse([X + m, Y + m, X + s - m, Y + s - m], fill=cc)
                        self.d.ellipse([X + m + 6 * SS, Y + m + 6 * SS, X + s - m - 6 * SS, Y + s - m - 6 * SS], fill=tuple(max(0, v - 6) for v in c))

    # ---------- walls ----------
    def door(self, kind, x, y, n=1):
        for i in range(n): self.doors.add((kind, x + i, y) if kind == "h" else (kind, x, y + i))

    def open(self, kind, x, y, n=1):
        for i in range(n): self.opens.add((kind, x + i, y) if kind == "h" else (kind, x, y + i))

    def edges(self):
        e = set()
        for rm in self.rooms:
            x1, y1, x2, y2 = rm["r"]
            for x in range(x1, x2): e |= {("h", x, y1), ("h", x, y2)}
            for y in range(y1, y2): e |= {("v", x1, y), ("v", x2, y)}
            e -= rm["no_edge"]
        return e

    @staticmethod
    def merge(es):
        out = []
        for horiz in (True, False):
            items = sorted((y, x) for k, x, y in es if k == "h") if horiz else sorted((x, y) for k, x, y in es if k == "v")
            run = None
            for fixed, start in items:
                if run and run[0] == fixed and run[2] == start: run[2] = start + 1
                else:
                    if run: out.append((run, horiz))
                    run = [fixed, start, start + 1]
            if run: out.append((run, horiz))
        return [((a, f, b, f) if h else (f, a, f, b)) for (f, a, b), h in out]

    def wall_segments(self):
        e = self.edges()
        walls = [dict(x1=a, y1=b, x2=c, y2=d) for a, b, c, d in self.merge(e - self.doors - self.opens)]
        doors = [dict(x1=a, y1=b, x2=c, y2=d, door=True, open=False) for a, b, c, d in self.merge(e & self.doors)]
        return walls, doors

    def draw_walls(self):
        walls, doors = self.wall_segments()
        segs = [(w["x1"], w["y1"], w["x2"], w["y2"]) for w in walls] + self.extra_walls
        # soft shadow
        sh = Image.new("L", self.img.size, 0); sd = ImageDraw.Draw(sh)
        for x1, y1, x2, y2 in segs: sd.line([(self.p(x1) + 10 * SS, self.p(y1) + 14 * SS), (self.p(x2) + 10 * SS, self.p(y2) + 14 * SS)], fill=150, width=34 * SS)
        self.img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(14 * SS))); self.d = ImageDraw.Draw(self.img)
        for x1, y1, x2, y2 in segs:
            A, B = self.pt(x1, y1), self.pt(x2, y2)
            self.d.line([A, B], fill=WALL_LO, width=30 * SS)
            self.d.line([A, B], fill=WALL, width=24 * SS)
            self.d.line([(A[0] - 4 * SS, A[1] - 4 * SS), (B[0] - 4 * SS, B[1] - 4 * SS)], fill=WALL_HI, width=6 * SS)
            for P_ in (A, B): self.d.rectangle([P_[0] - 15 * SS, P_[1] - 15 * SS, P_[0] + 15 * SS, P_[1] + 15 * SS], fill=WALL)
        for x1, y1, x2, y2 in self.windows:
            A, B = self.pt(x1, y1), self.pt(x2, y2)
            self.d.line([A, B], fill=(40, 70, 90), width=26 * SS); self.d.line([A, B], fill=(130, 210, 240), width=12 * SS)
            self.d.line([A, B], fill=(220, 250, 255), width=3 * SS)
        for dr in doors:
            A, B = self.pt(dr["x1"], dr["y1"]), self.pt(dr["x2"], dr["y2"])
            horiz = A[1] == B[1]
            self.d.line([A, B], fill=(30, 40, 44), width=22 * SS)
            self.d.line([A, B], fill=(70, 150, 140), width=14 * SS)
            mx, my = (A[0] + B[0]) // 2, (A[1] + B[1]) // 2
            if horiz: self.d.line([(mx, my - 9 * SS), (mx, my + 9 * SS)], fill=(20, 26, 28), width=4 * SS)
            else: self.d.line([(mx - 9 * SS, my), (mx + 9 * SS, my)], fill=(20, 26, 28), width=4 * SS)
            for P_ in (A, B): self.d.rectangle([P_[0] - 15 * SS, P_[1] - 15 * SS, P_[0] + 15 * SS, P_[1] + 15 * SS], fill=WALL)
            for P_ in (A, B): self.d.ellipse([P_[0] - 5 * SS, P_[1] - 5 * SS, P_[0] + 5 * SS, P_[1] + 5 * SS], fill=TEAL)
        return walls, doors

    # ---------- props ----------
    def crate(self, x, y, w, h, col=(176, 134, 78)):
        X1, Y1, X2, Y2 = self.p(x) + 6 * SS, self.p(y) + 6 * SS, self.p(x + w) - 6 * SS, self.p(y + h) - 6 * SS
        self.d.rectangle([X1 + 8 * SS, Y1 + 10 * SS, X2 + 8 * SS, Y2 + 10 * SS], fill=(0, 0, 0))
        self.d.rectangle([X1, Y1, X2, Y2], fill=col, outline=(96, 70, 38), width=4 * SS)
        dk = tuple(int(v * .75) for v in col)
        n = max(2, int(w * 3))
        for k in range(1, n): self.d.line([(X1 + (X2 - X1) * k // n, Y1), (X1 + (X2 - X1) * k // n, Y2)], fill=dk, width=2 * SS)
        self.d.rectangle([X1 + 10 * SS, Y1 + 10 * SS, X2 - 10 * SS, Y2 - 10 * SS], outline=dk, width=3 * SS)

    def console(self, x, y, w, h, screen=(80, 220, 255)):
        self.d.rounded_rectangle([self.p(x) + 6 * SS, self.p(y) + 6 * SS, self.p(x + w) - 6 * SS, self.p(y + h) - 6 * SS], radius=10 * SS, fill=(34, 40, 52), outline=(90, 104, 120), width=3 * SS)
        self.d.rounded_rectangle([self.p(x) + 16 * SS, self.p(y) + 16 * SS, self.p(x + w) - 16 * SS, self.p(y + h) - 16 * SS], radius=6 * SS, fill=tuple(v // 3 for v in screen), outline=screen, width=2 * SS)
        for k in range(3):
            yy = self.p(y) + 24 * SS + k * 12 * SS
            if yy < self.p(y + h) - 22 * SS: self.d.line([(self.p(x) + 24 * SS, yy), (self.p(x + w) - 24 * SS - random.randint(0, 30) * SS, yy)], fill=screen, width=3 * SS)

    def seat(self, x, y, face="right"):
        cx, cy = self.p(x + .5), self.p(y + .5); r = int(.32 * self.S)
        self.d.ellipse([cx - r + 6 * SS, cy - r + 8 * SS, cx + r + 6 * SS, cy + r + 8 * SS], fill=(0, 0, 0))
        self.d.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=12 * SS, fill=(48, 150, 136), outline=(24, 90, 80), width=4 * SS)
        off = {"right": (-r, 0), "left": (r, 0), "up": (0, r), "down": (0, -r)}[face]
        bx, by = cx + off[0] * .8, cy + off[1] * .8
        self.d.rounded_rectangle([bx - (8 if face in "leftright" else r) * SS // (1 if face in "leftright" else SS), by - (r if face in "leftright" else 8 * SS), bx + (8 * SS if face in "leftright" else r), by + (r if face in "leftright" else 8 * SS)], radius=6 * SS, fill=(30, 110, 100))

    def bed(self, x, y, w=1, h=2, vertical=True):
        X1, Y1, X2, Y2 = self.p(x) + 8 * SS, self.p(y) + 8 * SS, self.p(x + w) - 8 * SS, self.p(y + h) - 8 * SS
        self.d.rectangle([X1 + 6 * SS, Y1 + 8 * SS, X2 + 6 * SS, Y2 + 8 * SS], fill=(0, 0, 0))
        self.d.rounded_rectangle([X1, Y1, X2, Y2], radius=10 * SS, fill=(220, 224, 228), outline=(120, 124, 130), width=3 * SS)
        if vertical:
            self.d.rounded_rectangle([X1 + 4 * SS, Y1 + int((Y2 - Y1) * .3), X2 - 4 * SS, Y2 - 4 * SS], radius=8 * SS, fill=(40, 170, 180))
            self.d.rounded_rectangle([X1 + 12 * SS, Y1 + 10 * SS, X2 - 12 * SS, Y1 + int((Y2 - Y1) * .24)], radius=8 * SS, fill=(248, 248, 250))
        else:
            self.d.rounded_rectangle([X1 + int((X2 - X1) * .3), Y1 + 4 * SS, X2 - 4 * SS, Y2 - 4 * SS], radius=8 * SS, fill=(40, 170, 180))
            self.d.rounded_rectangle([X1 + 10 * SS, Y1 + 12 * SS, X1 + int((X2 - X1) * .24), Y2 - 12 * SS], radius=8 * SS, fill=(248, 248, 250))

    def locker(self, x, y, w=1, h=1):
        self.d.rectangle([self.p(x) + 8 * SS, self.p(y) + 8 * SS, self.p(x + w) - 8 * SS, self.p(y + h) - 8 * SS], fill=(84, 92, 104), outline=(40, 46, 54), width=4 * SS)
        for k in range(1, int(w * 2)): self.d.line([(self.p(x + k / 2), self.p(y) + 12 * SS), (self.p(x + k / 2), self.p(y + h) - 12 * SS)], fill=(40, 46, 54), width=3 * SS)

    def hazard(self, x1, y1, x2, y2):
        X1, Y1, X2, Y2 = self.p(x1), self.p(y1), self.p(x2), self.p(y2)
        tile = Image.new("RGB", (X2 - X1, Y2 - Y1), (230, 180, 40)); td = ImageDraw.Draw(tile)
        for k in range(-(Y2 - Y1), X2 - X1, 40 * SS): td.polygon([(k, Y2 - Y1), (k + 20 * SS, Y2 - Y1), (k + 20 * SS + (Y2 - Y1), 0), (k + (Y2 - Y1), 0)], fill=(30, 30, 30))
        self.img.paste(tile, (X1, Y1))

    def lift(self, x, y, w, h, label="CARGO LIFT"):
        X1, Y1, X2, Y2 = self.p(x), self.p(y), self.p(x + w), self.p(y + h)
        self.hazard(x, y, x + w, y + h)
        self.d.rectangle([X1 + 16 * SS, Y1 + 16 * SS, X2 - 16 * SS, Y2 - 16 * SS], fill=(78, 84, 92), outline=(30, 34, 40), width=4 * SS)
        for k in range(1, 7): self.d.line([(X1 + 16 * SS, Y1 + 16 * SS + (Y2 - Y1 - 32 * SS) * k // 7), (X2 - 16 * SS, Y1 + 16 * SS + (Y2 - Y1 - 32 * SS) * k // 7)], fill=(60, 66, 74), width=3 * SS)
        cx, cy = (X1 + X2) // 2, (Y1 + Y2) // 2; a = 26 * SS
        for dy in (-1, 1):
            self.d.polygon([(cx - a, cy + dy * 12 * SS), (cx + a, cy + dy * 12 * SS), (cx, cy + dy * (12 * SS + a))], fill=(230, 180, 40))
        f = self.font(15); t = label
        tw = self.d.textlength(t, font=f); self.d.text((cx - tw / 2, Y2 - 44 * SS), t, font=f, fill=(240, 240, 240), stroke_width=3 * SS, stroke_fill=(20, 20, 20))

    def light_strip(self, x1, y1, x2, y2):
        self.d.line([self.pt(x1, y1), self.pt(x2, y2)], fill=(80, 200, 190), width=10 * SS)
        self.d.line([self.pt(x1, y1), self.pt(x2, y2)], fill=GLOW, width=4 * SS)

    def pipe(self, pts, col=(196, 120, 70)):
        P = [self.pt(x, y) for x, y in pts]
        self.d.line(P, fill=(90, 50, 30), width=18 * SS, joint="curve"); self.d.line(P, fill=col, width=12 * SS, joint="curve")
        self.d.line([(x - 3 * SS, y - 3 * SS) for x, y in P], fill=(236, 170, 120), width=3 * SS, joint="curve")

    def labels(self):
        f = self.font(17)
        for rm in self.rooms:
            if not rm["label"]: continue
            x1, y1 = rm["r"][:2]
            self.d.text((self.p(x1) + 26 * SS, self.p(y1) + 22 * SS), rm["name"].upper(), font=f, fill=(236, 240, 248), stroke_width=4 * SS, stroke_fill=(16, 18, 24))

    def glow(self, spots):
        """Additive light pools: (x, y, radius_squares, colour)."""
        g = Image.new("RGB", self.img.size, (0, 0, 0)); gd = ImageDraw.Draw(g)
        for x, y, r, c in spots: gd.ellipse([self.p(x - r), self.p(y - r), self.p(x + r), self.p(y + r)], fill=c)
        self.img = ImageChops.add(self.img, g.filter(ImageFilter.GaussianBlur(50 * SS))); self.d = ImageDraw.Draw(self.img)

    def save(self, name):
        out = root / "maps"; out.mkdir(exist_ok=True)
        im = self.img.resize((self.W, self.H), Image.LANCZOS)
        im.save(out / f"{name}.jpg", quality=86, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((360, 240), Image.LANCZOS); th.save(out / f"{name}-thumb.jpg", quality=80)
        return im


def scale_walls(ws):
    return [{**w, "x1": round(w["x1"] * PX), "y1": round(w["y1"] * PX), "x2": round(w["x2"] * PX), "y2": round(w["y2"] * PX)} for w in ws]


# ======================= MAIN DECK =======================
def main_deck():
    D = Deck(31, 21, seed=11); O = (2, 1)  # shift so the lowered ramp fits on the left
    ox, oy = O
    def R(n, x1, y1, x2, y2, f="tile", **k): D.room(n, x1 + ox, y1 + oy, x2 + ox, y2 + oy, f, **k)
    D.space()
    hull = [(.4, 3.4), (4.4, 3.4), (4.4, .4), (8.6, .4), (8.6, 2.3), (25.4, 2.3), (27.4, 5.2), (28.2, 9.5), (27.4, 13.8), (25.4, 16.7), (8.6, 16.7), (8.6, 18.6), (4.4, 18.6), (4.4, 15.6), (.4, 15.6)]
    D.hull([(x + ox, y + oy) for x, y in hull], lights=[(x + ox, y + oy) for x, y in [(.4, 3.4), (.4, 15.6), (6.5, .4), (6.5, 18.6), (17, 2.3), (17, 16.7), (28.2, 9.5)]])
    # lowered rear ramp
    D.hazard(ox - 1.9, oy + 8, ox + 1, oy + 11)
    D.d.rectangle([D.p(ox - 1.7), D.p(oy + 8.2), D.p(ox + .9), D.p(oy + 10.8)], fill=(96, 100, 106), outline=(40, 44, 50), width=4 * SS)
    for k in range(1, 9): D.d.line([(D.p(ox - 1.7 + k * .3), D.p(oy + 8.25)), (D.p(ox - 1.7 + k * .3), D.p(oy + 10.75))], fill=(70, 74, 80), width=3 * SS)
    R("Cargo Bay", 1, 4, 9, 15, "grate")
    R("Port Airlock", 5, 1, 8, 4, "dark")
    R("Stbd Airlock", 5, 15, 8, 18, "dark")
    R("Lift", 9, 5, 12, 8, "dark", label=False)
    R("Main Corridor", 9, 8, 25, 11, "light", label=False)
    R("Cabin 1", 12, 3, 16, 8, "cabin"); R("Cabin 2", 16, 3, 20, 8, "cabin")
    R("Head", 20, 3, 22, 8, "med"); R("Galley", 22, 3, 25, 8, "warm")
    R("Ship's Locker", 9, 11, 12, 14, "tile"); R("Cabin 3", 12, 11, 16, 16, "cabin")
    R("Medbay", 16, 11, 21, 16, "med"); R("Engineering", 21, 11, 25, 15, "grate")
    R("Fore Gunnery", 25, 6, 27, 13, "dark")
    D.floors()
    # doors / openings (grid coords inside the deck)
    def Dr(k, x, y, n=1): D.door(k, x + ox, y + oy, n)
    def Op(k, x, y, n=1): D.open(k, x + ox, y + oy, n)
    Dr("v", 1, 8, 3)                       # rear ramp
    Dr("h", 6, 1, 1); Dr("h", 6, 4, 1)     # port airlock outer/inner
    Dr("h", 6, 15, 1); Dr("h", 6, 18, 1)   # starboard airlock inner/outer
    Op("v", 9, 8, 3)                       # cargo bay opens onto the corridor
    Dr("h", 10, 8, 1)                      # lift gate
    Dr("h", 13, 8); Dr("h", 17, 8); Dr("h", 20, 8); Op("h", 22, 8, 3)
    Dr("h", 10, 11); Dr("h", 13, 11); Dr("h", 18, 11, 2); Dr("h", 22, 11, 2)
    Dr("v", 25, 9, 1)
    # props
    X = lambda v: v + ox; Y = lambda v: v + oy
    D.crate(X(2), Y(5), 2, 2); D.crate(X(4), Y(5), 1, 1, (150, 110, 64)); D.crate(X(2), Y(7), 1, 1, (150, 110, 64))
    D.crate(X(3.5), Y(11.5), 2, 2); D.crate(X(5.5), Y(12), 1.5, 1.5, (160, 120, 70)); D.crate(X(2), Y(13), 1, 1, (150, 110, 64))
    for yy in (4.6, 14.4):
        for xx in range(2, 9): D.d.ellipse([D.p(X(xx)) - 7 * SS, D.p(Y(yy)) - 7 * SS, D.p(X(xx)) + 7 * SS, D.p(Y(yy)) + 7 * SS], fill=(200, 160, 40))
    D.hazard(X(1.15), Y(8), X(1.45), Y(11))
    D.lift(X(9), Y(5), 3, 3)
    for cx in (12, 16):
        D.bed(X(cx), Y(3), 1, 2); D.locker(X(cx + 3), Y(3), 1, 1); D.console(X(cx + 2), Y(6), 2, 1, (120, 200, 255))
    D.bed(X(12), Y(14), 2, 1, vertical=False); D.locker(X(15), Y(15), 1, 1); D.console(X(14), Y(11), 2, 1, (120, 200, 255))
    # head
    D.d.rounded_rectangle([D.p(X(20)) + 14 * SS, D.p(Y(3)) + 14 * SS, D.p(X(22)) - 14 * SS, D.p(Y(5)) - 14 * SS], radius=16 * SS, fill=(236, 244, 246), outline=(150, 170, 176), width=3 * SS)
    D.d.ellipse([D.p(X(20.6)), D.p(Y(5.4)), D.p(X(21.4)), D.p(Y(6.4))], fill=(236, 244, 246), outline=(150, 170, 176), width=3 * SS)
    # galley: counter along the top, curved bench (the prismarine stairs) and a table
    D.d.rectangle([D.p(X(22)) + 6 * SS, D.p(Y(3)) + 6 * SS, D.p(X(25)) - 6 * SS, D.p(Y(3.7))], fill=(150, 156, 164), outline=(80, 86, 94), width=3 * SS)
    D.d.arc([D.p(X(22.4)), D.p(Y(3.6)), D.p(X(26.6)), D.p(Y(8.6))], 180, 270, fill=(48, 150, 136), width=34 * SS)
    D.d.ellipse([D.p(X(23.1)), D.p(Y(5)), D.p(X(24.4)), D.p(Y(6.3))], fill=(130, 98, 66), outline=(80, 60, 40), width=4 * SS)
    # medbay
    D.bed(X(17), Y(12), 1, 2); D.bed(X(19), Y(12), 1, 2)
    D.console(X(17.5), Y(14.5), 2, 1.3, (120, 255, 200))
    D.d.rounded_rectangle([D.p(X(20.2)), D.p(Y(14.6)), D.p(X(20.9)), D.p(Y(15.8))], radius=8 * SS, fill=(250, 250, 250), outline=(180, 30, 30), width=4 * SS)
    # engineering: reactor, conduits, workbench (furnaces + copper rods in the build)
    cx, cy = D.p(X(23)), D.p(Y(13)); r = int(.95 * D.S)
    D.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(40, 44, 52), outline=(90, 220, 255), width=6 * SS)
    D.d.ellipse([cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2], fill=(150, 235, 255))
    D.pipe([(X(24.5), Y(11.3)), (X(24.5), Y(14.6))]); D.pipe([(X(21.4), Y(14.6)), (X(22.2), Y(13.6))])
    D.console(X(21), Y(11), 1.5, 1, (255, 170, 80)); D.crate(X(24), Y(11), 1, 1, (176, 134, 78))
    # fore gunnery: ammo feeds to the two chin guns
    D.console(X(25), Y(6.4), 2, 1.2, (255, 120, 120)); D.console(X(25), Y(11.4), 2, 1.2, (255, 120, 120))
    D.seat(X(25.4), Y(8.5), "right"); D.locker(X(26), Y(9.5), 1, 1)
    # ship's locker (secret hatch sits under the plate at 10,12 - drawn as plain floor on purpose)
    D.locker(X(9), Y(11), 1, 1); D.locker(X(11), Y(13), 1, 1); D.crate(X(11), Y(11), 1, 1, (150, 110, 64))
    # corridor light strips
    D.light_strip(X(12), Y(8.12), X(24.6), Y(8.12)); D.light_strip(X(12), Y(10.88), X(24.6), Y(10.88))
    walls, doors = D.draw_walls()
    D.labels()
    D.glow([(X(23), Y(13), 2.4, (20, 60, 80)), (X(10.5), Y(6.5), 2, (40, 34, 10)), (X(5), Y(9.5), 4, (14, 14, 18)), (X(18.5), Y(13.5), 2.5, (20, 40, 40))])
    im = D.save("silverfish-main")
    hull_w = [dict(x1=a + ox, y1=b + oy, x2=c + ox, y2=d + oy) for (a, b), (c, d) in zip(hull, hull[1:] + hull[:1])]
    return D, scale_walls(walls + doors)


# ======================= COMMAND DECK =======================
def command_deck():
    D = Deck(22, 12, seed=21); ox, oy = 1, 1
    def R(n, x1, y1, x2, y2, f="tile", **k): D.room(n, x1 + ox, y1 + oy, x2 + ox, y2 + oy, f, **k)
    D.space()
    hull = [(.3, 1.6), (2.4, .4), (14.6, .4), (18.6, 2.4), (20.3, 5), (18.6, 7.6), (14.6, 9.6), (2.4, 9.6), (.3, 8.4)]
    D.hull([(x + ox, y + oy) for x, y in hull], lights=[(x + ox, y + oy) for x, y in [(2.4, .4), (2.4, 9.6), (11, .4), (11, 9.6), (20.3, 5)]])
    R("Lift Lounge", 1, 1, 8, 9, "tile")
    R("Ops", 8, 1, 14, 9, "light")
    R("Cockpit", 14, 2, 18, 8, "dark")
    D.floors()
    def Dr(k, x, y, n=1): D.door(k, x + ox, y + oy, n)
    Dr("v", 8, 4, 2); Dr("v", 14, 4, 2)
    X = lambda v: v + ox; Y = lambda v: v + oy
    # aft viewport (wall for sight, drawn as glass) and cockpit canopy
    D.windows.append((X(1), Y(3), X(1), Y(7)))
    D.extra_walls += []
    # lift in the middle of the lounge, ringed by a rail; gate faces the ops door
    D.lift(X(3), Y(3.5), 3, 3, "LIFT")
    D.d.rectangle([D.p(X(2.85)), D.p(Y(3.35)), D.p(X(6.15)), D.p(Y(6.65))], outline=(230, 180, 40), width=5 * SS)
    D.d.line([D.pt(X(6.15), Y(4.4)), D.pt(X(6.15), Y(5.6))], fill=(78, 84, 92), width=9 * SS)
    for (x, y) in [(1.4, 1.4), (6.6, 1.4), (1.4, 7.6), (6.6, 7.6)]: D.seat(X(x), Y(y), "down" if y < 4 else "up")
    D.d.rounded_rectangle([D.p(X(1.3)), D.p(Y(2.4)), D.p(X(1.75)), D.p(Y(7.6))], radius=6 * SS, fill=(48, 150, 136))
    # ops: two console banks each side and two crew seats (prismarine)
    for x in (9, 10, 11):
        D.console(X(x), Y(1), 1, 1, (255, 90, 90) if x == 10 else (120, 200, 255))
        D.console(X(x), Y(7), 1, 1, (255, 90, 90) if x == 10 else (120, 220, 200))
    D.seat(X(10), Y(2), "up"); D.seat(X(10), Y(6), "down")
    D.console(X(12.6), Y(3.6), 1, 1.8, (180, 160, 255))
    D.d.rounded_rectangle([D.p(X(9.4)), D.p(Y(3.6)), D.p(X(11.6)), D.p(Y(5.4))], radius=14 * SS, fill=(30, 36, 48), outline=(80, 220, 255), width=4 * SS)
    D.d.ellipse([D.p(X(10.1)), D.p(Y(4.1)), D.p(X(10.9)), D.p(Y(4.9))], outline=(120, 240, 255), width=3 * SS)
    # cockpit: pilot + copilot facing forward, nav consoles, canopy
    D.seat(X(15.2), Y(3.6), "right"); D.seat(X(15.2), Y(5.4), "right"); D.seat(X(14.2), Y(4.5), "right")
    D.console(X(16.6), Y(2.4), 1.2, 1.4, (120, 220, 255)); D.console(X(16.6), Y(4.3), 1.2, 1.4, (255, 200, 90)); D.console(X(16.6), Y(6.2), 1.2, 1.4, (120, 220, 255))
    D.windows += [(X(18), Y(2), X(18), Y(8)), (X(14), Y(2), X(18), Y(2)), (X(14), Y(8), X(18), Y(8))]
    walls, doors = D.draw_walls()
    # canopy edges drawn over the walls
    for seg in [(X(18), Y(2), X(18), Y(8))]:
        A, B = D.pt(seg[0], seg[1]), D.pt(seg[2], seg[3])
        D.d.line([A, B], fill=(40, 70, 90), width=26 * SS); D.d.line([A, B], fill=(130, 210, 240), width=12 * SS); D.d.line([A, B], fill=(230, 252, 255), width=3 * SS)
    A, B = D.pt(X(1), Y(3)), D.pt(X(1), Y(7))
    D.d.line([A, B], fill=(40, 70, 90), width=26 * SS); D.d.line([A, B], fill=(130, 210, 240), width=12 * SS)
    D.labels()
    D.glow([(X(10.5), Y(4.5), 3, (10, 40, 60)), (X(16.8), Y(5), 2.4, (10, 40, 60)), (X(4.5), Y(5), 2, (40, 34, 10))])
    D.save("silverfish-command")
    return D, scale_walls(walls + doors)


# ======================= SECRET HOLD =======================
def secret_hold():
    D = Deck(9, 8, seed=31); ox, oy = 0, 0
    D.img.paste((14, 15, 18), (0, 0, D.W * SS, D.H * SS))
    # surrounding structure: beams, conduits, insulation (not walkable)
    for gx in range(0, 9):
        for gy in range(0, 8):
            c = random.randint(26, 40)
            D.rect(gx, gy, gx + 1, gy + 1, fill=(c, c + 2, c + 6), outline=(18, 20, 24))
    for y in (.5, 7.5): D.pipe([(0, y), (9, y)], (140, 140, 150))
    for x in (1, 8): D.pipe([(x, 0), (x, 8)], (196, 120, 70))
    D.room("Hold", 3, 3, 6, 5, "dark", label=False)
    D.floors()
    D.d.rectangle([D.p(3) + 8 * SS, D.p(3) + 8 * SS, D.p(6) - 8 * SS, D.p(5) - 8 * SS], outline=(200, 160, 40), width=3 * SS)
    D.crate(3, 3, 1, 1, (120, 92, 56)); D.crate(5, 4, 1, 1, (120, 92, 56))
    for x in (3.5, 4.5, 5.5):
        D.d.line([D.pt(x, 3.1), D.pt(x, 4.9)], fill=(200, 160, 40), width=4 * SS)
    # hatch up to the ship's locker
    D.d.rectangle([D.p(4) + 14 * SS, D.p(3) + 14 * SS, D.p(5) - 14 * SS, D.p(4) - 14 * SS], fill=(60, 64, 72), outline=(230, 180, 40), width=5 * SS)
    f = D.font(13); D.d.text((D.p(4) + 22 * SS, D.p(3) + 36 * SS), "HATCH", font=f, fill=(230, 180, 40))
    D.d.line([D.pt(3.15, 4.6), D.pt(5.85, 4.6)], fill=(70, 200, 190), width=4 * SS)
    walls, doors = D.draw_walls()
    f = D.font(16); D.d.text((D.p(3) - 10 * SS, D.p(5) + 40 * SS), "CRAWLSPACE · 1 M CLEARANCE", font=f, fill=(150, 160, 175))
    D.glow([(4.5, 4.6, 1.6, (8, 40, 38))])
    D.save("silverfish-hold")
    return D, scale_walls(walls + doors)


if __name__ == "__main__":
    m, mw = main_deck()
    c, cw = command_deck()
    h, hw = secret_hold()
    entries = [
        dict(id="silverfish-main", name="Silverfish: Main Deck", desc="The party's free merchant. Cargo bay and ramp, airlocks, cabins, galley, medbay, engineering, fore gunnery.",
             file="maps/silverfish-main.jpg", thumb="maps/silverfish-main-thumb.jpg", w=m.W, h=m.H, gridPx=PX, scale=1, lighting="lit", walls=mw,
             notes="Cargo lift (3x3, beside the cargo bay) goes up to the command deck. Secret hold hatch: under the floor plate in the Ship's Locker, the square right inside the door (drawn as plain floor on purpose)."),
        dict(id="silverfish-command", name="Silverfish: Command Deck", desc="Upper deck: lift lounge, ops room, cockpit.",
             file="maps/silverfish-command.jpg", thumb="maps/silverfish-command-thumb.jpg", w=c.W, h=c.H, gridPx=PX, scale=1, lighting="lit", walls=cw,
             notes="Lift comes up in the middle of the lounge from the main deck corridor."),
        dict(id="silverfish-hold", name="Silverfish: Secret Hold (GM)", desc="Under-floor smuggling hold, 6 squares, about 2 tons. Keep it private until found.",
             file="maps/silverfish-hold.jpg", thumb="maps/silverfish-hold-thumb.jpg", w=h.W, h=h.H, gridPx=PX, scale=1, lighting="dark", walls=hw,
             notes="Reached through the hatch in the Ship's Locker floor. Crawl height only."),
    ]
    idx_p = root / "maps" / "index.json"
    idx = json.loads(idx_p.read_text()) if idx_p.exists() else []
    ids = {e["id"] for e in entries}
    idx = entries + [e for e in idx if e.get("id") not in ids]
    idx_p.write_text(json.dumps(idx, indent=1))
    print("main", m.W, m.H, len(mw), "| command", c.W, c.H, len(cw), "| hold", h.W, h.H, len(hw))
