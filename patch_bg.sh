#!/bin/bash
sed -i "s/import { useGameStore } from '..\/game\/store';/import { useGameStore } from '..\/game\/store';\nimport { getWorldColors } from '..\/game\/themeRenderer';/g" src/components/PlayfulBackground.tsx

sed -i '/const bgStyle = useGameStore.getState().equippedBackground || '"'"'bg-default'"'"';/,/bgGrad.addColorStop(1, '"'"'#B0E0E6'"'"');/c\
      const bgStyle = useGameStore.getState().equippedBackground || '"'"'bg-meadow'"'"';\
      const colors = getWorldColors(bgStyle);\
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);\
      bgGrad.addColorStop(0, colors[0] || '"'"'#59C1FF'"'"');\
      bgGrad.addColorStop(1, colors[1] || '"'"'#B0E0E6'"'"');\
      let cloudColor = colors[2] || '"'"'#FFFFFF'"'"';\
      let shapeColors = [colors[3] || '"'"'#FF9A8B'"'"', colors[1], colors[0]];\
      let isSpace = bgStyle.includes('"'"'moon'"'"') || bgStyle.includes('"'"'space'"'"') || bgStyle.includes('"'"'robot'"'"');\
' src/components/PlayfulBackground.tsx
