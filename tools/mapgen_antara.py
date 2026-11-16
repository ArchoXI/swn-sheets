"""Antara: five maps over the glowing ocean (1 square = 1 m).
Run: python3 tools/mapgen_antara.py"""
import sys, random
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from mapkit import Deck, SS, INK, scale_walls, update_index, shade

CITY = (170, 178, 184)      # big city plating: clean, pale steel
HARV = (132, 140, 136)      # harvester: worn industrial
SCRAP = (130, 120, 108)     # scrap city base, heavily rusted/patched
SKIFF = (214, 218, 222)


def tag(D, x, y, text, size=14):
    """Labels are left off the art so places can be renamed later."""
    return
    f = D.font(size); X, Y = D.p(x), D.p(y); tw = D.d.textlength(text, font=f)
    D.d.rounded_rectangle([X - D.u(6), Y - D.u(4), X + tw + D.u(6), Y + D.u(size + 5)], radius=D.u(4), fill=(238, 238, 242), outline=INK, width=D.u(2))
    D.d.text((X, Y), text, font=f, fill=INK)


def table(D, x, y, w, h, col=(176, 140, 96), round_=False):
    X1, Y1, X2, Y2 = D.p(x) + D.u(8), D.p(y) + D.u(8), D.p(x + w) - D.u(8), D.p(y + h) - D.u(8)
    D.soft_shadow([(X1, Y1, X2, Y2, 30 if round_ else 6)])
    if round_: D.d.ellipse([X1, Y1, X2, Y2], fill=col, outline=INK, width=D.u(4))
    else: D.d.rounded_rectangle([X1, Y1, X2, Y2], radius=D.u(6), fill=col, outline=INK, width=D.u(4))


def stool(D, x, y, col=(90, 96, 108)):
    X, Y, R = D.p(x), D.p(y), int(.2 * D.S)
    D.d.ellipse([X - R, Y - R, X + R, Y + R], fill=col, outline=INK, width=D.u(3))


def counter(D, x1, y1, x2, y2, col=(120, 128, 140)):
    D.inked([D.p(x1) + D.u(4), D.p(y1) + D.u(4), D.p(x2) - D.u(4), D.p(y2) - D.u(4)], col, radius=4)
    D.d.rounded_rectangle([D.p(x1) + D.u(12), D.p(y1) + D.u(12), D.p(x2) - D.u(12), D.p(y2) - D.u(12)], radius=D.u(3), outline=shade(col, 1.2), width=D.u(2))
    for k in range(int(max(x2 - x1, y2 - y1) * 1.5)):
        if x2 - x1 >= y2 - y1: xx = D.p(x1) + D.u(18) + k * D.S * .66; D.d.ellipse([xx, D.p(y1) + D.u(14), xx + D.u(5), D.p(y1) + D.u(19)], fill=shade(col, .7)) if xx < D.p(x2) - D.u(20) else None


def plank(D, poly):
    """Wooden gangplank between scrap hulls."""
    P = [D.pt(x, y) for x, y in poly]
    D.d.polygon(P, fill=(150, 112, 70), outline=INK, width=D.u(5))
    xs = [p[0] for p in P]; ys = [p[1] for p in P]
    horiz = (max(xs) - min(xs)) > (max(ys) - min(ys))
    if horiz:
        for x in range(int(min(xs)), int(max(xs)), D.u(22)): D.d.line([(x, min(ys) + D.u(4)), (x, max(ys) - D.u(4))], fill=(110, 80, 48), width=D.u(3))
    else:
        for y in range(int(min(ys)), int(max(ys)), D.u(22)): D.d.line([(min(xs) + D.u(4), y), (max(xs) - D.u(4), y)], fill=(110, 80, 48), width=D.u(3))


def scanner(D, x, y, w=2):
    """ID scanner arch with a red beam across a doorway."""
    for xx in (x, x + w):
        D.inked([D.p(xx) - D.u(14), D.p(y) - D.u(14), D.p(xx) + D.u(14), D.p(y) + D.u(14)], (96, 100, 108), radius=4)
    D.d.line([(D.p(x) + D.u(14), D.p(y)), (D.p(x + w) - D.u(14), D.p(y))], fill=(255, 90, 80), width=D.u(4))


