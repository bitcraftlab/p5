
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                       H E L L O    L E A P                                 //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// Demo sketch, showing how to get and record curves with the LEAP motion.

// @bitcraftlab 2016



// CONSTANTS

var names = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky'];
var modes = ['showFingertips', 'showIndexFingers', 'showTooltips'];
var maxTrails = 10;

// VARIABLES

var mode = 0;
var drawing = true;

// OBJECTS

var leap;
var rec;


////////////////////////////////////////////////////////////////////////////////

function setup() {

  // fill the window
  createCanvas(windowWidth, windowHeight);

  // ready to leap?
  leap = new Leap.Controller({
    enableGestures: true
  });
  leap.connect();

  // custom recorder, to store the trails
  rec = new CurveRecorder();

}


function draw() {

  // start recording curve data
  rec.beginRecord();

  background(255);

  // draw trails
  if(drawing) {
    for(var i = 0; i < maxTrails; i++) {
      drawTrail(i);
    }
  }

  // pick a function from this sketch by name and call it
  var frame = leap.frame();
  var displayfn = this[modes[mode]];
  displayfn(frame);

  // display the mode on top
  var title = unCamelCase(modes[mode]);
  showTitle(title);

  // stop recording curve data
  rec.endRecord();

}


// keyboard interaction
function keyTyped() {

  switch (key) {

    // [SPACE] to switch between modes
    case ' ':
      rec.reset();
      mode = (mode + 1) % modes.length;
      break;

    // [d] to toggle display of the drawing
    case 'd':
      drawing = !drawing;
      break;

    // [c] to log the curvre to the console
    case 'c':
      console.log(rec.getCurve());
      break;

    // [r] to reset the drawing
    case 'r':
      rec.reset();
      break;

    // [ANYKEY] to log the data retrieved from the LEAP motion
    default:
      console.log(leap.frame());

  }

}


////////////////////////////////////////////////////////////////////////////////

// show all the finger tips
function showFingertips(frame) {

  var hands = frame.hands;

  // iterate over all hands
  for (var i = 0; i < hands.length; i++) {
    var hand = hands[i];

    // iterate over all finger names
    for (var j = 0; j < names.length; j++) {

      // get finger by name
      var name = names[j];
      var finger = hand[name];

      // draw the finger tips
      drawTip(finger, name);
      saveTip(finger, 5 * i + j);

    }

  }

}


// just show index finger tips
function showIndexFingers(frame) {

  var hands = frame.hands;

  // iterate over all hands
  for (var i = 0; i < hands.length; i++) {

    // get the index finger
    var hand = hands[i];
    var finger = hand.indexFinger;

    // draw it
    var name = hand.type; // left or right
    drawTip(finger, name);

    // save it
    saveTip(finger, i);

  }

}


// show all the tooltips
function showTooltips(frame) {

  var tools = frame.tools;

  for (var i = 0; i < tools.length; i++) {
    var tool  = tools[i];
    drawTip(tool, "tool " + i);
    saveTip(tool, i);
  }

}

////////////////////////////////////////////////////////////////////////////////

// drawing finger tips and tool tips
function drawTip(tip, name) {

  var x = screenX(tip);
  var y = screenY(tip);
  var z = screenZ(tip);

  noStroke();
  fill(255, 0, 0, 100);
  ellipse(x, y, z, z);
  fill(0);
  textSize(10);
  text(unCamelCase(name), x + 15, y + 5);

}


// draw the curve on screen
function drawTrail(index) {

  var trail = rec.getCurve(index);

  noFill();
  stroke(0);

  // now, draw it!
  beginShape();
  for(var i = 0; i < trail.length; i++) {
    var pt = trail[i];
    if(pt) {
      vertex(pt[0], pt[1]);
    } else {
      endShape();
      beginShape();
    }
  }
  endShape();

}


// draw a nice big headline
function showTitle(title) {

  push();
  fill(0, 30);
  noStroke();
  textStyle(BOLD);
  textSize(50);
  textAlign(CENTER);
  text(title, width/2, 100);
  pop();

}


////////////////////////////////////////////////////////////////////////////////

// save the screen coordinates to the recorder
function saveTip(tip, index) {

  var x = screenX(tip);
  var y = screenY(tip);
  var z = screenZ(tip);

  rec.addPoint([x, y, z], index);

}


function screenX(pointable) {
  return pointable.tipPosition[0] + width / 2;
}

function screenY(pointable) {
  return height - pointable.tipPosition[1];
}

function screenZ(pointable) {
  return map(pointable.tipPosition[2], -100, 100, 15, 30);
}


// turn camel case into normal case
function unCamelCase(s) {
  return s
    // insert spaces
    .replace(/([A-Z])/g, ' $1')
    // upper case the first character
    .replace(/^./, function(str){ return str.toUpperCase(); });
}


////////////////////////////////////////////////////////////////////////////////

// curve recorder to store coordinates
function CurveRecorder() {

  this.recorder = [];
  var capacity = 1000;
  var frame;

  // begin a new recording frame
  this.beginRecord = function() {
    frame = [];
  };

  // add a new point to the current frame
  this.addPoint = function(pt, track) {
    track = track || 0;
    frame[track] = pt;
  };

  // end of a recording frame
  this.endRecord = function() {
    // remove the first frame if we have reached the limit
    if(this.recorder.length >= capacity) {
      this.recorder.shift();
    }
    // add new frame
    this.recorder.push(frame);
  };

  // return all points of a certain track
  this.getCurve = function(track) {
    track = track || 0;
    return this.recorder.map(function(frame) { return frame[track]; });
  };

  // remove all data
  this.reset = function() {
    this.recorder = [];
  };

}
