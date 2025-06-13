// Simplex noise 2D (мінімальна версія)
// Джерело: https://github.com/jwagner/simplex-noise.js (адаптовано)
(function(global){
  function Grad(x, y) { this.x = x; this.y = y; }
  Grad.prototype.dot2 = function(x, y) { return this.x*x + this.y*y; };
  var grad3 = [new Grad(1,1),new Grad(-1,1),new Grad(1,-1),new Grad(-1,-1),
    new Grad(1,0),new Grad(-1,0),new Grad(1,0),new Grad(-1,0),
    new Grad(0,1),new Grad(0,-1),new Grad(0,1),new Grad(0,-1)];
  var p = [];
  for (var i=0; i<256; i++) p[i] = Math.floor(Math.random()*256);
  var perm = [];
  for(var i=0; i<512; i++) perm[i]=p[i & 255];
  function simplex2(xin, yin) {
    var n0, n1, n2;
    var F2 = 0.5*(Math.sqrt(3)-1);
    var s = (xin+yin)*F2;
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var G2 = (3-Math.sqrt(3))/6;
    var t = (i+j)*G2;
    var X0 = i-t;
    var Y0 = j-t;
    var x0 = xin-X0;
    var y0 = yin-Y0;
    var i1, j1;
    if(x0>y0){i1=1;j1=0;} else {i1=0;j1=1;}
    var x1 = x0-i1+G2;
    var y1 = y0-j1+G2;
    var x2 = x0-1+2*G2;
    var y2 = y0-1+2*G2;
    var ii = i & 255;
    var jj = j & 255;
    var gi0 = perm[ii+perm[jj]] % 12;
    var gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    var gi2 = perm[ii+1+perm[jj+1]] % 12;
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) n0 = 0.0;
    else { t0 *= t0; n0 = t0 * t0 * grad3[gi0].dot2(x0, y0); }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) n1 = 0.0;
    else { t1 *= t1; n1 = t1 * t1 * grad3[gi1].dot2(x1, y1); }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) n2 = 0.0;
    else { t2 *= t2; n2 = t2 * t2 * grad3[gi2].dot2(x2, y2); }
    return 70.0 * (n0 + n1 + n2);
  }
  global.simplex = { simplex2: simplex2 };
})(window); 