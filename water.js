function animateWater(ctx, heightmap, frame) {
  let width = heightmap[0].length;
  let height = heightmap.length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (heightmap[y][x] < 100) {
        let wave = noise.perlin2(x/30, (y+frame*2)/30);
        let blue = Math.floor(120 + 40*wave);
        ctx.fillStyle = `rgb(0,0,${Math.max(100, Math.min(255, blue))})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function animateRiver(ctx, riverMap, frame) {
  let width = riverMap[0].length;
  let height = riverMap.length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (riverMap[y][x] < 0.15) {
        let wave = noise.perlin2(x/20, (y+frame*1.5)/20);
        let blue = Math.floor(180 + 40*wave);
        ctx.fillStyle = `rgb(40,80,${Math.max(120, Math.min(255, blue))})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
} 