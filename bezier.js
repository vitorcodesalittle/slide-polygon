class Point {
  constructor(x, y) {
    this.x = x; this.y = y;
  }

  add(b) {
    return new Point(this.x + b.x, this.y + b.y);
  }

  sub(b) {
    return new Point(this.x - b.x, this.y - b.y);
  }

  dot(b) {
    return new Point(this.x * b.x + thix.y + b.y);
  }

  len() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  scalar(k) {
    return new Point(this.x*k, this.y*k);
  }

  toString() {
    return "("+String(this.x)+", "+String(this.y)+")";
  }

  rotateAsVector(teta) {
    return new Point(this.x*Math.cos(teta) - this.y*Math.sin(teta), this.x*Math.sin(teta) + this.y*Math.cos(teta));
  }

  rotateAsPoint(rotationCenter, teta) {
    // translate to new system
    var p = new Point(this.x - rotationCenter.x, this.y - rotationCenter.y);
    // rotate in new system
    p = this.rotateAsVector(teta);
    // translate to old system
    p = p.add(rotationCenter);
    return p;
  }
}

class Polygon {
  constructor(sides, center) {
    this.center = center;
    this.sides = sides;
    console.log(orientation);
    this.up = orientation.scalar(radius); // orientation defines the first vertex angle
    console.log(this.up);
    this.points = [];
    this.points.push(this.center.add(this.up));
    var rotation = 2*Math.PI/this.sides;

    for(var i = 1; i < this.sides; i++) {
      this.points.push(this.center.add(this.up.rotateAsVector(rotation*i)));
    }
  }

  has(p) {
    var foundIdx = -1;
    for(var i = 0; i < this.sides; i++) {
      if(this.points[i].sub(p).len() <= 5) {
        foundIdx = i;
        break;
      }
    }
    return foundIdx;
  }

  rotate(teta) {
    this.points = this.points.map(function( cur ) {
      return cur.rotateAsPoint(this.center, teta);
    });
  }
}


 // elements
var canvas = document.getElementById('canvas');
var drawButton = document.getElementById('drawButton');
var toggleControlPoints = document.getElementById('toggleControlPoints');
var toggleControlPolygon = document.getElementById('toggleControlPolygon');
var toggleBezierCurve = document.getElementById('toggleBezierCurve');
var clearPoints = document.getElementById('clearPoints');
var rangeInput = document.getElementById('rangeInput');
var polygonSizeInput = document.getElementById('polygonSize');
var iterationsInput = document.getElementById('iterations');
var radiusInput = document.getElementById('radiusInput');
var orientationInput = document.getElementById('rotation')

var ctx = canvas.getContext('2d');

// user choices
var velocity = 50;
var polygonSize = 3;
var iterations = 300;
var showControlPoints = 1;
var showControlPolygon = 1;
var showBezierCurve = 1;
var radius = 40;
var orientation = new Point(0, 1);

var polygons = [];
var curvePoints = [];
var polygon = [];

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
function drawPoint(b) {
  ctx.moveTo(b.x, b.y);
  ctx.beginPath();
  ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
  ctx.stroke();
}


// Bezier Stuff
function deCasteljeu(controlPoints, t) {
  if(controlPoints.length == 1) {
    return controlPoints[0];
  }
  var intermediatePoints = [];
  for(var i = 0; i < controlPoints.length - 1; i++) {
    var b1 = controlPoints[i].scalar(1-t);
    var b2 = controlPoints[i+1].scalar(t);
    var c = b1.add(b2);
    intermediatePoints.push(c);
  }
  return deCasteljeu(intermediatePoints, t);
}

