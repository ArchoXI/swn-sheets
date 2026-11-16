"""Rebuild the existing maps/ generators as Map Studio projects.

Imports the real generator scripts against a recording stand-in for mapkit, so every
room, door and prop coordinate comes straight from the source instead of being retyped.
Run: python3 convert.py
"""
import sys, types, json, math, random, colorsys
from pathlib import Path
from PIL import Image, ImageDraw

TOOLS = Path('/home/claude/swn-sheets/tools')
OUT = Path('/home/claude/mapstudio/converted'); OUT.mkdir(exist_ok=True)

INK = (12, 14, 17); GLOW = (150, 255, 240); TEAL = (70, 168, 154); PX = 100; SS = 1
FLOORS = {"tile": ((214, 216, 220), (176, 179, 186)), "light": ((226, 228, 232), (186, 189, 196)),
          "grate": ((160, 164, 170), (124, 128, 136)), "cabin": ((200, 202, 214), (168, 170, 186)),
          "med": ((228, 238, 238), (186, 204, 206)), "warm": ((216, 204, 184), (182, 168, 146)),
          "dark": ((128, 132, 140), (100, 104, 112))}
ROOT = Path('/tmp')


def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)
def hx(c): return '#%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in c[:3])


def vivid(c, floor=90):
    """A glow spot's dim additive colour -> the light colour it stands for."""
    m = max(c[:3])
    if m < 4: return '#ffd9a0'
    s = 255.0 / m
    return hx([min(255, v * s) for v in c[:3]])


# floor name -> (Map Studio floor, tint)
MAPF = {'tile': ('plate', None), 'light': ('tile', '#b6bcc4'), 'grate': ('grate', None),
        'cabin': ('carpet', '#4f5668'), 'med': ('tile', '#c2d2d4'), 'warm': ('wood', None),
        'dark': ('plate', '#4a5059')}
FACE = {'down': 0, 'left': 90, 'up': 180, 'right': 270}


