function generateTrees(heightmap, numTrees) {
  let trees = [];
  let width = heightmap[0].length;
  let height = heightmap.length;
  while (trees.length < numTrees) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    if (heightmap[y][x] > 120) {
      trees.push({x, y, sway: 0});
    }
  }
  return trees;
}

function drawTrees(ctx, trees) {
  for (let tree of trees) {
    let {x, y, sway} = tree;
    // Стовбур
    ctx.strokeStyle = '#442200';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sway, y - 20);
    ctx.stroke();
    // Крона
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x + sway, y - 25, 8, 0, 2 * Math.PI);
    ctx.fill();
  }
} 