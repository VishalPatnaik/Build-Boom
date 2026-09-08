import json

data = [
    {"name": "Spring Meadow", "req": 0, "prices": (0, 0, 0, 0), "desc_prefix": "Lush green", "isAd": False},
    {"name": "Autumn Meadow", "req": 2, "prices": (120, 60, 80, 50), "desc_prefix": "Crisp orange", "isAd": False},
    {"name": "Winter Meadow", "req": 3, "prices": (180, 90, 120, 75), "desc_prefix": "Snowy", "isAd": False},
    {"name": "Sunset Meadow", "req": 5, "prices": (250, 120, 160, 100), "desc_prefix": "Golden hour", "isAd": False},
    {"name": "Moon", "req": 7, "prices": (400, 180, 250, 150), "desc_prefix": "Crater-filled", "isAd": False},
    {"name": "Mars", "req": 10, "prices": (600, 250, 400, 200), "desc_prefix": "Red dusty", "isAd": False},
    {"name": "Beach", "req": 14, "prices": (850, 350, 550, 300), "desc_prefix": "Sandy shores", "isAd": False},
    {"name": "Volcano", "req": 18, "prices": (1200, 500, 800, 400), "desc_prefix": "Erupting magma", "isAd": False},
    {"name": "Castle", "req": 22, "prices": (1600, 700, 1050, 550), "desc_prefix": "Medieval", "isAd": False},
    {"name": "Deep Space", "req": 25, "prices": (2200, 900, 1400, 700), "desc_prefix": "Colorful gas clouds", "isAd": False},
    {"name": "Enchanted Forest", "req": 27, "prices": (3000, 1200, 1900, 900), "desc_prefix": "Magical glowing", "isAd": False},
    {"name": "Pirate", "req": 28, "prices": (3800, 1500, 2400, 1100), "desc_prefix": "Treacherous waters", "isAd": False},
    {"name": "Candyland", "req": 29, "prices": (5000, 2000, 3200, 1500), "desc_prefix": "Sweet candy", "isAd": False},
    {"name": "Golden Legend", "req": 30, "prices": (7500, 3000, 5000, 2500), "desc_prefix": "A realm of pure gold", "isAd": False},
    {"name": "Cyberpunk", "req": 0, "prices": (0, 0, 0, 0), "desc_prefix": "Neon skyline", "isAd": True},
]

blocks = ["Grass", "Amber Bee", "Frost Bee", "Dusk Bee", "Astronaut", "Rover", "Crab", "Slime", "Knight", "UFO", "Toadstool", "Parrot", "Gummy Bear", "Golden Idol", "Glitch Bot"]
booms = ["Apple", "Pinecone", "Snowball", "Lantern", "Meteor", "Laser", "Coconut", "Fireball", "Catapult Rock", "Plasma", "Fairy Dust", "Cannonball", "Jawbreaker", "Gold Coin", "EMP"]
plates = ["Grass Block", "Autumn Grass", "Snow Block", "Dusk Block", "Landing Pad", "Rusty Metal", "Sandcastle", "Obsidian", "Battlement", "Docking Ring", "Giant Leaf", "Wooden Plank", "Wafer", "Gold Pedestal", "Holo-Pad"]

out = """export interface CosmeticDef {
  id: string;
  name: string;
  type: 'skin' | 'boom' | 'background' | 'plate';
  price: number;
  req: number;
  desc: string;
  isAd: boolean;
  themeIdx: number;
}

export interface CollectionDef {
  id: string;
  name: string;
  isPremium: boolean;
  world: CosmeticDef;
  block: CosmeticDef;
  boom: CosmeticDef;
  plate: CosmeticDef;
}

export const COLLECTIONS: CollectionDef[] = [
"""

for i, d in enumerate(data):
    w, b, bo, pl = d["prices"]
    prem = i >= 9
    out += f"  {{\n"
    out += f"    id: 'col-{i}', name: '{d['name']}', isPremium: {'true' if prem else 'false'},\n"
    out += f"    world: {{ id: 'bg-{i}', name: '{d['name']}', type: 'background', price: {w}, req: {d['req']}, desc: '{d['desc_prefix']} world.', isAd: {'true' if d['isAd'] else 'false'}, themeIdx: {i} }},\n"
    out += f"    block: {{ id: 'skin-{i}', name: '{blocks[i]}', type: 'skin', price: {b}, req: {d['req']}, desc: '{blocks[i]} skin.', isAd: {'true' if d['isAd'] else 'false'}, themeIdx: {i} }},\n"
    out += f"    boom: {{ id: 'boom-{i}', name: '{booms[i]}', type: 'boom', price: {bo}, req: {d['req']}, desc: '{booms[i]} hazard.', isAd: {'true' if d['isAd'] else 'false'}, themeIdx: {i} }},\n"
    out += f"    plate: {{ id: 'plate-{i}', name: '{plates[i]}', type: 'plate', price: {pl}, req: {d['req']}, desc: '{plates[i]} plate.', isAd: {'true' if d['isAd'] else 'false'}, themeIdx: {i} }},\n"
    out += f"  }},\n"

out += "];\n\nexport const ALL_COSMETICS: CosmeticDef[] = COLLECTIONS.flatMap(c => [c.world, c.block, c.boom, c.plate]);\n"

open('src/game/collections.ts', 'w').write(out)
