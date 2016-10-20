
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//                 H E L L O    G M L                                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// A simple sketch to load and draw GML in P5.js ...

// @bitcraftlab 2016


////////////////////////////////////////////////////////////////////////////////
//                 PARAMETERS                                                 //
////////////////////////////////////////////////////////////////////////////////

// borders
var xgap = 20;
var ygap = 20;

var id = 53910;
// var id = 'random';
// var id = 'random';
// var id = 'latest';
// var id = 120;


////////////////////////////////////////////////////////////////////////////////
//                 GLOBAL VARIABLES                                           //
////////////////////////////////////////////////////////////////////////////////

// Make GML data global so we can play with it in the browser
var GML;

// Strokes with time code in GML format
var strokes;

// Bounding Box of the Graffiti
var bbox;

////////////////////////////////////////////////////////////////////////////////
//                 MAIN CODE                                                  //
////////////////////////////////////////////////////////////////////////////////

function setup() {

  noLoop();
  createCanvas(windowWidth, windowHeight);
  loadGML(id);

  ////  We can also get the id from our own URL params
  // var params = getURLParams();
  // id = params.id ? params.id : id;

  //// or try to pass extra parameters ...
  //loadGML('latest', {'application': 'eyewriter'});

}

////////////////////////////////////////////////////////////////////////////////
//                 INTERACTION                                                //
////////////////////////////////////////////////////////////////////////////////

// adjust canvas to fill the entire window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawGML(GML);
}


////////////////////////////////////////////////////////////////////////////////
//                 MY FUNCTIONS                                               //
////////////////////////////////////////////////////////////////////////////////


// load GML from 000000book.com
function loadGML(id, params) {

  // construct URL
  // var url = 'http://000000book.com/data/' + id + '.json';
  // var type = 'jsonp';

  // Use local data
  var url = './data/' + id + '.json';
  var type = 'json';

  // construct url params
  if(params) {
    var urlparams = [];
    for(var key in params) {
      urlparams.push(key + '=' + params[key]);
    }
    url += '?' + join(urlparams, '&');
  }

  // download GML
  println('Downloading ' + url );
  loadJSON(url,  parseGML, type);

}


// extract stroke data
function parseGML(GML) {

  // expose some global variables, so we can easily inspect it inside the browser
  exposeGML(GML);

  // print some info to the console
  printGML(GML);

  // now call the draw function once
  drawGML(GML);

}


// expose some globals
function exposeGML(_GML) {

    // expose GML
    GML = _GML;

    // also expose the strokes
    strokes = GML.gml.tag.drawing.stroke;

    // strokes
    strokes = strokes instanceof Array ? strokes : [ strokes ];

    // bounding box
    if(GML.gml.tag.environment && GML.gml.tag.environment.screenBounds) {
      bbox =  GML.gml.tag.environment.screenBounds;
    } else {
      bbox = { x : width, y : height};
    }

}


// print some info about the current GML file
function printGML(GML) {

    // meta data
    var id =  '"' + GML.id + '"';
    var user = GML.gml_username;
    var tags = join(getTags(GML), ' ');
    println('Downloaded GML', id, 'by', user, tags);

    // environment (gobal)
    println('Bounding Box: ', bbox);

    // stroke data (global)
    println('Strokes', strokes);

}


function drawGML(GML) {

  // dimensions of the canvas excluding the borders
  var w1 = width - 2 * xgap;
  var h1 = height - 2 * ygap;

  // keep original aspect ratio
  var aspect = bbox.x / bbox.y;
  var h = min(h1, w1 / aspect);
  var w = min(w1, h1 * aspect);

  // corner coordinates
  var xmin = width/2 - w/2;
  var xmax = width/2 + w/2;
  var ymin = height/2 - h/2;
  var ymax = height/2 + h/2;

  // black background
  background(0);

  // draw all the strokes
  for(var i = 0; i < strokes.length; i++) {

    // get all the points of the current stroke
    var points = strokes[i].pt;

    // draw bounding box
    noFill();
    stroke(100);
    strokeWeight(1);

    fill(255, 3);
    rectMode(CORNERS);
    rect(xmin, ymin, xmax, ymax);

    // pick stroke style
    noFill();
    stroke(255);
    strokeWeight(5);

    // draw the stroke
    beginShape();
    for(var j = 0;  j < points.length; j++) {

      var p =  points[j];

      var x = map( p.x, 0, 1, xmin, xmax);
      var y = map( p.y, 0, 1, ymin, ymax);

      // different up-vector
      //var x = map(p.y, 0, 1, xmin, xmax);
      //var y = map(p.x, 1, 0, ymin, ymax);

      vertex(x, y);
    }
    endShape();

  }

}


// tags are the new keywords :)
// this funciton returns an array of hashtags ...
function getTags(GML) {

  if (!GML.gml_keywords) {

    return [];

  } else {

    // use the p5.js split and trim functions, to extract the keywords
    var keywords = trim(split(GML.gml_keywords, ','));

    // functions are first class citizens in javascript ...
    var hashtag = function(s) {
      return '#' + s.replace(' ', '_');
    };

    // using Array.map to apply a function to all elements of an array
    return keywords.map( hashtag );

  }

}
