var gl = null; // WebGL context

// Store scene-related data and handles
var scene = {
  // shader
  shaderProgram : null,
  vertexPositionAttribute: null,
  colorAttribute: null,

  // vertices
  squareVerticesBuffer: null,

  // matrices for view and positions
  perspectiveMatrix: null,
  mvMatrix: null,

  // scene variables
  rotation: 0,
  numVertices: null

};

/**
 * Triggered on resize document
 */
function resize() {
  canvas = document.getElementById('glcanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // resize rendering area if gl is loaded
  if(gl) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    initScene(canvas.width, canvas.height);
  }
}

function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);
  // Initialisierung des WebGL Kontextes

  // adjust canvas size
  resize();

  if (gl) {
    // Setzt die Farbe auf Schwarz, vollständig sichtbar
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Lösche alles, um die neue Farbe sichtbar zu machen
    gl.clearDepth(1.0);

    // Aktiviere Tiefentest
    gl.enable(gl.DEPTH_TEST);

    // Nähere Objekte verdecken entferntere Objekte
    gl.depthFunc(gl.LEQUAL);

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.

    initShaders();

    // Here's where we call the routine that builds all the objects
    // we'll be drawing.

    initBuffers();

    // Here we will set up additional scene data
    initScene(canvas.width, canvas.height);

    // Set up to draw the scene periodically.

    setInterval(drawScene, 15);
  }
}


function initWebGL() {
  try {
    gl = canvas.getContext("experimental-webgl");
  } catch(e) {
  }

  // Wenn wir keinen WebGl Kontext haben
  if (!gl) {
    alert("WebGL konnte nicht initialisiert werden.");
  }
}


function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // Create Shader
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Throw error if linking fails
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Initialisation of shaderProgram failed.");
  }

  gl.useProgram(shaderProgram);

  var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  var colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");
  gl.enableVertexAttribArray(colorAttribute);

  // Add shader to scene
  scene.shaderProgram = shaderProgram;
  scene.vertexPositionAttribute = vertexPositionAttribute;
  scene.colorAttribute = colorAttribute;
}


function initBuffers() {
  var torusArr = torus.create(200, 0.35, 2, 5);
  var vertices = torusArr[0];
  var colors = torusArr[1];

  scene.numVertices = vertices.length; // for drawing...

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.colorAttribute, 4, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // prepare object position
  scene.mvMatrix = mat4.create(); // init with identity
  mat4.translate(scene.mvMatrix, scene.mvMatrix, [-0.0, 0.0, -6.0]);
}

function initScene(width, height) {
  // perspective
  scene.perspectiveMatrix = mat4.create();
  mat4.perspective(scene.perspectiveMatrix, 45, width / height, 0.1, 100.0);
}


function drawScene() {
  // let time pass in the scene
  updateScene();

  // clear drawing area
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // load perspective- and MV-matrix
  var pUniform = gl.getUniformLocation(scene.shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, scene.perspectiveMatrix);

  var mvUniform = gl.getUniformLocation(scene.shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, scene.mvMatrix);



  // draw object
  gl.drawArrays(gl.TRIANGLES, 0, scene.numVertices / 3);
}

function updateScene() {
  mat4.rotateX(scene.mvMatrix, scene.mvMatrix, 0.01);
  mat4.rotateZ(scene.mvMatrix, scene.mvMatrix, 0.03);
  mat4.rotateY(scene.mvMatrix, scene.mvMatrix, 0.02);
}


function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  var shader;

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unbekannter Shadertyp
  }

  gl.shaderSource(shader, theSource);

  // Kompiliere das Shaderprogramm
  gl.compileShader(shader);

  // Überprüfe, ob die Kompilierung erfolgreich war
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("Es ist ein Fehler beim Kompilieren der Shader aufgetaucht: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


// let the fun begin!
document.addEventListener("DOMContentLoaded", start);
window.addEventListener("resize", resize);