def lamp(D, x, y):
    X, Y = D.p(x), D.p(y)
    D.d.ellipse([X - D.u(10), Y - D.u(10), X + D.u(10), Y + D.u(10)], fill=(120, 255, 230), outline=INK, width=D.u(3))


# ======================= 1. LANDING BAY =======================
def landing_bay():
    D = Deck(42, 30, seed=101, px=100); D.ocean()
    D.platform([(2.5, 3.5), (8, 1.2), (42, 1.2), (42, 29), (8, 29), (2.5, 26.5), (1.6, 15)], base=CITY)
    D.rail([(2.5, 3.5), (8, 1.2), (42, 1.2)]); D.rail([(42, 29), (8, 29), (2.5, 26.5), (1.6, 15), (2.5, 3.5)])
    D.pad(4, 5, 27, 19, "7")
    # fuel: tank farm, line to the pad, hose reel
    for (x, y) in [(35, 4), (39, 4)]: D.tank(x, y, 1.6, label="LUMEN")
    D.tank(37, 7.6, 1.3)
    D.pipe([(33.2, 4.2), (31.6, 4.2), (31.6, 9.5), (30.3, 9.5)], (226, 142, 52))
    D.circle(30.4, 9.5, .55, (226, 142, 52), ring=(90, 60, 30))
    D.pipe([(30, 9.7), (28.4, 10.6), (27.6, 12.2)], (60, 64, 72))
    # fuel control booth (window onto the pad)
    D.room("Fuel Control", 33, 10, 39, 14, "tile")
    # customs: hall with scanner, holding cell, office
    D.room("Customs", 33, 16, 41, 21, "light"); D.room("Holding", 33, 21, 36, 25, "dark"); D.room("Port Office", 36, 21, 41, 25, "tile")
    D.floors()
    D.door("h", 35, 14, 2)
    D.door("v", 33, 18, 2); D.door("v", 41, 18, 2)
    D.door("h", 34, 21, 1); D.locked = [("h", 34, 21)]
    D.door("h", 38, 21, 1)
    D.windows += [(33, 11, 33, 13)]
    D.console(36, 10.1, 2.8, 1.2, (226, 142, 52)); D.seat(36.8, 11.4, "up")
    D.locker(38, 12.8, 1, 1)
    scanner(D, 34.6, 18.95, 2); counter(D, 37.2, 16.4, 40.8, 17.3)
    for x in (37.8, 39.6): D.seat(x, 17.3, "up")
    D.bed(33.2, 23.4, 2, 1, vertical=False, blanket=(120, 124, 132)); D.console(36.4, 23.8, 2.2, 1, (120, 200, 255)); D.seat(37, 22.8, "down"); D.locker(39.8, 21.2, 1, 2)
    # cargo + crane along the bottom
    for (x, y, w, h) in [(33, 26, 2, 2), (35.2, 26.2, 1.6, 1.6), (37, 26, 2, 2), (39.2, 26.5, 1.5, 1.5)]: D.crate(x, y, w, h)
    D.crane(31.5, 26.8, 6, 205)
    for x in range(6, 31, 6): lamp(D, x, 4.2); lamp(D, x, 24.8)
    walls, doors = D.draw_walls()
    for d_ in doors:
        if d_["x1"] == 34 and d_["y1"] == 21: d_["locked"] = True
    D.labels(); tag(D, 34.6, 2.1, "FUEL DEPOT"); tag(D, 33.3, 25.4, "CARGO")
    D.glow([(17.5, 14.5, 9, (6, 26, 26)), (37, 5.4, 3, (30, 22, 4))])
    D.save("antara-landing-bay")
    return D, walls + doors


