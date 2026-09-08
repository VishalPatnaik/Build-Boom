#!/bin/bash
sed -i "s/import { renderBlock, renderPlate } from '..\/game\/themeRenderer';/import { renderBlock, renderPlate, getBoomColor } from '..\/game\/themeRenderer';/g" src/components/GameBoard.tsx

sed -i '/if (equippedBoomEffect === '"'"'boom-fire'"'"') effectColor = '"'"'#FF0000'"'"';/,/if (equippedBoomEffect === '"'"'boom-confetti'"'"') effectColor = '"'"'#FF00FF'"'"';/c\
      effectColor = getBoomColor(useGameStore.getState().equippedBoomEffect);\
' src/components/GameBoard.tsx
