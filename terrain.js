function generateTerrain(width, height, noiseType = 'perlin') {
  let heightmap = [];
  let riverMap = [];
  let voronoiPoints = null;
  if (noiseType === 'voronoi') {
    voronoiPoints = generateVoronoiPoints(width, height, 12); // 12 seed-позицій
  }
  // Генеруємо основний рельєф
  for (let y = 0; y < height; y++) {
    let row = [];
    let riverRow = [];
    for (let x = 0; x < width; x++) {
      let nx = x / 100, ny = y / 100;
      let e;
      if (noiseType === 'perlin') {
        e = noise.perlin2(nx, ny);
      } else if (noiseType === 'simplex') {
        e = simplex.simplex2(nx, ny) / 2; // нормалізуємо до [-1,1]
      } else if (noiseType === 'voronoi') {
        // Воронової шум: інвертуємо для "острівців"
        e = 1.0 - voronoiNoise(x, y, voronoiPoints) / 60; // 60 - масштаб
        e = Math.max(-1, Math.min(1, e));
      } else {
        e = noise.perlin2(nx, ny);
      }
      // Додаємо "річку" як синусоїду + шум
      let river = Math.abs(Math.sin(y/60) + noise.perlin2(x/30, y/30)*0.3);
      riverRow.push(river);
      let h = Math.floor((e + 1) / 2 * 255);
      // Знижуємо висоту для річки
      if (river < 0.15) h = Math.min(h, 90 + Math.floor(river*100));
      row.push(h);
    }
    heightmap.push(row);
    riverMap.push(riverRow);
  }
  return {heightmap, riverMap};
} 