class Deck:
    def __init__(self, cols, rows, seed=1, px=PX):
        random.seed(seed)
        self.cols, self.rows, self.px, self.S = cols, rows, PX, PX
        self.W, self.H = cols * PX, rows * PX
        self.img = Image.new('RGB', (cols * PX + 400, rows * PX + 400))
        self.d = ImageDraw.Draw(self.img)
        self.rooms, self.doors, self.opens = [], set(), set()
        self.windows, self.extra_walls, self.locked = [], [], []
        self.R, self.D_, self.P, self.L = [], [], [], []   # rooms, doors, props, lights

    # -- geometry helpers the generators call directly --
    def p(self, v): return int(round(v * self.S))
    def pt(self, x, y): return (self.p(x), self.p(y))
    def u(self, n): return max(1, int(n * SS))
    def font(self, s, mono=True): return None
    def rect(self, x1, y1, x2, y2, **k): pass

    def _noop(self, *a, **k): return None
    space = ocean = grime = grain = floors = labels = auto_cables = plates = _noop
    light_strip = paint = soft_shadow = inked = cable = save = crane = _noop
    def wobble(self, pts, amp=1.4, step=26): return [self.pt(x, y) for x, y in pts]
    def draw_walls(self): return [], []

    # -- recorded: areas --
    def room(self, name, x1, y1, x2, y2, floor='tile', label=True, no_edge=(), walls=True):
        self.rooms.append(dict(name=name, r=(x1, y1, x2, y2), floor=floor))
        f, t = MAPF.get(floor, ('plate', None))
        r = dict(shape='rect', x=x1, y=y1, w=x2 - x1, h=y2 - y1, floor=f, island=True, nm=name)
        if t: r['tint'] = t
        if not walls: r['walls'] = False
        self.R.append(r)

    def hull(self, poly, lights=()):
        # art in the original, not a wall: rooms carry the walls
        self.R.insert(0, dict(shape='poly', pts=[[x, y] for x, y in poly], floor='plate', tint='#626a73', walls=False))
        for x, y in lights: self.L.append(dict(x=x, y=y, r=2.6, col='#8fd0ff', power=.45))

    def platform(self, poly, base=(150, 158, 164), seam=None, rust=0.0, shadow=True, plates=1.0):
        self.R.append(dict(shape='poly', pts=[[x, y] for x, y in poly], floor='rust' if rust >= .25 else 'plate',
                           tint=hx(shade(base, .80)), walls=False))

    def water(self, poly, glow=1.0, rim=(110, 116, 122)):
        xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
        self.R.append(dict(shape='poly', pts=[[x, y] for x, y in poly], floor='water', walls=False, island=True))
        self.L.append(dict(x=sum(xs) / len(xs), y=sum(ys) / len(ys), r=max(3, min(9, (max(xs) - min(xs)) * .5)), col='#4ff0d8', power=.5))

    def pad(self, x, y, w, h, number=None):
        self.R.append(dict(shape='rect', x=x, y=y, w=w, h=h, floor='concrete', tint='#6a6e74', walls=False, island=True))
        self.P.append(dict(type='landing', x=x + w / 2, y=y + h / 2, rot=0, w=min(w, h) * .8, h=min(w, h) * .8))

    def rail(self, pts, col=(196, 200, 206)):
        for a, b in zip(pts, pts[1:]):
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < .4: continue
            self.P.append(dict(type='railing', x=(a[0] + b[0]) / 2, y=(a[1] + b[1]) / 2, w=L, h=.18,
                               rot=round(math.degrees(math.atan2(b[1] - a[1], b[0] - a[0])), 1), col=hx(col)))

    # -- recorded: doors --
    def door(self, kind, x, y, n=1): self.D_.append([kind, x, y, n, False, False])
    def open(self, kind, x, y, n=1): self.D_.append([kind, x, y, n, False, True])

    # -- recorded: props --
    def _pr(self, t, x, y, w, h, rot=0, col=None):
        d = dict(type=t, x=round(x, 3), y=round(y, 3), rot=rot, w=round(w, 3), h=round(h, 3))
        if col: d['col'] = col
        self.P.append(d); return d

    def _box(self, t, x, y, w, h, col=None, portrait=False):
        """A top-left w*h footprint placed as a prop whose art has a fixed orientation."""
        cx, cy = x + w / 2, y + h / 2
        if (h > w) != portrait: return self._pr(t, cx, cy, h, w, 90, col)
        return self._pr(t, cx, cy, w, h, 0, col)

    def crate(self, x, y, w, h, col=(172, 132, 80)):
        self._pr('crate' if max(w, h) >= .9 else 'crateS', x + w / 2, y + h / 2, w, h, 0, hx(col))

    def barrel(self, x, y, col=(60, 120, 170)): self._pr('barrel', x, y, .62, .62, 0, hx(col))
    def tank(self, x, y, r, col=(200, 204, 210), band=None, label=None): self._pr('tank', x, y, r * 2, r * 2, 0, hx(col))
    def locker(self, x, y, w=1, h=1): self._box('locker', x, y, w, h)
    def console(self, x, y, w, h, screen=(110, 210, 150)): self._box('console', x, y, w, h)
    def lift(self, x, y, w, h, label=None): self._pr('lift', x + w / 2, y + h / 2, w, h)
    def hazard(self, x1, y1, x2, y2): self._box('hazard', min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1))
    def stall(self, x, y, w, h, awning=((214, 70, 70), (238, 228, 210)), counter=True):
        self._pr('stall', x + w / 2, y + h / 2, w, h, 0, hx(awning[0]))

    def seat(self, x, y, face='right', col=(70, 168, 154)):
        self._pr('chair', x + .5, y + .5, .62, .62, FACE.get(face, 0))

    def bed(self, x, y, w=1, h=2, vertical=True, blanket=(64, 176, 192)):
        cx, cy = x + w / 2, y + h / 2
        if vertical: self._pr('bed', cx, cy, w, h, 0, hx(blanket))
        else: self._pr('bed', cx, cy, h, w, 270, hx(blanket))

    def pipe(self, pts, col=(198, 124, 74)):
        for a, b in zip(pts, pts[1:]):
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            if L < .3: continue
            self._pr('pipe', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, L, .34,
                     round(math.degrees(math.atan2(b[1] - a[1], b[0] - a[0])), 1), hx(col))

    def circle(self, x, y, r, fill, ring=None):
        if r < .3: return
        cool = ring and ring[2] > ring[0] + 40          # cyan ring = reactor glow
        t = 'reactor' if (r >= .8 and cool) else 'tank' if r >= .8 else 'barrel'
        self._pr(t, x, y, r * 2, r * 2, 0, None if t == 'reactor' else hx(fill))

    def boat(self, x, y, length, width, angle=0, col=(220, 222, 226), trim=None, wake=False):
        self._pr('skiff', x, y, width, length, (angle - 90) % 360, hx(col))

    def glow(self, spots):
        for s in spots:
            x, y, r = s[0], s[1], s[2]
            self.L.append(dict(x=x, y=y, r=max(2.5, min(10, r * 1.15)), col=vivid(s[3]), power=.95))