# ======================= 2. HARBOR =======================
def harbor():
    D = Deck(40, 28, seed=202, px=100); D.ocean()
    D.platform([(0, 0), (40, 0), (40, 11.5), (0, 11.5)], base=CITY)
    piers = [(4, 7), (13, 16), (22, 25), (31, 34)]
    for x1, x2 in piers:
        D.platform([(x1, 11.2), (x2, 11.2), (x2, 25.5), (x1, 25.5)], base=shade(CITY, .93), shadow=True)
    for x1, x2 in piers: D.rail([(x1, 11.6), (x1, 25.5), (x2, 25.5), (x2, 11.6)])
    D.rail([(0, 11.5), (4, 11.5)]); D.rail([(7, 11.5), (13, 11.5)]); D.rail([(16, 11.5), (22, 11.5)]); D.rail([(25, 11.5), (31, 11.5)]); D.rail([(34, 11.5), (40, 11.5)])
    # moored skiffs
    D.boat(10, 17, 7, 2.6, 90); D.boat(19.4, 20, 6, 2.4, 90, col=(206, 196, 170), trim=(214, 90, 70))
    D.boat(28.4, 16.5, 7.5, 2.8, 90, col=(196, 204, 214), trim=(226, 142, 52)); D.boat(37.3, 21, 6, 2.4, 92, wake=False)
    for x in (4.3, 6.7, 13.3, 15.7, 22.3, 24.7, 31.3, 33.7):
        for y in (14, 20): D.circle(x, y, .18, (70, 74, 82))
    # buildings on the city deck
    D.room("Fuel Tariff Office", 1, 1, 12, 8, "light"); D.room("Strongroom", 9, 1, 12, 4, "dark", label=False)
    D.room("Harbormaster", 14, 1, 20, 6, "tile"); D.room("Warehouse", 26, 1, 39, 8, "grate")
    D.floors()
    D.door("h", 5, 8, 2); D.door("v", 9, 2, 1); D.door("h", 16, 6, 2); D.door("h", 31, 8, 3)
    D.windows += [(14, 2, 14, 5), (20, 2, 20, 5)]
    counter(D, 1.3, 4.6, 9, 5.4); D.console(2, 1.3, 2, 1, (120, 200, 255)); D.console(5, 1.3, 2, 1, (120, 200, 255))
    for x in (2.2, 4.2, 6.2): D.seat(x, 3.4, "down")
    D.rail([(2, 6.4), (8, 6.4)], col=(226, 142, 52)); D.rail([(2, 7.2), (8, 7.2)], col=(226, 142, 52))
    D.locker(9.2, 1.2, 2.6, 1); D.crate(10, 2.4, 1.6, 1.4, (120, 124, 132))
    D.console(15, 1.3, 4, 1.2, (120, 220, 200)); D.seat(16.5, 2.6, "up"); table(D, 17.5, 3.6, 2.2, 1.6)
    for (x, y, w, h) in [(27, 1.5, 2, 2), (29.2, 1.5, 2, 2), (27, 4, 3, 2), (34, 1.5, 2, 3), (36.2, 1.5, 2, 2), (36.2, 4, 2, 2), (31, 2, 2, 1.6)]: D.crate(x, y, w, h)
    # quay: stalls, fuel pumps on pier 3, lamps
    D.stall(21, 1.4, 3, 1.6, ((70, 150, 190), (236, 236, 240))); D.stall(21, 3.8, 3, 1.6)
    D.tank(23.5, 23.4, 1.1, label="FUEL"); D.circle(22.6, 21.6, .4, (226, 142, 52))
    for x in range(2, 40, 5): lamp(D, x, 10.8)
    for (x, y) in [(13.2, 9.4), (13.9, 9.4), (25.6, 9.6), (26.2, 10.1), (36.5, 9.5)]: D.barrel(x, y)
    walls, doors = D.draw_walls()
    for d_ in doors:
        if d_["x1"] == 9 and d_["y1"] == 2: d_["locked"] = True
    D.labels(); tag(D, 21, 0.25, "MARKET"); tag(D, 4.2, 26.1, "PIER 1"); tag(D, 13.2, 26.1, "PIER 2"); tag(D, 22.2, 26.1, "PIER 3 · FUEL"); tag(D, 31.2, 26.1, "PIER 4")
    D.glow([(20, 20, 10, (4, 24, 26))])
    D.save("antara-harbor")
    return D, walls + doors


