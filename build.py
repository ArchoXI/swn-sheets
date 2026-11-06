#!/usr/bin/env python3
"""Assemble index.html from src/template.html + src/data.js + src/wizard.js + src/levelup.js."""
import pathlib
root=pathlib.Path(__file__).parent
t=(root/"src/template.html").read_text()
t=t.replace("/*@@DATA@@*/",(root/"src/data.js").read_text(),1).replace("/*@@WIZARD@@*/",(root/"src/wizard.js").read_text(),1).replace("/*@@LEVELUP@@*/",(root/"src/levelup.js").read_text(),1).replace("/*@@NPC@@*/",(root/"src/npc.js").read_text(),1)
(root/"index.html").write_text(t)
print("built index.html",len(t),"bytes")
