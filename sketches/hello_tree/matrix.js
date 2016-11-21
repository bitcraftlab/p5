
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                 M A T R I X . J S                                          //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Matrix improves upon the current implementation of the p5.js 2D renderer
// - screenX(x, y) & screenY(x, y) get coordinates under the current transform
// - set(m) set the current transform to a new Matrix
// - set() set the current transform to the default transform

// this is useful for figuring out the position that results from a
// transformation, and using it later on ...

function Matrix(app) {

  var stack = [];
  var app = app || window;
  var mat = new p5.Matrix.identity();
  var mode = 'radians';

  this.angleMode = function(m) {
    angleMode(m);
    mode = m;
  };

  this.rotate = function(angle) {
    app.rotate(angle);
    if(mode === 'degrees') {
      angle = radians(angle);
    }
    mat.rotateZ(angle);
  };

  this.translate = function(dx, dy) {
    app.translate(dx, dy);
    mat.translate([dx, dy]);
  };

  this.scale = function(sx, sy) {
    app.scale(sx, sy);
    mat.scale([sx, sy, 1]);
  };

  this.push = function() {
    app.push();
    stack.push(mat);
    mat = mat.copy();
  };

  this.pop = function() {
    app.pop();
    mat = stack.pop();
    return mat;
  };

  this.get = function() {
    return mat.copy();
  };

  this.set = function(m) {
    m = m || p5.Matrix.identity();
    app.resetMatrix();
    app.applyMatrix(m[0], m[1], m[2], m[4], m[5], m[6]);
    mat = m.copy();
  };

  this.screenX = function(x, y) {
    var mm = mat.mat4;
    return mm[0] * x + mm[4] * y + mm[12];
  };

  this.screenY = function(x, y) {
    var mm = mat.mat4;
    return mm[1] * x + mm[5] * y + mm[13];
  };

  return this;

}
