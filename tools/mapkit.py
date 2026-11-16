"""Shared drawing kit for tabletop maps (the house style).

Style: inked, hand-drawn deck plans (thick rounded charcoal walls, pale tiles
with soft shadow along the walls, orange doors, ink outlines on everything)
over a dark space backdrop with a sand-coloured hull.

Units: 1 square = 1 m. Build a Deck, add rooms/doors/props in square
coordinates, then call finish() and save(). Walls and doors for the
tabletop's line-of-sight come from the room edges automatically."""
import json, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

PX = 100   # pixels per square in the final image
SS = 2     # supersampling for smooth lines
ROOT = Path(__file__).resolve().parent.parent
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FONT_S = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

INK = (28, 26, 30)
HULL = (214, 196, 154); HULL_D = (186, 166, 124); HULL_L = (232, 220, 188)
WALL = (78, 78, 84); WALL_HI = (110, 110, 118)
DOOR = (226, 142, 52); DOOR_D = (170, 96, 30)
TEAL = (70, 190, 172); GLOW = (220, 255, 248)

# floor fill, grid line colour
FLOORS = {
    "tile": ((214, 216, 220), (176, 179, 186)),
    "light": ((226, 228, 232), (186, 189, 196)),
    "grate": ((160, 164, 170), (124, 128, 136)),
    "cabin": ((200, 202, 214), (168, 170, 186)),
    "med": ((228, 238, 238), (186, 204, 206)),
    "warm": ((216, 204, 184), (182, 168, 146)),
    "dark": ((128, 132, 140), (100, 104, 112)),
}


def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


