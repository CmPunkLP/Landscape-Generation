function animateWind(trees, frame) {
  for (let tree of trees) {
    tree.sway = Math.floor(5 * Math.sin(frame/20 + tree.x/50));
  }
} 