# ======================= 3. HARVESTER RIG =======================
def harvester():
    D = Deck(40, 30, seed=303, px=100); D.ocean(1.3)
    D.platform([(2, 3), (4, 1.5), (36, 1.5), (38, 3), (38, 24), (36, 25.5), (4, 25.5), (2, 24)], base=HARV, rust=.12)
    D.rail([(2, 3), (4, 1.5), (36, 1.5), (38, 3), (38, 24), (36, 25.5), (4, 25.5), (2, 24), (2, 3)])
    D.water([(4, 4), (14, 4), (14, 11.5), (4, 11.5)], glow=1.9); D.water([(4, 15.5), (14, 15.5), (14, 23), (4, 23)], glow=1.9)
    for y in (7.7, 19.2): D.crane(15.5, y, 9.5, 180)
    for y in (4, 11.5, 15.5, 23): D.rail([(4, y), (14, y)], col=(226, 176, 52))
    for (x, y) in [(19, 5.5), (23.5, 5.5), (19, 21.5), (23.5, 21.5)]: D.tank(x, y, 1.9, col=(196, 200, 196), label="RAW" if x < 20 else "REFINED")
    D.pipe([(14.3, 7.7), (17, 7.7), (17, 5.5)], (90, 200, 190)); D.pipe([(14.3, 19.2), (17, 19.2), (17, 21.5)], (90, 200, 190))
    D.pipe([(25.4, 5.5), (26.4, 5.5), (26.4, 18.4)], (226, 142, 52)); D.pipe([(25.4, 21.5), (26.4, 21.5), (26.4, 18.4), (33, 18.4), (33, 24.8)], (226, 142, 52))
    D.room("Control Room", 17, 10, 25, 17, "tile"); D.room("Bunkhouse", 28, 3, 37, 10, "cabin"); D.room("Mess Hall", 28, 11, 37, 17, "warm")
    D.floors()
    D.door("v", 25, 13, 1); D.door("h", 20, 10, 2); D.door("h", 20, 17, 2)
    D.door("v", 28, 6, 1); D.door("v", 28, 13, 2); D.door("h", 32, 10, 1)
    D.windows += [(17, 11, 17, 16)]
    D.console(17.3, 11, 1.2, 2.2, (90, 255, 200)); D.console(17.3, 13.6, 1.2, 2.2, (90, 255, 200)); D.seat(18.6, 12, "left"); D.seat(18.6, 14.6, "left")
    table(D, 20.5, 12.6, 3, 2, (70, 78, 92)); D.console(22.8, 15.6, 2, 1.2, (255, 180, 80)); D.locker(23.8, 10.2, 1, 1)
    for x in (28.3, 30.3, 32.3, 34.3):
        D.bed(x, 3.2, 1.4, 2.2, blanket=(120, 128, 108)); D.bed(x, 7.6, 1.4, 2.2, blanket=(120, 128, 108))
    D.locker(36, 3.2, 1, 6.6)
    for (x, y) in [(29.5, 12), (33, 12), (29.5, 14.6), (33, 14.6)]:
        table(D, x, y, 2.4, 1.4)
        for sx in (x + .4, x + 1.2, x + 2): stool(D, sx, y - .1); stool(D, sx, y + 1.5)
    counter(D, 36, 11.3, 36.8, 16.7); D.locker(28.2, 16, 2, .8)
    # loading dock and tanker skiff
    for (x, y, w, h) in [(29, 19, 2, 2), (31.2, 19.4, 1.6, 1.6), (35, 19, 2, 2), (35, 21.2, 1.6, 1.6)]: D.crate(x, y, w, h, (120, 124, 132))
    D.crane(36.5, 23.4, 5, 150)
    D.boat(26, 27.6, 12, 3.4, 0, col=(200, 196, 180), trim=(226, 142, 52))
    for (x, y) in [(21.5, 10.5), (21.8, 9.6), (16.4, 24), (17.1, 24.2)]: D.barrel(x, y, (200, 120, 60))
    walls, doors = D.draw_walls()
    D.labels(); tag(D, 4.3, 4.3, "INTAKE A"); tag(D, 4.3, 15.8, "INTAKE B"); tag(D, 28.5, 18, "LOADING DOCK")
    D.glow([(9, 7.7, 6, (0, 50, 46)), (9, 19.2, 6, (0, 50, 46))])
    D.save("antara-harvester")
    return D, walls + doors


