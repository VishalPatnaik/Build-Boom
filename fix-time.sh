sed -i 's/let time = 0;/let startTime = performance.now();\n    let time = 0;/g' src/components/PlayfulBackground.tsx
sed -i 's/const render = () => {/const render = (now: number) => {\n      time = now - startTime;/g' src/components/PlayfulBackground.tsx
sed -i 's/time += 1;//g' src/components/PlayfulBackground.tsx

sed -i 's/let time = 0;/let startTime = performance.now();\n    let time = 0;/g' src/components/Shop.tsx
sed -i 's/const render = () => {/const render = (now: number) => {\n      time = now - startTime;/g' src/components/Shop.tsx
sed -i 's/time += 1;//g' src/components/Shop.tsx
sed -i 's/time += 16;//g' src/components/Shop.tsx
