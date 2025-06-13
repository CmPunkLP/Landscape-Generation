// --- Three.js 3D сцена ---
const WIDTH = 1200, HEIGHT = 900;
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 0.1, 1000);
camera.position.set(0, 80, 120);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);

// --- Освітлення ---
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(0, 100, 100);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x888888));

// --- Генеруємо рельєф ---
let noiseType = 'perlin';
let {heightmap, riverMap} = generateTerrain(WIDTH, HEIGHT, noiseType);
let geometry, terrain;
function createTerrain() {
  // Видаляємо старий рельєф, якщо є
  if (terrain) scene.remove(terrain);
  geometry = new THREE.PlaneGeometry(80, 60, WIDTH-1, HEIGHT-1);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let idx = y * WIDTH + x;
      geometry.attributes.position.setZ(idx, heightmap[y][x]/20);
    }
  }
  geometry.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({vertexColors:true, side:THREE.DoubleSide});
  // Кольори вершин
  const colors = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let h = heightmap[y][x];
      let river = riverMap[y][x];
      let color;
      if (h < 100) color = new THREE.Color(0x204080); // Вода
      else if (river < 0.15) color = new THREE.Color(0x4080b4); // Річка
      else if (h < 120) color = new THREE.Color(0xc0b070); // Пісок
      else if (h < 180) color = new THREE.Color(0x3cb43c); // Трава
      else color = new THREE.Color(0x7a5a32); // Гори
      colors.push(color.r, color.g, color.b);
    }
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrain = new THREE.Mesh(geometry, mat);
  terrain.rotation.x = -Math.PI/2;
  scene.add(terrain);
}
createTerrain();

// --- Вода (озеро) ---
const waterGeo = new THREE.PlaneGeometry(80, 60, 32, 32);
const waterMat = new THREE.MeshPhongMaterial({color:0x4060c0, transparent:true, opacity:0.5});
const water = new THREE.Mesh(waterGeo, waterMat);
water.position.y = 100/20 + 0.1;
water.rotation.x = -Math.PI/2;
scene.add(water);

// --- Дерева (простий циліндр+сфера) ---
let trees = generateTrees(heightmap, 30);
function createTrees() {
  // Видалити старі дерева
  for (let tree of trees) {
    if (tree._trunk) scene.remove(tree._trunk);
    if (tree._crown) scene.remove(tree._crown);
  }
  trees = generateTrees(heightmap, 30);
  for (let tree of trees) {
    let x = (tree.x/WIDTH-0.5)*80;
    let z = (tree.y/HEIGHT-0.5)*60;
    let y = heightmap[tree.y][tree.x]/20;
    // Стовбур
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
    const trunkMat = new THREE.MeshLambertMaterial({color:0x442200});
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, y+1, z);
    scene.add(trunk);
    // Крона
    const crownGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const crownMat = new THREE.MeshLambertMaterial({color:0x228B22});
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(x, y+2, z);
    scene.add(crown);
    tree._trunk = trunk;
    tree._crown = crown;
  }
}
createTrees();

// --- Контролі ---
let windStrength = 1.0;
let dayNight = 0;
const controlsDiv = document.getElementById('controls');
controlsDiv.innerHTML = '<label>День/Ніч <input id="sliderDay" type="range" min="0" max="1" step="0.01" value="0"></label> ' +
  '<label>Вітер <input id="sliderWind" type="range" min="0" max="2" step="0.01" value="1"></label>' +
  '<br><label>X <input id="sliderX" type="range" min="-200" max="200" step="1" value="0"></label>' +
  '<label>Y <input id="sliderY" type="range" min="10" max="200" step="1" value="80"></label>' +
  '<label>Z <input id="sliderZ" type="range" min="10" max="300" step="1" value="120"></label>' +
  '<br><label>Тип шуму <select id="noiseType"><option value="perlin">Перлін</option><option value="simplex">Сімплекс</option><option value="voronoi">Воронової</option></select></label>';

document.getElementById('sliderDay').oninput = e => { dayNight = parseFloat(e.target.value); };
document.getElementById('sliderWind').oninput = e => { windStrength = parseFloat(e.target.value); };