# ======================= 4. SCRAP CITY MARKET =======================
def scrap_city():
    D = Deck(40, 28, seed=404, px=100); D.ocean(.8)
    hulls = {
        "A": [(1, 3), (6, 1.5), (16.5, 2.2), (17, 12.6), (3, 13), (1.2, 9)],
        "B": [(19.5, 1), (38.6, 1.2), (39, 10.6), (19.2, 11)],
        "C": [(1.5, 15.2), (14.6, 14.8), (15, 26.6), (2.4, 26.8), (1, 21)],
        "D": [(17.4, 13.2), (29.6, 13.4), (30, 26.6), (17, 26.8)],
        "E": [(32, 13), (39, 12.6), (39.2, 26.6), (32.4, 27)],
    }
    tints = {"A": SCRAP, "B": (120, 128, 136), "C": (136, 118, 96), "D": (126, 124, 112), "E": (110, 118, 124)}
    for k, poly in hulls.items(): D.platform(poly, base=tints[k], rust=.3)
    plank(D, [(16.6, 6), (19.6, 6), (19.6, 7.6), (16.6, 7.6)]); plank(D, [(6, 12.6), (7.6, 12.6), (7.6, 15.4), (6, 15.4)])
    plank(D, [(14.6, 20.4), (17.4, 20.4), (17.4, 22), (14.6, 22)]); plank(D, [(29.6, 17.4), (32.4, 17.4), (32.4, 19), (29.6, 19)])
    plank(D, [(23.4, 10.6), (25, 10.6), (25, 13.6), (23.4, 13.6)])
    D.room("The Drowned Lantern", 20, 2, 31, 9, "warm"); D.room("Back Store", 31, 2, 37, 6, "dark", label=False)
    D.room("Forger", 33, 14, 38, 19, "tile"); D.room("Back Room", 33, 19, 38, 24, "dark")
    D.room("Info Broker", 3, 18, 10, 24, "cabin")
    D.floors()
    D.door("h", 24, 9, 2); D.door("v", 31, 4, 1); D.door("v", 33, 16, 1); D.door("h", 35, 19, 1); D.door("v", 10, 20, 1)
    # bar
    counter(D, 20.3, 2.3, 25.5, 3.1, (150, 104, 66)); D.locker(20.3, 2.2, 5, .3)
    for x in (21, 22.2, 23.4, 24.6): stool(D, x, 3.6)
    for (x, y) in [(26.2, 3), (28.6, 3), (26.2, 6), (28.6, 6), (21, 6)]:
        table(D, x, y, 1.6, 1.6, round_=True)
        for dx, dy in [(-.15, .8), (1.75, .8), (.8, -.15), (.8, 1.75)]: stool(D, x + dx, y + dy)
    for (x, y, w, h) in [(31.3, 2.3, 1.6, 1.6), (33.2, 2.3, 1.6, 1.6), (35, 2.3, 1.6, 1.6), (35, 4.1, 1.6, 1.6)]: D.crate(x, y, w, h)
    # forger: counter out front, locked back room with gear
    counter(D, 34.6, 14.3, 35.4, 18.7, (120, 110, 100)); D.console(36, 14.3, 1.8, 1, (120, 200, 255)); D.seat(36.6, 15.4, "up")
    D.console(33.3, 19.4, 2.4, 1.2, (255, 120, 200)); D.console(35.8, 19.4, 2, 1.2, (120, 255, 200)); table(D, 34, 21.4, 3, 1.6, (90, 96, 108)); D.locker(33.2, 23, 4.6, .8)
    # info broker
    D.console(3.4, 18.3, 2.5, 1.1, (200, 160, 255)); D.seat(4.2, 19.5, "up"); table(D, 6.5, 20.5, 2, 1.5, round_=True); D.bed(8.4, 18.3, 1.4, 2.2, blanket=(140, 100, 160))
    # market stalls and scrap piles
    cols = [((214, 70, 70), (238, 228, 210)), ((70, 150, 190), (236, 236, 240)), ((226, 176, 52), (60, 60, 66)), ((110, 170, 90), (236, 236, 228))]
    for i, (x, y) in enumerate([(3, 3.5), (6.5, 3.5), (10, 3.5), (3, 8.6), (6.5, 8.6), (10.3, 8.4), (13.2, 5.6)]): D.stall(x, y, 2.6, 1.6, cols[i % 4])
    for i, (x, y) in enumerate([(18.4, 15), (21.8, 15), (25.2, 15), (18.4, 22.8), (21.8, 22.8), (25.2, 22.8)]): D.stall(x, y, 2.6, 1.6, cols[(i + 1) % 4])
    for (x, y) in [(13.5, 23.8), (4.5, 25.4), (28.4, 20), (36, 25.2), (14.6, 10.2), (38, 9.2)]:
        for _ in range(5):
            D.crate(x + random.uniform(-.6, .6), y + random.uniform(-.5, .5), random.uniform(.6, 1), random.uniform(.6, 1), random.choice([(120, 124, 132), (150, 112, 70), (96, 110, 104)]))
        D.barrel(x + .9, y - .6, (170, 80, 60))
    for (x, y) in [(5, 12), (15.5, 3), (27, 12.5), (21, 25.6), (35.5, 13.5), (11, 15.8)]: lamp(D, x, y)
    walls, doors = D.draw_walls()
    for d_ in doors:
        if d_["x1"] == 35 and d_["y1"] == 19: d_["locked"] = True
    D.labels(); tag(D, 2.2, 2.1, "MARKET ROW"); tag(D, 18.2, 13.8, "THE SPRAWL")
    D.glow([(18, 12.5, 4, (0, 30, 34)), (25, 5.5, 3, (30, 18, 4))])
    D.save("antara-scrap-city")
    return D, walls + doors


