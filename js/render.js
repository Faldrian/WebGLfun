var gl = null; // WebGL context

// Store scene-related data and handles
var scene = {
  // shader
  shaderProgram : null,
  vertexPositionAttribute: null,

  // vertices
  squareVerticesBuffer: null,

  // matrices for view and positions
  perspectiveMatrix: null,
  mvMatrix: null,

  // scene variables
  rotation: 0

};

function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);
  // Initialisierung des WebGL Kontextes

  // Es geht nur weiter, wenn WebGl verfügbar ist.

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
    initScene();

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

  // Add shader to scene
  scene.shaderProgram = shaderProgram;
  scene.vertexPositionAttribute = vertexPositionAttribute;
}


function initBuffers() {
  scene.squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, scene.squareVerticesBuffer);

  // var vertices = [
    // 1.0,  1.0,  0.0,
    // -1.0, 1.0,  0.0,
    // 1.0,  -1.0, 0.0,
    // -1.0, -1.0, 0.0
  // ];

  var vertices = torus.create(200, 0.35, 2, 5);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function initScene() {
  // perspective
  scene.perspectiveMatrix = mat4.create();
  mat4.perspective(scene.perspectiveMatrix, 45, 640.0/480.0, 0.1, 100.0);

  // prepare object position
  scene.mvMatrix = mat4.create(); // init with identity
  mat4.translate(scene.mvMatrix, scene.mvMatrix, [-0.0, 0.0, -6.0]);
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

  // load object data
  gl.bindBuffer(gl.ARRAY_BUFFER, scene.squareVerticesBuffer);
  gl.vertexAttribPointer(scene.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  // draw object
  gl.drawArrays(gl.LINE_STRIP, 0, 201);
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