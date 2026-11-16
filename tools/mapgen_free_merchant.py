"""Generic 'Free Merchant: Main Deck' demo map in the house style.
Run: python3 tools/mapgen_free_merchant.py"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from mapkit import Deck, PX, SS, INK, scale_walls, update_index

D = Deck(31, 19, seed=7)
D.space()
D.hull([(1.4, 3.2), (6, 2.4), (14.6, 2.2), (23.4, 4.8), (28.6, 5.4), (30.3, 9.5), (28.6, 13.6), (23.4, 14.2), (14.6, 16.4), (12.6, 18.6), (8.4, 18.6), (6, 16.6), (1.4, 15.8)],
       lights=[(1.4, 3.2), (1.4, 15.8), (14.6, 2.2), (14.6, 16.4), (30.3, 9.5)])
D.room("Engineering", 2, 4, 7, 15, "grate"); D.room("Cargo Bay", 7, 3, 14, 16, "dark")
D.room("Crew Cabin", 14, 4, 18, 8, "cabin"); D.room("Galley", 18, 4, 23, 8, "warm")
D.room("Cabin 2", 14, 11, 18, 15, "cabin"); D.room("Medbay", 18, 11, 23, 15, "med")
D.room("Corridor", 14, 8, 23, 11, "light", label=False); D.room("Bridge", 23, 6, 28, 13, "tile", no_edge=[("v", 28, y) for y in range(6, 13)])
D.room("Airlock", 9, 16, 12, 18, "grate")
D.floors()
D.d.polygon([D.pt(28, 6), D.pt(29.6, 9.5), D.pt(28, 13)], fill=(214, 216, 220))
for k, x, y, n in [("v", 7, 9, 2), ("v", 14, 9, 2), ("h", 15, 8, 2), ("h", 20, 8, 2), ("h", 15, 11, 2), ("h", 20, 11, 2), ("v", 23, 9, 2), ("h", 10, 16, 2), ("h", 10, 18, 2)]:
    D.door(k, x, y, n)
D.extra_walls += [(28, 6, 29.6, 9.5), (29.6, 9.5, 28, 13)]
for (x, y, w, h) in [(8, 4, 2, 2), (10.2, 4, 2, 2), (8, 6.2, 2, 1.6), (12, 12, 1.6, 3.4), (8, 12.5, 3, 2.2), (12.2, 4, 1.6, 1.6)]:
    D.crate(x, y, w, h)
D.circle(4.5, 9.5, 1.6, (70, 74, 84), ring=(90, 210, 240)); D.circle(4.5, 9.5, .7, (160, 236, 255))
D.console(2.3, 4.3, 4.4, 1.3, (255, 170, 80)); D.console(2.3, 13.4, 4.4, 1.3, (255, 170, 80))
for x, y in [(14.3, 4.3), (16.2, 4.3), (14.3, 12.7), (16.2, 12.7)]: D.bed(x, y, 1.5, 2)
D.crate(19.2, 5.2, 2.6, 1.4, (196, 160, 112)); D.locker(18.2, 4.1, 4.6, .7)
for x in (18.6, 20.8): D.bed(x, 12.4, 1.6, 2.2, blanket=(120, 220, 200))
for (x, y) in [(26.2, 7.2), (26.2, 10.8), (27.4, 9.0)]: D.console(x, y, 1.2, 1.1, (110, 200, 255))
D.seat(24.6, 9, "right")
walls, doors = D.draw_walls()
D.labels()
D.glow([(4.5, 9.5, 2.4, (20, 60, 80))])
D.save("free-merchant-deck")
nose = [dict(x1=28 * PX, y1=6 * PX, x2=int(29.6 * PX), y2=int(9.5 * PX)), dict(x1=int(29.6 * PX), y1=int(9.5 * PX), x2=28 * PX, y2=13 * PX)]
update_index([dict(id="free-merchant-deck", name="Free Merchant: Main Deck", desc="Generic starship deck: bridge, cabins, galley, medbay, cargo, engineering. Walls and doors set.",
                   file="maps/free-merchant-deck.jpg", thumb="maps/free-merchant-deck-thumb.jpg", w=D.W, h=D.H, gridPx=PX, offX=0, offY=0, scale=1, lighting="lit",
                   walls=scale_walls(walls + doors) + nose)])
print("free merchant", D.W, D.H)