# ======================= 5. HOVERCRAFT SKIFF =======================
def skiff():
    D = Deck(32, 14, seed=505, px=100); D.ocean()
    # spray wake behind the skiff
    from PIL import Image, ImageDraw, ImageFilter
    wk = Image.new("L", D.img.size, 0); wd = ImageDraw.Draw(wk)
    for k in range(18):
        t = k * .45; wd.ellipse([D.p(2.4 - t) - D.u(40 + k * 14), D.p(7) - D.u(150 + k * 16), D.p(2.4 - t) + D.u(40 + k * 14), D.p(7) + D.u(150 + k * 16)], outline=max(30, 220 - k * 11), width=D.u(6))
    D.img.paste((190, 255, 245), (0, 0), wk.filter(ImageFilter.GaussianBlur(D.u(8)))); D.d = ImageDraw.Draw(D.img)
    hull = [(3, 2), (22, 1.6), (28, 3.5), (31, 7), (28, 10.5), (22, 12.4), (3, 12), (2.2, 7)]
    D.platform(hull, base=SKIFF)
    D.rail([(4, 2.4), (22, 2), (27.6, 3.8), (30.4, 7), (27.6, 10.2), (22, 12), (4, 11.6)])
    for y in (4, 10):
        D.circle(4.6, y, 1.7, (60, 64, 72), ring=(150, 156, 166))
        X, Y = D.p(4.6), D.p(y)
        for a in range(0, 360, 45):
            import math
            D.d.line([(X, Y), (X + math.cos(math.radians(a)) * D.u(110), Y + math.sin(math.radians(a)) * D.u(110))], fill=(150, 156, 166), width=D.u(6))
        D.circle(4.6, y, .45, (226, 142, 52))
    D.room("Cabin", 21, 4, 26, 10, "tile")
    D.floors()
    D.door("v", 21, 6, 2)
    D.windows += [(26, 4, 26, 10), (21, 4, 26, 4), (21, 10, 26, 10)]
    for row in range(3):
        for x in (8, 11.5, 15):
            D.locker(x, 3.2 + row * 3.2 if row < 2 else 3.2, 2.6, .6) if False else None
    for x in (9, 12, 15, 18):
        for y in (3.4, 9.8): counter(D, x, y, x + 2.2, y + .7, (70, 168, 154))
    table(D, 8.5, 5.6, 6, 2.8, (96, 90, 80))
    for i in range(7): D.d.line([(D.p(8.8 + i * .85), D.p(5.8)), (D.p(8.8 + i * .85), D.p(8.2))], fill=INK, width=D.u(2))
    for i in range(4): D.d.line([(D.p(8.8), D.p(5.8 + i * .7)), (D.p(14.2), D.p(5.8 + i * .7))], fill=INK, width=D.u(2))
    for (x, y, w, h) in [(15.5, 5.6, 1.6, 1.4), (15.5, 7.2, 1.6, 1.2), (17.4, 6, 1.4, 2)]: D.crate(x, y, w, h)
    D.seat(24.6, 6.4, "right"); D.seat(23, 5, "right"); D.seat(23, 8, "right")
    D.console(25, 4.4, 1, 1.6, (120, 220, 255)); D.console(25, 8, 1, 1.6, (120, 220, 255)); D.console(25.2, 6.2, .8, 1.6, (255, 200, 90))
    D.circle(28.6, 7, .6, (70, 74, 82)); D.d.line([D.pt(28.6, 7), D.pt(30.4, 7)], fill=INK, width=D.u(14)); D.d.line([D.pt(28.6, 7), D.pt(30.4, 7)], fill=(96, 100, 108), width=D.u(8))
    walls, doors = D.draw_walls()
    D.labels(); tag(D, 8.6, 4.5, "CARGO NET"); tag(D, 27.4, 5.6, "BOW GUN")
    D.save("antara-skiff")
    return D, walls + doors


