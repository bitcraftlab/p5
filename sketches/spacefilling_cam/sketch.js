
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                  S P A C E   F I L L I N G   C A M                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Demo sketch, showing how to create an image-based spacefilling curve

// @bitcraftlab 2016

// border for the display
var bx = 16;
var by = 16;

// opacity of the path
var opacity = 255;

// step width of the path
var d = 16;

// array to hold our inputs
var inputs = [];

// index into the input array
var inputSelection = 0;

// input image dimensions
var imgWidth = 320;
var imgHeight = 240;
var aspect = imgWidth / imgHeight;

// display dimensions
var w, h, tx, ty, zoom;

// show debug screen
var fatStrokes = false;
var corners = false;
var debug = false;
var show = true;

// webcam stream
var stream;

// turtle object
var turtle;

// turtle commands
var path = "";

// load a default image
function preload() {
  inputSelection = 0;
  inputs[0] = loadImage("data/image.png");
}


function setup() {

  createCanvas(windowWidth, windowHeight);
  updateDisplay();

  path = createPath();

  // create turtle object
  turtle = new Turtle();

}


function createPath() {

  // construct path
  var s = "";
  var rows = floor(imgHeight / d);
  var cols = floor(imgWidth / d - 1) ;

  // horizontal scan
  for(var i = 0; i < rows; i++) {

    // vertical line
    for(var j = 0; j < cols; j++) {
      s += 'f';
    }

    // change directions
    if(i < rows - 1) {
      if(i % 2 === 0) {
        s += 'rfr';
      } else {
        s += 'lfl';
      }
    }

  }

  return s;

}


function draw() {

  background(0);

  // line style
  strokeWeight(fatStrokes ? d/2 : 1);

  push();

  // scale to fit
  translate(tx, ty);
  scale(zoom);

  // pick input image
  var img = inputs[inputSelection];

  // show input image for debugging
  if(debug) {
    tint(255, 127);
    image(img, 0, 0, imgWidth, imgHeight);
  }

  // show the curve
  if(show) {
    // go to the center of the first square
    turtle.reset(d/2, d/2);
    // start walking
    turtle.walk(path, img);
  }

  pop();

}

function videoLoaded() {
  console.log("adjusting webcam dimensions... ");
  img.size(imgWidth, imgHeight);
}


function stopStream() {
  if(stream) {
    // stop video stream
    stream.getVideoTracks()[0].stop();
    console.log("stopped stream");
    stream = null;
    // remove the element from the DOM
    cam.elt.remove();
    // hack to make firefox release the camera ...
    show = false; setTimeout(function() {show = true;}, 0);
  }
}


function keyTyped() {

  switch(key) {

    // [1] to select image input
    case '1':
      // close the webcam stream
      stopStream();
      // use the preloaded image
      inputSelection = 0;
      break;

    // [2] to select web cam Input
    case '2':
      if(!stream) {
        // create a new stream
        cam = createCapture(VIDEO, function(s) {
          console.log("started stream");
          stream = s;
        });
        // add callback to adjust video size once the video metadata is loaded
        cam.elt.onloadedmetadata = function() {
          cam.size(imgWidth, imgHeight);
          inputSelection = 1;
        }

        cam.hide();
        inputs[1] = cam;

      } else {
        // use the existing stream
        inputSelection = 1;
      }
      break;

    // [t] for transparency
    case 't':
      // toggle most siginigicant bit
      opacity ^= 128;
      break;

    // [s] to manually stop the stream
    case 's':
      stopStream();
      break;

    // [i] for Info
    case 'i':
      break;

    // [SPACE] to toggle debug mode
    case ' ':
      show = !show;
      debug = !show;
      break;

    // [d] to overlay debug mode
    case 'd':
      show = true;
      debug = !debug;
      break;

    // [c] to toggle corners
    case 'c':
      corners = !corners;
      strokeCap(corners ? PROJECT : ROUND);
      break;

    // [f] to toggle fat strokes
    case 'f':
      fatStrokes = !fatStrokes;
      break;

    // [-] to decrease details
    case '-':
      d = min(d * 2, 32);
      path = createPath();
      break;

    // [+] to increased details
    case '+':
      d = max(d / 2, 4);
      path = createPath();
      break;

  }

}


// dynamically adjust the canvas size
function windowResized() {

  // adjust canvas size
  resizeCanvas(windowWidth, windowHeight);

  // adjust position of the path
  updateDisplay();

  // recreate the path
  path = createPath();

}


// update display dimensions based on canvas size
function updateDisplay() {

  // maximum screen estate
  var wmax = width - 2 * bx;
  var hmax = height - 2 * by;

  // compute target dimensions, keeping the aspect ratio
  w = min(wmax, hmax * aspect);
  h = min(wmax / aspect, hmax);

  // offset to center the image
  tx = (width - w) / 2;
  ty = (height -h) / 2;

  // zoom factor to stretch the image to the target dimensions
  zoom = min(w / imgWidth, h /imgHeight);

}


// a turtle to draw the path
function Turtle() {

  // direction and turning angle
  var dir = 0;
  var alpha = HALF_PI;

  // step size and pen state
  var penDown = true;

  // reset turtle coordinates
  this.reset = function(_x, _y) {
    dir = 0;
    x = px = _x | 0;
    y = py = _y | 0;
    penDown = true;
  };
  this.reset();

  // walk on the curve taking the image as input
  this.walk = function(steps, grid) {
    grid.loadPixels();
    for(var i = 0; i < steps.length; i++) {
      this.cmd(steps[i], grid);
    };
  };

  // perform turtle action
  this.cmd = function(step, grid) {

    switch(step) {

      // pen up
      case 'u':
        penDown = false;
        break;

      // pen down
      case 'd':
        penDown = true;
        break;

      // rotate left
      case 'l':
        dir = (dir + TWO_PI - alpha) % TWO_PI;
        break;

      // rotate right
      case 'r':
        dir = (dir + alpha) % TWO_PI;
        break;

      // move forward
      case 'f':
        // update previous positions
        px = x;
        py = y;
        // calculate new positions
        x = px + d * cos(dir);
        y = py + d * sin(dir);
        // draw a stroke if the pen is down
        if(penDown) {
          // get color value from the grid
          var pc = getColor(grid, px, py);
          // draw it!
          stroke(pc[0], pc[1], pc[2], opacity);
          line(px, py, x, y);
        }
        break;
    }
  };
}

// get an (r,g,b) color-triple from the pixel grid
function getColor(grid, x, y) {
  var idx = round((y * grid.width + x) * 4);
  var c = [grid.pixels[idx], grid.pixels[idx+1], grid.pixels[idx+2]];
  return c;
}
