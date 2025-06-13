// Воронової шум (дуже проста імітація)
function voronoiNoise(x, y, points) {
  let minDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    let dx = x - points[i][0];
    let dy = y - points[i][1];
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

// Генерує масив seed-позицій для Вороного
function generateVoronoiPoints(width, height, numPoints) {
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push([
      Math.random() * width,
      Math.random() * height
    ]);
  }
  return points;
} 