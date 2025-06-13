// noisejs (перлін-2d) мінімальна версія
// Джерело: https://github.com/josephg/noisejs (адаптовано)
var noise = (function() {
  var module = {};
  var perm = new Uint8Array(512);
  var grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];
  function seed(seed) {
    if(seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if(seed < 256) seed |= seed << 8;
    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) v = perm[i] ^ (seed & 255);
      else v = perm[i] ^ ((seed>>8) & 255);
      perm[i] = perm[i + 256] = v;
    }
  }
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return (1-t)*a + t*b; }
  function grad(hash, x, y) {
    var h = hash & 15;
    var u = h<8 ? x : y;
    var v = h<4 ? y : h===12||h===14 ? x : 0;
    return ((h&1) ? -u : u) + ((h&2) ? -v : v);
  }
  function perlin2(x, y) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    var u = fade(x);
    var v = fade(y);
    var A = perm[X]+Y, AA = perm[A], AB = perm[A+1];
    var B = perm[X+1]+Y, BA = perm[B], BB = perm[B+1];
    return lerp(
      lerp(grad(perm[AA], x, y), grad(perm[BA], x-1, y), u),
      lerp(grad(perm[AB], x, y-1), grad(perm[BB], x-1, y-1), u),
      v);
  }
  // Ініціалізація з фіксованим seed
  for(var i=0; i<256; i++) perm[i] = i;
  seed(12345);
  module.perlin2 = perlin2;
  return module;
})(); 