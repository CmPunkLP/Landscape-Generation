function updateLighting(frame, width, height, dayNight=0) {
  let lighting = [];
  // Сонце вище вдень, нижче вночі
  let sunY = Math.floor((Math.sin(frame/120) + 1) * height/4 * (1-dayNight) + height*0.8*dayNight);
  let maxLight = Math.floor(80 * (1-dayNight) + 10 * dayNight);
  for (let y = 0; y < height; y++) {
    let row = [];
    for (let x = 0; x < width; x++) {
      let dist = Math.abs(y - sunY);
      let light = Math.max(-40*dayNight, maxLight - Math.floor(dist/2));
      row.push(light);
    }
    lighting.push(row);
  }
  return lighting;
} 