if __name__ == "__main__":
    out = []
    meta = [
        (landing_bay, "antara-landing-bay", "Antara: Landing Bay 7", "Spaceport pad in the main floating city: fuel depot, fuel control, customs with ID scanner, holding cell.", "lit",
         "Holding cell door is locked. Fuel control overlooks the pad. Customs ID scanner sits in the hall doorway."),
        (harbor, "antara-harbor", "Antara: City Harbor", "Boat piers under the main city: fuel tariff office, harbormaster, warehouse, moored skiffs.", "lit",
         "Strongroom in the Fuel Tariff Office is locked. Pier 3 has the boat fuel pumps."),
        (harvester, "antara-harvester", "Antara: Harvester Rig", "Plankton harvester out on the open ocean: intake pools, refinery tanks, control room, bunkhouse, mess, loading dock.", "lit",
         "Intake pools are open water. Tanker skiff moored at the loading dock."),
        (scrap_city, "antara-scrap-city", "Antara: Scrap City Market", "Salvaged hulls lashed together: market row, the Drowned Lantern bar, forger, info broker, gangplanks.", "lit",
         "Forger's back room is locked. Gangplanks are the only links between hulls."),
        (skiff, "antara-skiff", "Antara: Hovercraft Skiff", "Passenger and cargo skiff under way: benches, cargo net, cabin, twin fans, bow gun.", "lit",
         "Good for travel scenes, boarding and chases. Edges are open water."),
    ]
    for fn, id_, name, desc, light, notes in meta:
        D, ws = fn()
        out.append(dict(id=id_, name=name, desc=desc, file=f"maps/{id_}.jpg", thumb=f"maps/{id_}-thumb.jpg", w=D.W, h=D.H, gridPx=D.px, offX=0, offY=0,
                        scale=1, lighting=light, walls=scale_walls(ws, D.px), notes=notes))
        print(id_, D.W, D.H, len(ws))
    update_index(out)
