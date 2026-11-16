"""The Silverfish (free merchant): main deck, command deck and secret hold.
Based on Wyatt's Minecraft build (1 block = 1 square = 1 m). Front faces right.
Run: python3 tools/mapgen_silverfish.py"""
import json, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

import sys; sys.path.insert(0, str(Path(__file__).resolve().parent))
from mapkit import Deck, PX, SS, INK, ROOT as root, scale_walls, update_index, shade

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
    D.d.rectangle([D.p(ox - 1.7), D.p(oy + 8.2), D.p(ox + .9), D.p(oy + 10.8)], fill=(150, 154, 160), outline=INK, width=5 * SS)
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
    D.d.rounded_rectangle([D.p(X(20)) + 14 * SS, D.p(Y(3)) + 14 * SS, D.p(X(22)) - 14 * SS, D.p(Y(5)) - 14 * SS], radius=16 * SS, fill=(236, 244, 246), outline=INK, width=4 * SS)
    D.d.ellipse([D.p(X(20.6)), D.p(Y(5.4)), D.p(X(21.4)), D.p(Y(6.4))], fill=(236, 244, 246), outline=INK, width=4 * SS)
    # galley: counter along the top, curved bench (the prismarine stairs) and a table
    D.d.rectangle([D.p(X(22)) + 6 * SS, D.p(Y(3)) + 6 * SS, D.p(X(25)) - 6 * SS, D.p(Y(3.7))], fill=(170, 176, 184), outline=INK, width=4 * SS)
    D.d.arc([D.p(X(22.4)) - 4 * SS, D.p(Y(3.6)) - 4 * SS, D.p(X(26.6)) + 4 * SS, D.p(Y(8.6)) + 4 * SS], 180, 270, fill=INK, width=42 * SS); D.d.arc([D.p(X(22.4)), D.p(Y(3.6)), D.p(X(26.6)), D.p(Y(8.6))], 180, 270, fill=(70, 168, 154), width=34 * SS)
    D.d.ellipse([D.p(X(23.1)), D.p(Y(5)), D.p(X(24.4)), D.p(Y(6.3))], fill=(196, 160, 112), outline=INK, width=4 * SS)
    # medbay
    D.bed(X(17), Y(12), 1, 2); D.bed(X(19), Y(12), 1, 2)
    D.console(X(17.5), Y(14.5), 2, 1.3, (120, 255, 200))
    D.d.rounded_rectangle([D.p(X(20.2)), D.p(Y(14.6)), D.p(X(20.9)), D.p(Y(15.8))], radius=8 * SS, fill=(250, 250, 250), outline=(190, 40, 40), width=5 * SS)
    # engineering: reactor, conduits, workbench (furnaces + copper rods in the build)
    D.circle(X(23), Y(13), .95, (70, 74, 84), ring=(90, 210, 240))
    cx, cy = D.p(X(23)), D.p(Y(13)); r = int(.42 * D.S)
    D.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(160, 236, 255), outline=INK, width=4 * SS)
    D.pipe([(X(24.5), Y(11.3)), (X(24.5), Y(14.6))]); D.pipe([(X(21.4), Y(14.6)), (X(22.2), Y(13.6))])
    D.console(X(21), Y(11), 1.5, 1, (255, 170, 80)); D.crate(X(24), Y(11), 1, 1, (176, 134, 78))
    # fore gunnery: ammo feeds to the two chin guns
    D.console(X(25), Y(6.4), 2, 1.2, (255, 120, 120)); D.console(X(25), Y(11.4), 2, 1.2, (255, 120, 120))
    D.seat(X(25.4), Y(8.5), "right"); D.locker(X(26), Y(9.5), 1, 1)
    # ship's locker (secret hatch sits under the plate at 10,12 - drawn as plain floor on purpose)
    D.locker(X(9), Y(11), 1, 1); D.locker(X(11), Y(13), 1, 1); D.crate(X(11), Y(11), 1, 1, (150, 110, 64))
    # corridor light strips
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
    D.d.rectangle([D.p(X(2.85)), D.p(Y(3.35)), D.p(X(6.15)), D.p(Y(6.65))], outline=INK, width=6 * SS)
    D.d.line([D.pt(X(6.15), Y(4.4)), D.pt(X(6.15), Y(5.6))], fill=(78, 84, 92), width=9 * SS)
    for (x, y) in [(1.4, 1.4), (6.6, 1.4), (1.4, 7.6), (6.6, 7.6)]: D.seat(X(x), Y(y), "down" if y < 4 else "up")
    D.d.rounded_rectangle([D.p(X(1.25)), D.p(Y(2.4)), D.p(X(1.8)), D.p(Y(7.6))], radius=8 * SS, fill=(70, 168, 154), outline=INK, width=4 * SS)
    # ops: two console banks each side and two crew seats (prismarine)
    for x in (9, 10, 11):
        D.console(X(x), Y(1), 1, 1, (255, 90, 90) if x == 10 else (120, 200, 255))
        D.console(X(x), Y(7), 1, 1, (255, 90, 90) if x == 10 else (120, 220, 200))
    D.seat(X(10), Y(2), "up"); D.seat(X(10), Y(6), "down")
    D.console(X(12.6), Y(3.6), 1, 1.8, (180, 160, 255))
    D.d.rounded_rectangle([D.p(X(9.4)), D.p(Y(3.6)), D.p(X(11.6)), D.p(Y(5.4))], radius=14 * SS, fill=(70, 78, 92), outline=INK, width=5 * SS)
    D.d.ellipse([D.p(X(10.1)), D.p(Y(4.1)), D.p(X(10.9)), D.p(Y(4.9))], outline=(120, 240, 255), width=3 * SS)
    # cockpit: pilot + copilot facing forward, nav consoles, canopy
    D.seat(X(15.2), Y(3.6), "right"); D.seat(X(15.2), Y(5.4), "right"); D.seat(X(14.2), Y(4.5), "right")
    D.console(X(16.6), Y(2.4), 1.2, 1.4, (120, 220, 255)); D.console(X(16.6), Y(4.3), 1.2, 1.4, (255, 200, 90)); D.console(X(16.6), Y(6.2), 1.2, 1.4, (120, 220, 255))
    D.windows += [(X(18), Y(2), X(18), Y(8)), (X(14), Y(2), X(18), Y(2)), (X(14), Y(8), X(18), Y(8))]
    walls, doors = D.draw_walls()
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
    D.d.line([D.pt(3.15, 4.6), D.pt(5.85, 4.6)], fill=(70, 200, 190), width=4 * SS)
    walls, doors = D.draw_walls()
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
    update_index(entries)
    print("main", m.W, m.H, len(mw), "| command", c.W, c.H, len(cw), "| hold", h.W, h.H, len(hw))
