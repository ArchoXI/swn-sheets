"""Shared drawing kit for tabletop maps (the house style).

Style: inked, hand-drawn deck plans (thick rounded charcoal walls, pale tiles
with soft shadow along the walls, orange doors, ink outlines on everything)
over a dark space backdrop with a sand-coloured hull.

Units: 1 square = 1 m. Build a Deck, add rooms/doors/props in square
coordinates, then call finish() and save(). Walls and doors for the
tabletop's line-of-sight come from the room edges automatically."""
import json, random, math
math_cos, math_sin, math_rad = math.cos, math.sin, math.radians
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
    def __init__(self, cols, rows, seed=1, px=PX):
        self.cols, self.rows, self.px = cols, rows, px
        self.W, self.H = cols * px, rows * px
        self.S = px * SS
        self.ocean_img = None
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

    # ---------- ocean worlds ----------
    def ocean(self, seed_glow=1.0):
        """Deep night ocean full of glowing plankton. Kept so water() can reuse it inside platforms."""
        w, h = self.img.size
        base = Image.new("RGB", (w, h), (6, 22, 34))
        n = Image.effect_noise((w // 16, h // 16), 40).resize((w, h), Image.BICUBIC)
        base = Image.composite(Image.new("RGB", (w, h), (10, 40, 58)), base, n.point(lambda v: max(0, min(255, (v - 100) * 2))))
        g = Image.new("RGB", (w, h), (0, 0, 0)); gd = ImageDraw.Draw(g)
        for _ in range(int(self.cols * self.rows / 14 * seed_glow)):   # drifting plankton blooms
            x, y = random.uniform(0, w), random.uniform(0, h); r = random.uniform(.8, 3.5) * self.S
            gd.ellipse([x - r, y - r * .6, x + r, y + r * .6], fill=random.choice([(0, 90, 90), (0, 70, 110), (20, 110, 80), (40, 40, 120)]))
        g = g.filter(ImageFilter.GaussianBlur(self.u(70)))
        s2 = Image.new("RGB", (w, h), (0, 0, 0)); sd = ImageDraw.Draw(s2)
        for _ in range(int(self.cols * self.rows / 10 * seed_glow)):   # long, lazy current lines
            x, y = random.uniform(-w * .1, w), random.uniform(0, h); pts = [(x, y)]; a = random.uniform(-.25, .25); da = random.uniform(-.06, .06)
            for _k in range(random.randint(10, 26)):
                da += random.uniform(-.03, .03); a += da; x += math_cos(a) * self.u(46); y += math_sin(a) * self.u(46); pts.append((x, y))
            sd.line(pts, fill=random.choice([(40, 200, 190), (70, 230, 170), (60, 150, 240)]), width=self.u(random.choice([2, 3, 3, 5])), joint="curve")
        s2 = Image.blend(s2.filter(ImageFilter.GaussianBlur(self.u(7))), s2.filter(ImageFilter.GaussianBlur(self.u(1.5))), .45)
        rp = Image.new("RGB", (w, h), (0, 0, 0)); rd = ImageDraw.Draw(rp)
        for _ in range(int(self.cols * self.rows * 1.6)):                # small surface ripples
            x, y = random.uniform(0, w), random.uniform(0, h); r = self.u(random.uniform(14, 40))
            rd.arc([x - r, y - r * .35, x + r, y + r * .35], 200, 340, fill=(30, 70, 86), width=self.u(2))
        s2 = ImageChops.add(s2, rp.filter(ImageFilter.GaussianBlur(self.u(1))))
        img = ImageChops.add(ImageChops.add(base, g), s2.point(lambda v: int(v * .7)))
        d = ImageDraw.Draw(img)
        for _ in range(int(self.cols * self.rows * 1.4 * seed_glow)):  # sparkles
            x, y = random.uniform(0, w), random.uniform(0, h); r = random.choice([1, 2, 2, 3]) * SS // 2 + 1
            d.ellipse([x, y, x + r, y + r], fill=random.choice([(140, 255, 240), (180, 255, 200), (150, 210, 255)]))
        self.ocean_img = img; self.img = img.copy(); self.d = ImageDraw.Draw(self.img)

    def platform(self, poly, base=(150, 158, 164), seam=None, rust=0.0, shadow=True, plates=1.0):
        """A floating deck: plated metal with an inked rim and a dark waterline shadow."""
        P = [self.pt(x, y) for x, y in poly]; seam = seam or shade(base, .8)
        if shadow:
            sh = Image.new("L", self.img.size, 0); ImageDraw.Draw(sh).polygon([(x + self.u(14), y + self.u(20)) for x, y in P], fill=170)
            self.img.paste((0, 6, 10), (0, 0), sh.filter(ImageFilter.GaussianBlur(self.u(14)))); self.d = ImageDraw.Draw(self.img)
        mask = Image.new("L", self.img.size, 0); ImageDraw.Draw(mask).polygon(P, fill=255)
        tex = Image.new("RGB", self.img.size, base); td = ImageDraw.Draw(tex)
        step = 2 if plates >= 1 else 4
        for gx in range(0, self.cols * 2, step // 2 * 2 or 2):
            for gy in range(0, self.rows):
                off = (gy % 2) * .5
                x1 = gx / 2 + off; c = shade(base, random.uniform(.95, 1.05))
                if rust and random.random() < rust: c = shade(random.choice([(150, 96, 62), (124, 84, 58), (160, 116, 72), (98, 106, 100), (112, 102, 88), (88, 96, 104)]), random.uniform(.85, 1.05))
                td.rectangle([self.p(x1), self.p(gy), self.p(x1 + 1) - 1, self.p(gy + 1) - 1], fill=c, outline=seam, width=self.u(2))
                for rx in (x1 + .1, x1 + .9):
                    for ry in (gy + .1, gy + .9):
                        td.ellipse([self.p(rx) - self.u(2), self.p(ry) - self.u(2), self.p(rx) + self.u(2), self.p(ry) + self.u(2)], fill=shade(c, .7))
        self.img.paste(tex, (0, 0), mask); self.d = ImageDraw.Draw(self.img)
        W = self.wobble(P + [P[0]], amp=1.0)
        self.d.line(W, fill=INK, width=self.u(8), joint="curve")
        self.d.line([(x, y + self.u(5)) for x, y in W], fill=shade(base, .55), width=self.u(3), joint="curve")
        return mask

    def water(self, poly, glow=1.0, rim=(110, 116, 122)):
        """Cut a patch of ocean into a deck (channels, intake pools)."""
        P = [self.pt(x, y) for x, y in poly]
        mask = Image.new("L", self.img.size, 0); ImageDraw.Draw(mask).polygon(P, fill=255)
        src = self.ocean_img if glow <= 1 else ImageChops.add(self.ocean_img, self.ocean_img.point(lambda v: int(v * (glow - 1))))
        self.img.paste(src, (0, 0), mask)
        sh = Image.new("L", self.img.size, 0); ImageDraw.Draw(sh).line(P + [P[0]], fill=200, width=self.u(30))
        self.img.paste((0, 0, 0), (0, 0), ImageChops.multiply(sh.filter(ImageFilter.GaussianBlur(self.u(10))), mask)); self.d = ImageDraw.Draw(self.img)
        self.d.line(P + [P[0]], fill=INK, width=self.u(10), joint="curve"); self.d.line(P + [P[0]], fill=rim, width=self.u(5), joint="curve")

    def rail(self, pts, col=(196, 200, 206)):
        """Low safety railing: blocks nothing for sight, just looks like an edge."""
        P = [self.pt(x, y) for x, y in pts]
        self.d.line(P, fill=INK, width=self.u(9), joint="curve"); self.d.line(P, fill=col, width=self.u(5), joint="curve")
        for (x1, y1), (x2, y2) in zip(P, P[1:]):
            L = max(1, ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** .5); n = int(L / (self.S * .5))
            for k in range(n + 1):
                x, y = x1 + (x2 - x1) * k / max(n, 1), y1 + (y2 - y1) * k / max(n, 1)
                self.d.ellipse([x - self.u(5), y - self.u(5), x + self.u(5), y + self.u(5)], fill=col, outline=INK, width=self.u(2))

    def tank(self, x, y, r, col=(200, 204, 210), band=(226, 142, 52), label=None):
        self.circle(x, y, r, col)
        X, Y, R = self.p(x), self.p(y), int(r * self.S)
        self.d.ellipse([X - R * .72, Y - R * .72, X + R * .72, Y + R * .72], outline=shade(col, .78), width=self.u(4))
        self.d.arc([X - R + self.u(6), Y - R + self.u(6), X + R - self.u(6), Y + R - self.u(6)], 200, 340, fill=band, width=self.u(8))
        self.d.ellipse([X - self.u(10), Y - self.u(10), X + self.u(10), Y + self.u(10)], fill=shade(col, .7), outline=INK, width=self.u(3))
        if label:
            f = self.font(max(12, int(r * 14))); tw = self.d.textlength(label, font=f)
            self.d.text((X - tw / 2, Y + R * .25), label, font=f, fill=INK)

    def barrel(self, x, y, col=(60, 120, 170)):
        X, Y, R = self.p(x), self.p(y), int(.22 * self.S)
        self.d.ellipse([X - R + self.u(3), Y - R + self.u(5), X + R + self.u(3), Y + R + self.u(5)], fill=(0, 0, 0))
        self.d.ellipse([X - R, Y - R, X + R, Y + R], fill=col, outline=INK, width=self.u(3))
        self.d.ellipse([X - R * .55, Y - R * .55, X + R * .55, Y + R * .55], outline=shade(col, .7), width=self.u(2))

    def stall(self, x, y, w, h, awning=((214, 70, 70), (238, 228, 210)), counter=True):
        X1, Y1, X2, Y2 = self.p(x) + self.u(6), self.p(y) + self.u(6), self.p(x + w) - self.u(6), self.p(y + h) - self.u(6)
        self.soft_shadow([(X1, Y1, X2, Y2, 6)], off=(8, 12), blur=10, alpha=120)
        n = max(3, int(w * 3)); sw = (X2 - X1) / n
        for k in range(n): self.d.rectangle([X1 + k * sw, Y1, X1 + (k + 1) * sw, Y2], fill=awning[k % 2])
        self.d.rectangle([X1, Y1, X2, Y2], outline=INK, width=self.u(4))
        self.d.line([(X1, Y2 - self.u(10)), (X2, Y2 - self.u(10))], fill=INK, width=self.u(3))

    def boat(self, x, y, length, width, angle=0, col=(220, 222, 226), trim=(70, 190, 172), wake=False):
        """Top-down hovercraft skiff centred on (x, y), pointing along angle (degrees)."""
        L, Wd = length * self.S, width * self.S
        tile = Image.new("RGBA", (int(L + 40 * SS), int(Wd + 40 * SS)), (0, 0, 0, 0)); td = ImageDraw.Draw(tile)
        ox, oy = 20 * SS, 20 * SS
        hull = [(ox, oy + Wd * .2), (ox + L * .72, oy), (ox + L, oy + Wd / 2), (ox + L * .72, oy + Wd), (ox, oy + Wd * .8)]
        td.polygon([(px + 8 * SS, py + 10 * SS) for px, py in hull], fill=(0, 0, 0, 120))
        td.polygon(hull, fill=col, outline=INK, width=self.u(5))
        td.rounded_rectangle([ox + L * .12, oy + Wd * .28, ox + L * .62, oy + Wd * .72], radius=self.u(8), fill=shade(col, .86), outline=INK, width=self.u(3))
        td.line([(ox + L * .05, oy + Wd * .22), (ox + L * .7, oy + Wd * .04)], fill=trim, width=self.u(6))
        td.line([(ox + L * .05, oy + Wd * .78), (ox + L * .7, oy + Wd * .96)], fill=trim, width=self.u(6))
        for fy in (.3, .7):
            r = Wd * .17; cx, cy = ox + L * .02, oy + Wd * fy
            td.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(70, 74, 82), outline=INK, width=self.u(3))
            td.line([(cx - r * .8, cy), (cx + r * .8, cy)], fill=(160, 166, 174), width=self.u(3)); td.line([(cx, cy - r * .8), (cx, cy + r * .8)], fill=(160, 166, 174), width=self.u(3))
        td.rounded_rectangle([ox + L * .64, oy + Wd * .34, ox + L * .76, oy + Wd * .66], radius=self.u(5), fill=(120, 196, 226), outline=INK, width=self.u(3))
        tile = tile.rotate(-angle, expand=True, resample=Image.BICUBIC)
        X, Y = self.p(x) - tile.width // 2, self.p(y) - tile.height // 2
        if wake:
            wk = Image.new("L", self.img.size, 0); wd = ImageDraw.Draw(wk)
            a = -math_rad(angle); bx, by = self.p(x) - math_cos(a) * L * .55, self.p(y) + math_sin(a) * L * .55
            for k in range(14):
                t = k * self.u(30); wd.ellipse([bx - math_cos(a) * t - (Wd * .3 + t * .25), by + math_sin(a) * t - (Wd * .3 + t * .25), bx - math_cos(a) * t + (Wd * .3 + t * .25), by + math_sin(a) * t + (Wd * .3 + t * .25)], outline=200 - k * 12, width=self.u(5))
            self.img.paste((190, 255, 245), (0, 0), wk.filter(ImageFilter.GaussianBlur(self.u(5)))); self.d = ImageDraw.Draw(self.img)
        self.img.paste(tile, (X, Y), tile); self.d = ImageDraw.Draw(self.img)

    def paint(self, x, y, text, size=40, col=(236, 236, 240), angle=0, alpha=170):
        """Floor paint (pad numbers, lane markings) that looks worn into the deck."""
        f = self.font(size, mono=False); tw = int(self.d.textlength(text, font=f)) + self.u(10)
        t = Image.new("L", (tw, int(size * SS * 1.3)), 0); ImageDraw.Draw(t).text((self.u(5), 0), text, font=f, fill=alpha)
        t = t.rotate(angle, expand=True)
        wear = Image.effect_noise(t.size, 60).point(lambda v: 255 if v > 90 else 120)
        t = ImageChops.multiply(t, wear)
        self.img.paste(col, (self.p(x) - t.width // 2, self.p(y) - t.height // 2), t); self.d = ImageDraw.Draw(self.img)

    def pad(self, x, y, w, h, number="7"):
        X1, Y1, X2, Y2 = self.p(x), self.p(y), self.p(x + w), self.p(y + h)
        self.d.rectangle([X1, Y1, X2, Y2], fill=(84, 90, 98), outline=INK, width=self.u(6))
        for k in range(0, int(w * 2)):
            for j in range(0, int(h * 2)):
                c = shade((84, 90, 98), random.uniform(.94, 1.06)); self.d.rectangle([X1 + k * self.S // 2, Y1 + j * self.S // 2, X1 + (k + 1) * self.S // 2, Y1 + (j + 1) * self.S // 2], fill=c, outline=(70, 76, 84), width=self.u(1))
        self.hazard(x, y, x + w, y + .35); self.hazard(x, y + h - .35, x + w, y + h); self.hazard(x, y, x + .35, y + h); self.hazard(x + w - .35, y, x + w, y + h)
        cx, cy, r = (X1 + X2) / 2, (Y1 + Y2) / 2, min(X2 - X1, Y2 - Y1) * .36
        self.d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(236, 220, 120), width=self.u(10))
        for k in range(16):
            a = k / 16 * 6.283; self.d.ellipse([cx + math_cos(a) * (r + self.u(36)) - self.u(9), cy + math_sin(a) * (r + self.u(36)) - self.u(9), cx + math_cos(a) * (r + self.u(36)) + self.u(9), cy + math_sin(a) * (r + self.u(36)) + self.u(9)], fill=(120, 255, 230), outline=INK, width=self.u(2))
        self.paint(x + w / 2, y + h / 2, number, size=int(min(w, h) * self.px * .16), col=(236, 220, 120))

    def crane(self, x, y, length, angle=0):
        a = math_rad(angle); X, Y = self.p(x), self.p(y); L = length * self.S
        ex, ey = X + math_cos(a) * L, Y + math_sin(a) * L
        self.circle(x, y, .9, (226, 176, 52))
        self.d.line([(X, Y), (ex, ey)], fill=INK, width=self.u(30)); self.d.line([(X, Y), (ex, ey)], fill=(226, 176, 52), width=self.u(20))
        for k in range(1, int(length * 2)):
            px_, py_ = X + math_cos(a) * L * k / (length * 2), Y + math_sin(a) * L * k / (length * 2)
            self.d.line([(px_ - math_sin(a) * self.u(9), py_ + math_cos(a) * self.u(9)), (px_ + math_sin(a) * self.u(9), py_ - math_cos(a) * self.u(9))], fill=INK, width=self.u(3))
        self.d.ellipse([ex - self.u(12), ey - self.u(12), ex + self.u(12), ey + self.u(12)], fill=(70, 74, 82), outline=INK, width=self.u(3))

    # ---------- rooms ----------
    def room(self, name, x1, y1, x2, y2, floor="tile", label=True, no_edge=(), walls=True):
        self.rooms.append(dict(name=name, r=(x1, y1, x2, y2), floor=floor, label=label, no_edge=set(no_edge), walls=walls))

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
            if not rm.get("walls", True): continue
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


def scale_walls(ws, px=PX):
    return [{**w, "x1": round(w["x1"] * px), "y1": round(w["y1"] * px), "x2": round(w["x2"] * px), "y2": round(w["y2"] * px)} for w in ws]


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