class Deck:
    def __init__(self, cols, rows, seed=1):
        self.cols, self.rows = cols, rows
        self.W, self.H = cols * PX, rows * PX
        self.S = PX * SS
        random.seed(seed)
        self.img = Image.new("RGB", (self.W * SS, self.H * SS), (20, 23, 33))
        self.d = ImageDraw.Draw(self.img)
        self.rooms, self.doors, self.opens, self.extra_walls, self.windows = [], set(), set(), [], []
        self.floor_mask = Image.new("L", self.img.size, 0)

    # ---------- helpers ----------
    def p(self, v): return int(round(v * self.S))
    def pt(self, x, y): return (self.p(x), self.p(y))
    def u(self, n): return int(n * SS)
    def font(self, s, mono=True): return ImageFont.truetype(FONT_B if mono else FONT_S, int(s * SS))
    def rect(self, x1, y1, x2, y2, **k): self.d.rectangle([self.p(x1), self.p(y1), self.p(x2) - 1, self.p(y2) - 1], **k)

    def wobble(self, pts, amp=1.4, step=26):
        """Split a polyline into short pieces with a little jitter so it reads as hand-inked."""
        out = []
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            n = max(1, int(((x2 - x1) ** 2 + (y2 - y1) ** 2) ** .5 / self.u(step)))
            for k in range(n):
                t = k / n
                j = 0 if k == 0 else self.u(amp)
                out.append((x1 + (x2 - x1) * t + random.uniform(-j, j), y1 + (y2 - y1) * t + random.uniform(-j, j)))
        out.append(pts[-1])
        return out

    def inked(self, box, fill, radius=8, ink=3, shadow=True):
        x1, y1, x2, y2 = box
        if shadow:
            self.soft_shadow([(x1, y1, x2, y2, radius)])
        self.d.rounded_rectangle(box, radius=self.u(radius), fill=fill, outline=INK, width=self.u(ink))

    def soft_shadow(self, boxes, off=(5, 7), blur=7, alpha=95):
        sh = Image.new("L", self.img.size, 0); sd = ImageDraw.Draw(sh)
        for x1, y1, x2, y2, r in boxes:
            sd.rounded_rectangle([x1 + self.u(off[0]), y1 + self.u(off[1]), x2 + self.u(off[0]), y2 + self.u(off[1])], radius=self.u(r), fill=alpha)
        self.img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(self.u(blur)))); self.d = ImageDraw.Draw(self.img)

    # ---------- backdrop ----------
    def space(self):
        w, h = self.img.size
        noise = Image.effect_noise((w // 4, h // 4), 22).resize((w, h), Image.BICUBIC)
        base = Image.new("RGB", (w, h), (22, 25, 36))
        self.img = Image.composite(Image.new("RGB", (w, h), (34, 38, 52)), base, noise.point(lambda v: max(0, v - 110)))
        self.d = ImageDraw.Draw(self.img)
        for _ in range(int(self.cols * self.rows * 1.1)):
            x, y = random.randrange(w), random.randrange(h); r = random.choice([1, 1, 2, 2, 3]) * SS // 2 + 1
            c = random.randint(120, 220); self.d.ellipse([x, y, x + r, y + r], fill=(c, c, min(255, c + 20)))
        vg = Image.new("L", (w, h), 0); ImageDraw.Draw(vg).ellipse([-w * .15, -h * .15, w * 1.15, h * 1.15], fill=255)
        self.img = Image.composite(self.img, Image.new("RGB", (w, h), (12, 14, 20)), vg.filter(ImageFilter.GaussianBlur(self.u(120))))
        self.d = ImageDraw.Draw(self.img)

    def hull(self, poly, lights=()):
        P = [self.pt(x, y) for x, y in poly]
        sh = Image.new("L", self.img.size, 0); ImageDraw.Draw(sh).polygon([(x + self.u(16), y + self.u(22)) for x, y in P], fill=150)
        self.img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(self.u(16)))); self.d = ImageDraw.Draw(self.img)
        mask = Image.new("L", self.img.size, 0); ImageDraw.Draw(mask).polygon(P, fill=255)
        tex = Image.new("RGB", self.img.size, HULL); td = ImageDraw.Draw(tex)
        # hand-drawn hull panels
        for _ in range(int(self.cols * self.rows / 2.2)):
            x, y = random.uniform(0, self.cols), random.uniform(0, self.rows)
            w, h = random.choice([(1, .5), (1.5, .7), (2, 1), (.7, 1.4), (1.2, 1.2)])
            fill = random.choice([HULL_L, HULL, HULL_D, shade(HULL, 1.04)])
            td.rounded_rectangle([self.p(x), self.p(y), self.p(x + w), self.p(y + h)], radius=self.u(6), fill=fill, outline=shade(HULL_D, .78), width=self.u(2))
        for _ in range(int(self.cols * self.rows / 6)):
            x, y = random.uniform(0, self.cols), random.uniform(0, self.rows)
            td.line([self.pt(x, y), self.pt(x + random.uniform(.8, 3), y)], fill=shade(HULL_D, .85), width=self.u(2))
        # cel shading: darker toward the lower edge of the hull
        grad = Image.linear_gradient("L").resize(self.img.size).point(lambda v: int(v * .28))
        tex = Image.composite(Image.new("RGB", self.img.size, shade(HULL, .62)), tex, grad)
        self.img.paste(tex, (0, 0), mask); self.d = ImageDraw.Draw(self.img)
        W = self.wobble(P + [P[0]], amp=1.2)
        self.d.line(W, fill=INK, width=self.u(7), joint="curve")
        inner = Image.new("L", self.img.size, 0); ImageDraw.Draw(inner).line(P + [P[0]], fill=255, width=self.u(22))
        inner = ImageChops.multiply(inner.filter(ImageFilter.GaussianBlur(self.u(4))), mask)
        self.img.paste(HULL_L, (0, 0), inner.point(lambda v: v // 3)); self.d = ImageDraw.Draw(self.img)
        self.d.line(W, fill=INK, width=self.u(6), joint="curve")
        for x, y in lights:
            X, Y = self.pt(x, y)
            self.d.ellipse([X - self.u(15), Y - self.u(15), X + self.u(15), Y + self.u(15)], fill=TEAL, outline=INK, width=self.u(3))
            self.d.ellipse([X - self.u(7), Y - self.u(7), X + self.u(7), Y + self.u(7)], fill=GLOW)

    # ---------- rooms ----------
    def room(self, name, x1, y1, x2, y2, floor="tile", label=True, no_edge=()):
        self.rooms.append(dict(name=name, r=(x1, y1, x2, y2), floor=floor, label=label, no_edge=set(no_edge)))

    def floors(self):
        md = ImageDraw.Draw(self.floor_mask)
        for rm in self.rooms:
            x1, y1, x2, y2 = rm["r"]; base, line = FLOORS[rm["floor"]]
            self.rect(x1, y1, x2, y2, fill=base); md.rectangle([self.p(x1), self.p(y1), self.p(x2), self.p(y2)], fill=255)
            for gx in range(x1, x2):
                for gy in range(y1, y2):
                    j = random.uniform(.975, 1.02); c = shade(base, j)
                    X, Y, s = self.p(gx), self.p(gy), self.S
                    self.d.rectangle([X, Y, X + s, Y + s], fill=c)
                    if rm["floor"] == "grate":
                        for k in range(1, 5): self.d.line([(X + k * s // 5, Y + self.u(10)), (X + k * s // 5, Y + s - self.u(10))], fill=shade(c, .86), width=self.u(3))
                    elif rm["floor"] in ("tile", "light", "med", "dark"):
                        # big plate split into quarters, like printed deck tiles
                        self.d.line([(X + s // 2, Y + self.u(6)), (X + s // 2, Y + s - self.u(6))], fill=shade(c, .95), width=self.u(1))
                        self.d.line([(X + self.u(6), Y + s // 2), (X + s - self.u(6), Y + s // 2)], fill=shade(c, .95), width=self.u(1))
            for gx in range(x1, x2 + 1): self.d.line([self.pt(gx, y1), self.pt(gx, y2)], fill=line, width=self.u(2))
            for gy in range(y1, y2 + 1): self.d.line([self.pt(x1, gy), self.pt(x2, gy)], fill=line, width=self.u(2))

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
        # soft shadow cast onto the floor along every wall (the "printed" look)
        ao = Image.new("L", self.img.size, 0); ad = ImageDraw.Draw(ao)
        for x1, y1, x2, y2 in segs + [(d["x1"], d["y1"], d["x2"], d["y2"]) for d in doors] + self.windows:
            ad.line([self.pt(x1, y1), self.pt(x2, y2)], fill=255, width=self.u(46))
        ao = ImageChops.multiply(ao.filter(ImageFilter.GaussianBlur(self.u(24))).point(lambda v: int(v * .78)), self.floor_mask)
        self.img.paste((96, 98, 112), (0, 0), ao); self.d = ImageDraw.Draw(self.img)
        # walls: ink outline, charcoal body, thin highlight, rounded joints
        joints = set()
        for x1, y1, x2, y2 in segs:
            A, B = self.pt(x1, y1), self.pt(x2, y2); joints |= {A, B}
            self.d.line(self.wobble([A, B], .9), fill=INK, width=self.u(30))
        for J in joints: self.d.ellipse([J[0] - self.u(15), J[1] - self.u(15), J[0] + self.u(15), J[1] + self.u(15)], fill=INK)
        for x1, y1, x2, y2 in segs:
            A, B = self.pt(x1, y1), self.pt(x2, y2)
            self.d.line([A, B], fill=WALL, width=self.u(22))
            self.d.line([(A[0] - self.u(3), A[1] - self.u(3)), (B[0] - self.u(3), B[1] - self.u(3))], fill=WALL_HI, width=self.u(4))
        for J in joints: self.d.ellipse([J[0] - self.u(11), J[1] - self.u(11), J[0] + self.u(11), J[1] + self.u(11)], fill=WALL)
        # windows
        for x1, y1, x2, y2 in self.windows:
            A, B = self.pt(x1, y1), self.pt(x2, y2)
            self.d.line([A, B], fill=INK, width=self.u(26)); self.d.line([A, B], fill=(120, 196, 226), width=self.u(16))
            self.d.line([(A[0] - self.u(2), A[1] - self.u(2)), (B[0] - self.u(2), B[1] - self.u(2))], fill=(230, 250, 255), width=self.u(4))
        # doors: orange sliding panels with dark frame blocks at each end
        for dr in doors:
            A, B = self.pt(dr["x1"], dr["y1"]), self.pt(dr["x2"], dr["y2"]); horiz = A[1] == B[1]
            self.d.line([A, B], fill=INK, width=self.u(20)); self.d.line([A, B], fill=DOOR, width=self.u(12))
            mx, my = (A[0] + B[0]) // 2, (A[1] + B[1]) // 2
            if horiz: self.d.line([(mx, my - self.u(7)), (mx, my + self.u(7))], fill=DOOR_D, width=self.u(3))
            else: self.d.line([(mx - self.u(7), my), (mx + self.u(7), my)], fill=DOOR_D, width=self.u(3))
            for P_ in (A, B):
                self.d.rounded_rectangle([P_[0] - self.u(15), P_[1] - self.u(15), P_[0] + self.u(15), P_[1] + self.u(15)], radius=self.u(5), fill=WALL, outline=INK, width=self.u(4))
        return walls, doors

    # ---------- props ----------
    def crate(self, x, y, w, h, col=(172, 132, 80)):
        X1, Y1, X2, Y2 = self.p(x) + self.u(7), self.p(y) + self.u(7), self.p(x + w) - self.u(7), self.p(y + h) - self.u(7)
        self.inked([X1, Y1, X2, Y2], col, radius=5)
        dk = shade(col, .78); n = max(2, int(w * 3))
        for k in range(1, n): self.d.line([(X1 + (X2 - X1) * k // n, Y1 + self.u(4)), (X1 + (X2 - X1) * k // n, Y2 - self.u(4))], fill=dk, width=self.u(2))
        self.d.rectangle([X1 + self.u(10), Y1 + self.u(10), X2 - self.u(10), Y2 - self.u(10)], outline=INK, width=self.u(2))

    def console(self, x, y, w, h, screen=(110, 210, 150)):
        X1, Y1, X2, Y2 = self.p(x) + self.u(8), self.p(y) + self.u(8), self.p(x + w) - self.u(8), self.p(y + h) - self.u(8)
        self.inked([X1, Y1, X2, Y2], (96, 100, 108), radius=8)
        sx2 = X1 + int((X2 - X1) * .58)
        self.d.rounded_rectangle([X1 + self.u(10), Y1 + self.u(10), sx2, Y2 - self.u(10)], radius=self.u(4), fill=shade(screen, .35), outline=INK, width=self.u(2))
        for k in range(3):
            yy = Y1 + self.u(18) + k * self.u(10)
            if yy < Y2 - self.u(16): self.d.line([(X1 + self.u(16), yy), (sx2 - self.u(8) - random.randint(0, 20) * SS, yy)], fill=screen, width=self.u(3))
        for k in range(4):
            bx = sx2 + self.u(10) + (k % 2) * self.u(14); by = Y1 + self.u(14) + (k // 2) * self.u(14)
            if bx < X2 - self.u(6) and by < Y2 - self.u(6):
                self.d.ellipse([bx, by, bx + self.u(8), by + self.u(8)], fill=random.choice([(220, 80, 70), (240, 200, 80), screen]), outline=INK, width=self.u(1))

    def seat(self, x, y, face="right", col=(70, 168, 154)):
        cx, cy = self.p(x + .5), self.p(y + .5); r = int(.3 * self.S)
        self.inked([cx - r, cy - r, cx + r, cy + r], col, radius=12)
        dx, dy = {"right": (-1, 0), "left": (1, 0), "up": (0, 1), "down": (0, -1)}[face]
        bw = self.u(9)
        if dx: box = [cx + dx * r - bw, cy - r + self.u(4), cx + dx * r + bw, cy + r - self.u(4)]
        else: box = [cx - r + self.u(4), cy + dy * r - bw, cx + r - self.u(4), cy + dy * r + bw]
        self.d.rounded_rectangle(box, radius=self.u(5), fill=shade(col, .7), outline=INK, width=self.u(3))

    def bed(self, x, y, w=1, h=2, vertical=True, blanket=(64, 176, 192)):
        X1, Y1, X2, Y2 = self.p(x) + self.u(8), self.p(y) + self.u(8), self.p(x + w) - self.u(8), self.p(y + h) - self.u(8)
        self.inked([X1, Y1, X2, Y2], (232, 232, 236), radius=10)
        if vertical:
            self.d.rounded_rectangle([X1 + self.u(3), Y1 + int((Y2 - Y1) * .3), X2 - self.u(3), Y2 - self.u(3)], radius=self.u(8), fill=blanket, outline=INK, width=self.u(3))
            self.d.line([(X1 + self.u(6), Y1 + int((Y2 - Y1) * .42)), (X2 - self.u(6), Y1 + int((Y2 - Y1) * .42))], fill=shade(blanket, .75), width=self.u(3))
            self.d.rounded_rectangle([X1 + self.u(12), Y1 + self.u(10), X2 - self.u(12), Y1 + int((Y2 - Y1) * .24)], radius=self.u(8), fill=(250, 250, 252), outline=INK, width=self.u(2))
        else:
            self.d.rounded_rectangle([X1 + int((X2 - X1) * .3), Y1 + self.u(3), X2 - self.u(3), Y2 - self.u(3)], radius=self.u(8), fill=blanket, outline=INK, width=self.u(3))
            self.d.rounded_rectangle([X1 + self.u(10), Y1 + self.u(12), X1 + int((X2 - X1) * .24), Y2 - self.u(12)], radius=self.u(8), fill=(250, 250, 252), outline=INK, width=self.u(2))

    def locker(self, x, y, w=1, h=1):
        X1, Y1, X2, Y2 = self.p(x) + self.u(8), self.p(y) + self.u(8), self.p(x + w) - self.u(8), self.p(y + h) - self.u(8)
        self.inked([X1, Y1, X2, Y2], (128, 134, 144), radius=4)
        n = max(2, int(w * 2))
        for k in range(1, n): self.d.line([(X1 + (X2 - X1) * k // n, Y1 + self.u(5)), (X1 + (X2 - X1) * k // n, Y2 - self.u(5))], fill=INK, width=self.u(2))
        for k in range(n):
            hx = X1 + (X2 - X1) * k // n + self.u(6); self.d.line([(hx, (Y1 + Y2) // 2 - self.u(6)), (hx, (Y1 + Y2) // 2 + self.u(6))], fill=INK, width=self.u(2))

    def hazard(self, x1, y1, x2, y2):
        X1, Y1, X2, Y2 = self.p(x1), self.p(y1), self.p(x2), self.p(y2)
        tile = Image.new("RGB", (X2 - X1, Y2 - Y1), (232, 186, 52)); td = ImageDraw.Draw(tile)
        for k in range(-(Y2 - Y1), X2 - X1, self.u(36)): td.polygon([(k, Y2 - Y1), (k + self.u(18), Y2 - Y1), (k + self.u(18) + (Y2 - Y1), 0), (k + (Y2 - Y1), 0)], fill=INK)
        self.img.paste(tile, (X1, Y1)); self.d.rectangle([X1, Y1, X2, Y2], outline=INK, width=self.u(3))

    def lift(self, x, y, w, h, label="CARGO LIFT"):
        X1, Y1, X2, Y2 = self.p(x), self.p(y), self.p(x + w), self.p(y + h)
        m = self.u(12)
        self.hazard(x + .06, y + .06, x + w - .06, y + h - .06)
        X1i, Y1i, X2i, Y2i = X1 + m + self.u(6), Y1 + m + self.u(6), X2 - m - self.u(6), Y2 - m - self.u(6)
        self.d.rectangle([X1i, Y1i, X2i, Y2i], fill=(176, 180, 186), outline=INK, width=self.u(4))
        for k in range(-(Y2i - Y1i), X2i - X1i, self.u(14)):   # cross-hatched platform
            self.d.line([(X1i + max(0, k), Y1i + max(0, -k)), (X1i + min(X2i - X1i, k + Y2i - Y1i), Y1i + min(Y2i - Y1i, Y2i - Y1i - k))], fill=(150, 154, 160), width=self.u(2))
        cx, cy = (X1 + X2) // 2, (Y1 + Y2) // 2; a = self.u(20)
        for dy in (-1, 1):
            self.d.polygon([(cx - a, cy + dy * self.u(8)), (cx + a, cy + dy * self.u(8)), (cx, cy + dy * (self.u(8) + a))], fill=(232, 186, 52), outline=INK)
        f = self.font(14); tw = self.d.textlength(label, font=f)
        self.d.text((cx - tw / 2, Y2i - self.u(26)), label, font=f, fill=INK)

    def light_strip(self, x1, y1, x2, y2):
        self.d.line([self.pt(x1, y1), self.pt(x2, y2)], fill=(90, 190, 180), width=self.u(6))
        self.d.line([self.pt(x1, y1), self.pt(x2, y2)], fill=GLOW, width=self.u(2))

    def pipe(self, pts, col=(198, 124, 74)):
        P = [self.pt(x, y) for x, y in pts]
        self.d.line(P, fill=INK, width=self.u(16), joint="curve"); self.d.line(P, fill=col, width=self.u(10), joint="curve")
        self.d.line([(x - self.u(2), y - self.u(2)) for x, y in P], fill=shade(col, 1.25), width=self.u(3), joint="curve")

    def circle(self, x, y, r, fill, ring=None):
        X, Y, R = self.p(x), self.p(y), int(r * self.S)
        self.soft_shadow([(X - R, Y - R, X + R, Y + R, R)])
        self.d.ellipse([X - R, Y - R, X + R, Y + R], fill=fill, outline=INK, width=self.u(4))
        if ring: self.d.ellipse([X - R + self.u(10), Y - R + self.u(10), X + R - self.u(10), Y + R - self.u(10)], outline=ring, width=self.u(4))

    def labels(self):
        """Small inked name tags in each room's top-left corner, drawn over the furniture."""
        f = self.font(14)
        for rm in self.rooms:
            if not rm["label"]: continue
            x1, y1 = rm["r"][:2]; t = rm["name"].upper()
            X, Y = self.p(x1) + self.u(20), self.p(y1) + self.u(18); tw = self.d.textlength(t, font=f)
            self.d.rounded_rectangle([X - self.u(6), Y - self.u(4), X + tw + self.u(6), Y + self.u(19)], radius=self.u(4), fill=(238, 238, 242), outline=INK, width=self.u(2))
            self.d.text((X, Y), t, font=f, fill=INK)

    def glow(self, spots):
        g = Image.new("RGB", self.img.size, (0, 0, 0)); gd = ImageDraw.Draw(g)
        for x, y, r, c in spots: gd.ellipse([self.p(x - r), self.p(y - r), self.p(x + r), self.p(y + r)], fill=c)
        g = g.point(lambda v: int(v * .55))
        self.img = ImageChops.add(self.img, g.filter(ImageFilter.GaussianBlur(self.u(45)))); self.d = ImageDraw.Draw(self.img)

    def grain(self):
        """Light paper grain over everything, for the printed feel."""
        w, h = self.img.size
        n = Image.effect_noise((w // 2, h // 2), 18).resize((w, h)).convert("RGB")
        self.img = Image.blend(self.img, ImageChops.multiply(self.img, n.point(lambda v: 200 + v // 4)), .35)
        self.d = ImageDraw.Draw(self.img)

    def save(self, name):
        out = ROOT / "maps"; out.mkdir(exist_ok=True)
        self.grain()
        im = self.img.resize((self.W, self.H), Image.LANCZOS)
        im.save(out / f"{name}.jpg", quality=86, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((360, 240), Image.LANCZOS); th.save(out / f"{name}-thumb.jpg", quality=80)
        return im


def scale_walls(ws):
    return [{**w, "x1": round(w["x1"] * PX), "y1": round(w["y1"] * PX), "x2": round(w["x2"] * PX), "y2": round(w["y2"] * PX)} for w in ws]


def file_ver(rel):
    """Short content hash, used as ?v= so browsers fetch a map again when its art changes."""
    import hashlib
    f = ROOT / rel
    return hashlib.md5(f.read_bytes()).hexdigest()[:10] if f.exists() else ""


def update_index(entries):
    for e in entries:
        e["ver"] = file_ver(e["file"]); e["thumbVer"] = file_ver(e.get("thumb", ""))
    idx_p = ROOT / "maps" / "index.json"
    idx = json.loads(idx_p.read_text()) if idx_p.exists() else []
    ids = {e["id"] for e in entries}
    keep = [e for e in idx if e.get("id") not in ids]
    by_id = {e["id"]: e for e in entries}
    merged = []
    for e in idx:  # keep existing order, replace in place
        merged.append(by_id.pop(e["id"]) if e.get("id") in by_id else e)
    merged += list(by_id.values())
    idx_p.write_text(json.dumps(merged, indent=1))