// --- Повзунки для позиції камери ---
function updateCameraFromSliders() {
  const x = parseFloat(document.getElementById('sliderX').value);
  const y = parseFloat(document.getElementById('sliderY').value);
  const z = parseFloat(document.getElementById('sliderZ').value);
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
}
document.getElementById('sliderX').oninput = updateCameraFromSliders;
document.getElementById('sliderY').oninput = updateCameraFromSliders;
document.getElementById('sliderZ').oninput = updateCameraFromSliders;
// Встановити початкову позицію
updateCameraFromSliders();

// --- Обробка зміни типу шуму ---
document.getElementById('noiseType').oninput = function(e) {
  noiseType = e.target.value;
  const res = generateTerrain(WIDTH, HEIGHT, noiseType);
  heightmap = res.heightmap;
  riverMap = res.riverMap;
  createTerrain();
  createTrees();
};

// --- Анімація ---
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  // День/ніч: змінюємо колір неба і положення сонця
  let skyColor = new THREE.Color().lerpColors(new THREE.Color(0x87ceeb), new THREE.Color(0x0a0a2a), dayNight);
  renderer.setClearColor(skyColor);
  sun.intensity = 1.0 - 0.7*dayNight;
  sun.position.y = 100*(1-dayNight) + 10*dayNight;
  sun.position.z = 100*(1-dayNight) - 80*dayNight;

  // Анімація води (просте хвилювання)
  for (let i = 0; i < waterGeo.attributes.position.count; i++) {
    let x = waterGeo.attributes.position.getX(i);
    let y = waterGeo.attributes.position.getY(i);
    let wave = Math.sin(frame/20 + x*2 + y*2) * 0.2 * (1-dayNight);
    waterGeo.attributes.position.setZ(i, wave);
  }
  waterGeo.attributes.position.needsUpdate = true;

  // Анімація дерев (вітер)
  for (let tree of trees) {
    let sway = 0.3 * windStrength * Math.sin(frame/20 + tree.x/50);
    tree._crown.position.x = (tree.x/WIDTH-0.5)*80 + sway;
  }

  renderer.render(scene, camera);
  frame++;
}
animate();

function runTests() {
    const results = [];

    // Тест 1: Перевірка генерації рельєфу
    try {
        const testTerrain = generateTerrain(10, 10, 'perlin');
        if (testTerrain.heightmap.length === 10 && testTerrain.heightmap[0].length === 10) {
            results.push('Тест генерації рельєфу: УСПІШНО');
        } else {
            results.push('Тест генерації рельєфу: НЕВДАЛО');
        }
    } catch (e) {
        results.push('Тест генерації рельєфу: ПОМИЛКА (' + e.message + ')');
    }

    // Тест 2: Перевірка генерації дерев
    try {
        const testTrees = generateTrees([[130,130],[130,130]], 2);
        if (testTrees.length === 2) {
            results.push('Тест генерації дерев: УСПІШНО');
        } else {
            results.push('Тест генерації дерев: НЕВДАЛО');
        }
    } catch (e) {
        results.push('Тест генерації дерев: ПОМИЛКА (' + e.message + ')');
    }

    // Тест 3: Перевірка роботи шуму
    try {
        const n = noise.perlin2(0.5, 0.5);
        if (typeof n === 'number') {
            results.push('Тест шуму Перлін: УСПІШНО');
        } else {
            results.push('Тест шуму Перлін: НЕВДАЛО');
        }
    } catch (e) {
        results.push('Тест шуму Перлін: ПОМИЛКА (' + e.message + ')');
    }

    // Додаємо час тестування
    results.push('Дата і час тестування: ' + new Date().toLocaleString());

    return results;
}

function saveTestResultsToFile(results) {
    const blob = new Blob([results.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

document.getElementById('runTestsBtn').onclick = function() {
    const results = runTests();
    alert(results.join('\n')); // Можна прибрати, якщо не потрібно показувати вікно
    saveTestResultsToFile(results);
}; 