function getCurvePoints(iterations) {
  curvePoints = new Array(polygonSize);
  controlPoints = new Array(polygonSize);

  for(var i = 0; i < polygonSize; i++) {
    curvePoints[i] = new Array();
    controlPoints[i] = new Array(polygons.length);
    for(var j = 0; j < polygons.length; j++) {
      controlPoints[i][j] = polygons[j].points[i];
    }
  }
  var drawsInIteration = Math.ceil(700/iterations);
  for(var i = 0; i < iterations; i++) {
    for(var j = 0; j < polygonSize; j++) {
      var begin = deCasteljeu(controlPoints[j], i/iterations);
      var end = deCasteljeu(controlPoints[j], (i+1)/iterations);
      var seg = end.sub(begin);
      for(var k = 0; k < drawsInIteration; k++) {
        curvePoints[j].push(begin.add(seg.scalar(k/drawsInIteration)));
      }
    }
  }

}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(showControlPoints) {
    for(var i = 0; i < polygons.length; i++) {
      polygons[i].points.forEach( function(cur) {
        drawPoint(cur);
      })
    }
  }
  if(showControlPolygon) {
    for(var i = 0; i < polygons.length - 1; i++) {
      for(var j = 0; j < polygonSize; j++) {
        drawLine(polygons[i].points[j], polygons[i+1].points[j])
      }
    }
  }
  if(showBezierCurve) {
    for(var i = 0; i < polygonSize; i++) {
      for(var j = 0; curvePoints.length > 0 && j < curvePoints[0].length-1; j++) {
        drawLine(curvePoints[i][j], curvePoints[i][j+1]);
      }
    }
  }
  if(polygon.length > 0) {
    for(var j = 0; j < polygonSize; j++) {
      drawLine(polygon[j], polygon[(j+1)%polygonSize]);
    }
  }
}

function polygonTransformation() {
  /*
  considere 5 segundos o tempo da transf. completa do polígono
  para suavizar a transf. com um número arbitrário de iterações (definido pelo usuário),
  desenhamos o polígono deslocando sobre o seg. de reta (D) entre dois pontos de uma curva, parametrizando
  o deslocamento a partir da razão len(D)/sum(len(D[0]) + ... + len(D[iterations-1])), cujo valor é obtido em O(1) durante o desenho.
  */

  var i = 0;
  console.log(velocity);
  setInterval(function() {
    if(i >= curvePoints[0].length) {
      return;
    }
    polygon = new Array(polygonSize);
    for(var j = 0; j < polygonSize; j++) {
      polygon[j] = curvePoints[j][i];
    }
    draw();
    i+=1;
  }, 5000/curvePoints[0].length);
  
}

// Interface
var move = 0;
var polygonIdx;
var pointIdx;

canvas.addEventListener('mousemove', function(event) {
  if(move) {
    var newpos = new Point(event.offsetX, event.offsetY);
    polygons[polygonIdx].points[pointIdx] = newpos;
    draw();
  }
})
canvas.addEventListener('mousedown', function(){
  const x = event.offsetX;
  const y = event.offsetY;
  const p = new Point(x, y);
  selectedPoint = null;
  for(var i = 0; i < polygons.length; i++) {
    pointIdx = polygons[i].has(p);
    if(pointIdx != -1) {
      polygonIdx = i;
      selectedPoint = polygons[polygonIdx].points[pointIdx];
      break;
    }
  }
  if(!selectedPoint) {
    if(polygons.length > 0 && polygons[0].sides != polygonSize) {
      alert('Polygons must have same size');
      return;
    }
    var pol = new Polygon(polygonSize, p);
    polygons.push(pol);
    if(polygons.length>2) {
      getCurvePoints(iterations);
    }
    draw();
  } else {
    move = 1;
  }
  draw();
})
canvas.addEventListener('mouseup', function() {
  move = 0;
  if(polygons.length > 2) getCurvePoints(iterations);
  draw();
})
canvas.addEventListener('scroll', () => {
  console.log('oi');
})
drawButton.addEventListener('click', function() {
  // getCurvePoints(iterations);
  // draw();
  polygonTransformation();
})
toggleControlPoints.addEventListener('click', function() {
  showControlPoints = 1 - showControlPoints;
  draw();
})
toggleControlPolygon.addEventListener('click', function() {
  showControlPolygon = 1 - showControlPolygon;
  draw();
})
toggleBezierCurve.addEventListener('click', function() {
  showBezierCurve = 1 - showBezierCurve;
  draw();
})

clearPoints.addEventListener('click', function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  polygons = [];
  curvePoints = [];
})
rangeInput.addEventListener('change', function(event) {
  velocity = event.target.value;
})
polygonSizeInput.addEventListener('change', function(event){
  polygonSize = event.target.value;
})
iterationsInput.addEventListener('change', function(event){
  iterations = event.target.value;
})
radiusInput.addEventListener('change', function() {
  radius = event.target.value;
})
orientationInput.addEventListener('change', function() {
  console.log(event.target.value);
  orientation = orientation.rotateAsVector(event.target.value*2*Math.PI/100);
})