def scale_walls(ws, px=PX): return []
def update_index(entries): return None


# ---- stand in for mapkit, then run the real generators ----
fake = types.ModuleType('mapkit')
for k, v in dict(Deck=Deck, PX=PX, SS=SS, INK=INK, GLOW=GLOW, TEAL=TEAL, ROOT=ROOT, FLOORS=FLOORS,
                 shade=shade, scale_walls=scale_walls, update_index=update_index).items():
    setattr(fake, k, v)
sys.modules['mapkit'] = fake
sys.path.insert(0, str(TOOLS))
import mapgen_silverfish as SF, mapgen_antara as AN

# the antara helpers are module-level, so swap them for recorders too
def _lamp(D, x, y):
    D._pr('lamp', x, y, .5, .5); D.L.append(dict(x=x, y=y, r=4.5, col='#8ffbe8', power=.8))
def _table(D, x, y, w, h, col=(176, 140, 96), round_=False):
    D._pr('tableRound' if round_ else 'table', x + w / 2, y + h / 2, w, h, 0, hx(col))
def _stool(D, x, y, col=(90, 96, 108)): D._pr('stool', x, y, .45, .45, 0, hx(col))
def _counter(D, x1, y1, x2, y2, col=(120, 128, 140)):
    D._box('bar', min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1), hx(col))
def _plank(D, poly):
    D.R.append(dict(shape='poly', pts=[[x, y] for x, y in poly], floor='wood', tint='#7a5636', walls=False, island=True))
def _scanner(D, x, y, w=2):
    for xx in (x, x + w): D._pr('pillar', xx, y, .34, .34)
AN.lamp, AN.table, AN.stool, AN.counter, AN.plank, AN.scanner = _lamp, _table, _stool, _counter, _plank, _scanner


def doors_out(D):
    out = []
    for kind, x, y, n, lk, op in D.D_:
        if kind == 'h': d = dict(x=x + n / 2, y=y, rot=0, len=n)
        else: d = dict(x=x, y=y + n / 2, rot=90, len=n)
        if lk: d['locked'] = True
        if op: d['open'] = True
        out.append(d)
    return out


def finish(D, name, style, extra=None, locked=(), cols=None, rows=None):
    m = dict(name=name, cols=cols or D.cols, rows=rows or D.rows, style=style,
             rooms=D.R, walls=[], doors=doors_out(D), props=D.P, lights=D.L)
    for w in D.extra_walls:
        m['walls'].append(dict(pts=[[w[0], w[1]], [w[2], w[3]]]))
    for lx, ly in locked:                       # mark doors the generator locked
        for d in m['doors']:
            s = (d['x'] - (d['len'] / 2 if d['rot'] == 0 else 0), d['y'] - (0 if d['rot'] == 0 else d['len'] / 2))
            if abs(s[0] - lx) < .01 and abs(s[1] - ly) < .01: d['locked'] = True
    if extra:
        for k, v in extra.items(): m[k] = m[k] + v
    # every walled room needs its own light, or it reads as a black box
    lit = m['lights']
    for r in m['rooms']:
        if r.get('shape') != 'rect' or r.get('walls') is False: continue
        cx, cy, w, h = r['x'] + r['w'] / 2, r['y'] + r['h'] / 2, r['w'], r['h']
        if any(abs(l['x'] - cx) < w / 2 and abs(l['y'] - cy) < h / 2 for l in lit): continue
        lit.append(dict(x=round(cx, 2), y=round(cy, 2), r=round(max(3, min(9, max(w, h) * .62)), 1),
                        col=style.get('_fill', '#ffe0b0'), power=.9))
    style.pop('_fill', None)
    (OUT / (name_id(name) + '.json')).write_text(json.dumps(m))
    return m


