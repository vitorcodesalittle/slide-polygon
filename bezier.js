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
}

/**
O que falta fazer?
• O sistema deve ser interativo, permitindo inserir, modificar e deletar os
pontos de controle.
• A atualização da curva é feita em tempo real.
• O programa deve ter botões para esconder/exibir: pontos de controle,
poligonal de controle, curva de Bézier.
 */

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

// user choices
var velocity = 50;
var polygonSize = 3;
var iterations = 300;
var showControlPoints = 1;
var showControlPolygon = 1;
var showBezierCurve = 1;

var ctx = canvas.getContext('2d');
console.log('Object to draw on canvas:', ctx);

var controlPoints = [];
var curvePoints = []
// Drawing on canvas:
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

function getCurvePoints(controlPoints, iterations) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  controlPoints.forEach(function( b ) {
    drawPoint(b);
  })
  for(var i = 0; i <= iterations; i++) {
    curvePoints.push(deCasteljeu(controlPoints, i/iterations));
  }
  for(var i = 0; i < iterations; i++) {
    drawLine(curvePoints[i], curvePoints[i+1]);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if(showControlPoints) {
    for(var i = 0; i < controlPoints.length; i++) {
      drawPoint(controlPoints[i]);
    }
  }
  if(showControlPolygon) {
    for(var i = 0; i < controlPoints.length - 1; i++) {
      drawLine(controlPoints[i], controlPoints[i+1]);
    }
  }
  if(showBezierCurve) {
    for(var i = 0; i < curvePoints.length; i++) {
      drawLine(curvePoints[i], curvePoints[i+1]);
    }
  }
}


// Interface
canvas.addEventListener('click', function(){
  const x = event.offsetX;
  const y = event.offsetY;
  const p = new Point(x, y);
  console.log('Click on ('+x+', '+y+')')
  var minD = 10000;
  for(var i = 0; i < controlPoints.length; i++) {
    var deslocVector = controlPoints[i].sub(p);
    var dist = deslocVector.len();
    minD = (minD < dist)? minD: dist;
    if(deslocVector.len() <= 5) {
      controlPoints.splice(i, 1);
      draw();
      return;
    }
  }
  console.log('menor distancia', minD);
  controlPoints.push(new Point(x, y));
  draw();
})
drawButton.addEventListener('click', function() {
  getCurvePoints(controlPoints, iterations);
  draw();
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
  console.log('Buttons cleared')
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  controlPoints = []
})
rangeInput.addEventListener('change', function(event) {
  console.log("Velocity is now " + event.target.value);
  velocity = event.target.value;
})
polygonSizeInput.addEventListener('change', function(event){
  console.log("Polygon size is now " + event.target.value);
  polygonSize = event.target.value;
})
iterationsInput.addEventListener('change', function(event){
  console.log("Iterations is now " + event.target.value);
  iterations = event.target.value;
})
