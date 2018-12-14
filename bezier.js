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

var canvas = document.getElementById('canvas');
var drawButton = document.getElementById('drawButton');
var ctx = canvas.getContext('2d');
console.log(ctx);

var controlPoints = []
var iterations = 1000;

canvas.addEventListener('click', function(){
  const x = event.offsetX;
  const y = event.offsetY;
  drawPoint(x, y);
  console.log('Click on ('+x+', '+y+')')
  controlPoints.push(new Point(x, y));
})

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawPoint(a, b) {
  ctx.moveTo(a.x, a.y);
  ctx.arc(a, b, 4, 0, Math.PI*2);
  ctx.stroke();
}

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

function drawCurve(controlPoints, iterations) {
  var curvePoints = []
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var i = 0; i <= iterations; i++) {
    curvePoints.push(deCasteljeu(controlPoints, i/iterations));
  }
  for(var i = 0; i < iterations; i++) {
    drawLine(curvePoints[i], curvePoints[i+1]);
  }
}

drawButton.addEventListener('click', function() {
  drawCurve(controlPoints, iterations);
})