def name_id(n): return n.lower().replace(':', '').replace("'", '').replace(' ', '-').replace('--', '-')


SHIP = dict(mood='station', wall='hull', bg='void', _fill='#e8f2ff')
SEA = dict(mood='day', wall='steel', bg='ocean', _fill='#fff0d0')

maps = []
# ---- Silverfish ----
D, _ = SF.main_deck()
maps.append(finish(D, 'Silverfish: Main Deck', dict(SHIP), extra=dict(
    doors=[dict(x=2.4, y=10.5, rot=90, len=3, open=True)],          # hull gap for the rear ramp
    props=[dict(type='kitchen', x=25.5, y=4.35, rot=0, w=3, h=.7),  # galley counter
           dict(type='tableRound', x=25.75, y=6.65, rot=0, w=1.4, h=1.4),
           dict(type='chair', x=24.6, y=6.6, rot=270), dict(type='chair', x=26.9, y=6.7, rot=90),
           dict(type='toilet', x=22.9, y=4.3, rot=0, w=.6, h=.8),   # head
           dict(type='sink', x=23, y=5.9, rot=0, w=.7, h=.5),
           dict(type='shower', x=21.8, y=6.6, rot=0, w=1.2, h=1.2),
           dict(type='medbed', x=19.4, y=14, rot=0, w=1, h=2.2),    # medbay dressing
           dict(type='vending', x=22.2, y=15.4, rot=0, w=1, h=.7),
           dict(type='hatch', x=11.5, y=13.5, rot=0, w=1, h=1),     # secret hold hatch
           dict(type='rack', x=26.2, y=12.6, rot=0), dict(type='cable', x=25.5, y=15.6, rot=12),
           dict(type='stain', x=6.5, y=12.5, rot=20, w=1.8, h=1.3), dict(type='papers', x=14.6, y=9.4, rot=0)],
    lights=[dict(x=17, y=10.5, r=9, col='#dfeaff', power=.85), dict(x=7, y=10.5, r=7, col='#ffd9a0', power=.8),
            dict(x=25, y=14, r=4, col='#58e6ff', power=1.1)])))
D, _ = SF.command_deck()
maps.append(finish(D, 'Silverfish: Command Deck', dict(SHIP), extra=dict(
    props=[dict(type='holo', x=11.5, y=5.5, rot=0, w=2.2, h=1.8),
           dict(type='screenWall', x=17.5, y=3, rot=0, w=2.4, h=.25),
           dict(type='papers', x=8.2, y=8.1, rot=0), dict(type='cable', x=13.4, y=8.6, rot=8)],
    lights=[dict(x=11.5, y=5.5, r=4, col='#7fe8ff', power=.9), dict(x=17, y=5.5, r=5, col='#bfe4ff', power=.95),
            dict(x=4.5, y=5.5, r=5, col='#ffd9a0', power=.85)])))
D, _ = SF.secret_hold()
maps.append(finish(D, 'Silverfish: Secret Hold', dict(mood='derelict', wall='rust', bg='hull', _fill='#9fe8d8'), extra=dict(
    props=[dict(type='hatch', x=4.5, y=3.5, rot=0, w=1, h=1),
           dict(type='crateS', x=5.4, y=4.4, rot=14), dict(type='junk', x=3.6, y=4.5, rot=0, w=1.2, h=.9)],
    lights=[dict(x=4.5, y=4, r=3.4, col='#7fffe0', power=.85)])))

# ---- Antara ----
D, _ = AN.landing_bay()
maps.append(finish(D, 'Antara: Landing Bay 7', dict(SEA), locked=[(34, 21)], extra=dict(
    props=[dict(type='barricade', x=32, y=15, rot=90, w=4, h=.4), dict(type='crates', x=31.5, y=27, rot=0),
           dict(type='scorch', x=17.5, y=14.5, rot=0, w=6, h=6), dict(type='cable', x=29, y=11.6, rot=22)],
    lights=[dict(x=37, y=5.4, r=5, col='#ffb347', power=.9), dict(x=36, y=12, r=5, col='#ffe6c0', power=.8),
            dict(x=37, y=18.5, r=6, col='#e8f4ff', power=.85), dict(x=34.5, y=23, r=4, col='#ff8a6b', power=.8),
            dict(x=38.5, y=23, r=4.5, col='#e8f4ff', power=.8)])))
