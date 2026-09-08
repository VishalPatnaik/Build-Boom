import sys

content = open('src/components/campaign/WorldDefinitions.ts').read()

new_zones = '''export const ZONE_NAMES = [
  "Spring Meadow", "Autumn Meadow", "Winter Meadow", "Sunset Meadow", 
  "Moon", "Mars", "Beach", "Volcano", 
  "Castle", "Deep Space", "Enchanted Forest", "Pirate", 
  "Candyland", "Golden Legend", "Cyberpunk"
];'''

content = content[:content.find('export const ZONE_NAMES')] + new_zones + content[content.find('export const ZONE_CONFIGS'):]
open('src/components/campaign/WorldDefinitions.ts', 'w').write(content)
