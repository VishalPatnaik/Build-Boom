#!/bin/bash
sed -i '/const renderSkin = (w: number, h: number, x: number, y: number, isCenter = false, overrideColor?: string) => {/,/    };/c\
    const renderSkin = (w: number, h: number, x: number, y: number, isCenter = false, overrideColor?: string) => {\
        renderBlock(ctx, x, y, w, h, equippedCosmetic, isCenter);\
    };' src/components/GameBoard.tsx

sed -i '/\/\/ Shadow \/ Depth/,/\/\/ Top surface/c\
    renderPlate(ctx, cx - 50, cy + bounce - 5, 100, 30, useGameStore.getState().equippedPlate);\
' src/components/GameBoard.tsx