D, _ = AN.harbor()
maps.append(finish(D, 'Antara: City Harbor', dict(SEA), locked=[(9, 2)], extra=dict(
    props=[dict(type='sign', x=21, y=.6, rot=0, w=2.4, h=.7, col='#ffb347'),
           dict(type='puddle', x=12, y=10.2, rot=0, w=2.4, h=1.2), dict(type='junk', x=35, y=10.4, rot=0)],
    lights=[dict(x=6, y=4.5, r=7, col='#e8f2ff', power=.85), dict(x=17, y=3.5, r=5, col='#e8f2ff', power=.85),
            dict(x=32, y=4.5, r=7, col='#ffe0b0', power=.8), dict(x=23.5, y=23, r=4, col='#ffb347', power=.9)])))
D, _ = AN.harvester()
maps.append(finish(D, 'Antara: Harvester Rig', dict(mood='day', wall='rust', bg='ocean', _fill='#ffe8c0'), extra=dict(
    props=[dict(type='hazard', x=26.4, y=18.4, rot=0, w=1.6, h=.4), dict(type='junk', x=16.8, y=24.2, rot=0),
           dict(type='stain', x=20, y=20, rot=30, w=3, h=2)],
    lights=[dict(x=21, y=13.5, r=7, col='#c8f0ff', power=.9), dict(x=32.5, y=6.5, r=7, col='#ffd9a0', power=.85),
            dict(x=32.5, y=14, r=7, col='#ffcf9a', power=.9), dict(x=21, y=5.5, r=4, col='#ffb347', power=.7),
            dict(x=21, y=21.5, r=4, col='#ffb347', power=.7)])))
D, _ = AN.scrap_city()
maps.append(finish(D, 'Antara: Scrap City Market', dict(mood='neon', wall='rust', bg='ocean', ambient=.3, contrast=.44, _fill='#ff9a4a'), locked=[(35, 19)], extra=dict(
    props=[dict(type='neon', x=25.5, y=2.2, rot=0, w=4, h=.14, col='#ff4fb8'),
           dict(type='sign', x=34.5, y=13.6, rot=0, w=2.2, h=.7, col='#45e0d8'),
           dict(type='fire', x=12.4, y=12.2, rot=0), dict(type='fire', x=31, y=25, rot=0),
           dict(type='puddle', x=16, y=24.6, rot=0, w=2.2, h=1.4), dict(type='junk', x=9, y=13.4, rot=0)],
    lights=[dict(x=25.5, y=5.5, r=7, col='#ff9a4a', power=1), dict(x=35.5, y=16.5, r=5, col='#45e0d8', power=.9),
            dict(x=35.5, y=21.5, r=5, col='#ff4fb8', power=.85), dict(x=6.5, y=21, r=5, col='#b48aff', power=.85),
            dict(x=12.4, y=12.2, r=4.5, col='#ff8a2a', power=1), dict(x=31, y=25, r=4, col='#ff8a2a', power=.9),
            dict(x=8, y=6, r=9, col='#ffb347', power=.9), dict(x=22, y=19, r=9, col='#9fd8ff', power=.8),
            dict(x=8, y=21, r=9, col='#ffc88a', power=.75), dict(x=22, y=6, r=8, col='#b48aff', power=.7),
            dict(x=35.5, y=25, r=7, col='#9fd8ff', power=.6), dict(x=14, y=16, r=7, col='#ffb347', power=.6)])))
D, _ = AN.skiff()
maps.append(finish(D, 'Antara: Hovercraft Skiff', dict(SEA), extra=dict(
    props=[dict(type='crateS', x=19, y=4.2, rot=18), dict(type='cable', x=20, y=11, rot=5)],
    lights=[dict(x=23.5, y=7, r=5, col='#bfe8ff', power=.9), dict(x=12, y=7, r=8, col='#fff0d0', power=.7),
            dict(x=4.6, y=4, r=3, col='#ffb347', power=.8), dict(x=4.6, y=10, r=3, col='#ffb347', power=.8)])))

print(json.dumps([[m['name'], m['cols'], m['rows'], len(m['rooms']), len(m['doors']), len(m['props']), len(m['lights'])] for m in maps], indent=0))
(OUT / 'all.json').write_text(json.dumps(maps))
