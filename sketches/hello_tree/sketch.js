
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                 T R E E                                                    //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//                 PARAMETERS                                                 //
////////////////////////////////////////////////////////////////////////////////

var tree = [1, 2, [3, [4, 5]], 6, [7, 8], 9];
var textRotation = false;
var ang = 30;


////////////////////////////////////////////////////////////////////////////////
//                 GLOBAL VARIABLES                                           //
////////////////////////////////////////////////////////////////////////////////

var leafsize, jointsize, cx, cy;
var m;


////////////////////////////////////////////////////////////////////////////////
//                 MAIN CODE                                                  //
////////////////////////////////////////////////////////////////////////////////

function setup() {

  createCanvas(windowWidth, windowHeight);

  // matrix providing screenX and screenY functions
  m = new Matrix();
  m.angleMode(DEGREES);

  // center of the screen = origin of the tree
  cx = width / 2;
  cy = height / 2;

}


function draw() {

  // tree size depending on mouse distance fom the root
  var d = dist(mouseX, mouseY, cx, cy);

  // adjust leaf size and joint size to tree size
  leafsize = d / 10;
  jointsize = leafsize / 4;
  textSize(leafsize * 3/4);

  // move center towards the mouse
  if(mouseIsPressed) {
    cx = lerp(cx, mouseX, 0.1);
    cy = lerp(cy, mouseY, 0.1);
  }

  // transparent background for motion blur effect
  background(255, 100);

  m.push();

  // go to the root position
  m.translate(cx, cy);

  // rotation of the tree towards the mouse pointer
  var rot = atan2(mouseY - cy, mouseX - cx) - 90;
  m.rotate(rot);

  // draw the tree layer by layer
  for (var layer = 0; layer < 4; layer++) {
    drawTree(tree, d / 3, ang, layer);
  }

  m.pop();

}


////////////////////////////////////////////////////////////////////////////////
//                 INTERACTION                                                //
////////////////////////////////////////////////////////////////////////////////

// type any key to toggle text rotation
function keyTyped() {
  textRotation = !textRotation;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


////////////////////////////////////////////////////////////////////////////////
//                 MY FUNCTIONS                                               //
////////////////////////////////////////////////////////////////////////////////

function drawTree(tree, d, a, layer) {

  m.push();

  // mumber of branches
  var n = tree.length;

  // rotate half the angle range to the left
  m.rotate(a * (n - 1) / 2);

  // draw all the branches
  for (var i = 0; i < n; i++) {

    var branch = tree[i];

    if (typeof branch === 'object') {

      // draw a branch
      switch (layer) {
        case 0: // draw lines on layer 0
          strokeWeight(2);
          stroke(100, 150, 100);
          line(0, 0, 0, d);
          break;
        case 1: // draw joints on layer 1
          drawJoint(0, d, jointsize);
          break;
      }

      m.push();
      m.translate(0, d);
      drawTree(branch, d * 0.85, a, layer);
      m.pop();

    } else {

      // draw a leaf
      switch (layer) {
        case 0: // draw lines on layer 0
          strokeWeight(1);
          stroke(100, 200, 100);
          line(0, 0, 0, d);
          break;
        case 2: // draw leaves on top of everything
          drawLeaf(branch, 0, d, leafsize);
          break;
      }
    }
    m.rotate(-a);
  }
  m.pop();
}

// draw joint at (x, y) with diameter d
function drawJoint(x, y, d) {
  noStroke();
  fill(100, 150, 100);
  ellipse(x, y, d, d);
}

// draw labeled leaf at (x, y) with diameter d
function drawLeaf(str, x, y, d) {
  stroke(100, 255, 100);
  fill(200, 255, 200);
  ellipse(x, y, d, d);
  label(str, x, y, -d/5, d/4);
}

// show a label at positon (x, y) with offset correction (dx, dy)
function label(str, x, y, dx, dy) {
  fill(0);
  noStroke();
  if (textRotation) {
    text(str, x + dx, y + dy);
  } else {
    // get screen coordinates for where the text should go
    var x0 = m.screenX(x, y);
    var y0 = m.screenY(x, y);
    m.push();
    // set current transform to the default matrix
    m.set();
    // position text (with offset added)
    text(str, x0 + dx, y0 + dy);
    m.pop();
  }
}
