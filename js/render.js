var gl = null; // WebGL context

// Store scene-related data and handles (will be filled further along initialisation)
var scene = {
  // shader
  shaderProgram : null,

  // textures
  textureRust: null,
  textureCracks: null,
  
  // lights
  lights: {
    uLightSourcePosition0: vec3.fromValues(0, 0, 0)
  },

  // matrices for view and positions
  perspectiveMatrix: mat4.create(), // init with identity,
  translationMatrix: mat4.create(),
  mvMatrix: mat4.create(),
  normalMatrix: mat3.create(),

  // scene variables
  rotation: 0,
  uBumpPosition: vec3.create(),
  numVertices: null,
  bumpPhi: 0,
  flashActiveColor: vec4.fromValues(0.2, 1.0, 0.2, 1),
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
  canvas.addEventListener("click", function() {
    if(canvas.requestFullScreen) {
      canvas.requestFullScreen();
    } else if(canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen();
    } else if(canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    }
  });

  initWebGL(canvas);
  // Initialisierung des WebGL Kontextes

  // adjust canvas size
  resize();

  if (gl) {
    // clear screen to solid black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // nearer objects overwrite distant objects
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    initShaders();

    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    initBuffers();
    
    // Here we will load out textures
    initTexture();

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

  // Complain about not having webGL context
  if (!gl) {
    alert("WebGL could not be initialized.");
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

  var aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(aVertexPosition);

  var aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(aTextureCoord);
  
  var aNormal = gl.getAttribLocation(shaderProgram, "aNormal");
  gl.enableVertexAttribArray(aNormal);
  
  // Save variable pointers
  shaderProgram.aVertexPosition = aVertexPosition;
  shaderProgram.aTextureCoord = aTextureCoord;
  shaderProgram.aNormal = aNormal;
  
  shaderProgram.uPMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.uMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.uNMatrix = gl.getUniformLocation(shaderProgram, "uNMatrix");
  
  shaderProgram.uLightSourcePosition0 = gl.getUniformLocation(shaderProgram, "uLightSourcePosition0");
  shaderProgram.uBumpPosition = gl.getUniformLocation(shaderProgram, "uBumpPosition");
  shaderProgram.uFlashColor = gl.getUniformLocation(shaderProgram, "uFlashColor");
  
  shaderProgram.uSamplerBase = gl.getUniformLocation(shaderProgram, "uSamplerBase");
  shaderProgram.uSamplerCracks = gl.getUniformLocation(shaderProgram, "uSamplerCracks");

  // Add shader to scene
  scene.shaderProgram = shaderProgram;
}


function initBuffers() {
  var torusArr = torus.create(200, 0.35, 2, 5);
  var vertices = torusArr[0];
  var texturecoordinates = torusArr[1];
  var normals = torusArr[2];

  scene.numVertices = vertices.length; // for drawing...

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturecoordinates), gl.STATIC_DRAW);
  
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(scene.shaderProgram.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

function initTexture() {
  scene.textureRust = loadTexture("img/rust.jpg");
  scene.textureCracks = loadTexture("img/cracks.jpg");
}

function loadTexture(textureUrl) {
  var tex = gl.createTexture();
  tex.image = new Image();
  tex.image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  
  // start loading
  tex.image.src = textureUrl;
  
  return tex;
}


function initScene(width, height) {
  // perspective
  mat4.perspective(scene.perspectiveMatrix, 45, width / height, 0.1, 100.0);
  
  // create translation Matrix
  scene.translationMatrix = mat4.create(); // so we start at identity again
  mat4.translate(scene.translationMatrix, scene.translationMatrix, [-0.0, 0.6, -6.0]);
  
  // do other stuff there, no duplicate code
  updateScene();
}


function updateScene() {
  // rotate scene
  mat4.rotateX(scene.mvMatrix, scene.translationMatrix, - Math.PI / 4);
  mat4.rotateZ(scene.mvMatrix, scene.mvMatrix, -0.002 * scene.rotation++);
  
  
  // create normalmatrix from mvmatrix
  mat3.normalFromMat4(scene.normalMatrix, scene.mvMatrix);
  
  // move the bump
  scene.uBumpPosition = torus.torusCurve(2, 5, scene.bumpPhi += 0.01);
}


function drawScene() {
  // let time pass in the scene
  updateScene();

  // clear drawing area
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // load perspective- and MV-matrix
  gl.uniformMatrix4fv(scene.shaderProgram.uPMatrix, false, scene.perspectiveMatrix);
  gl.uniformMatrix4fv(scene.shaderProgram.uMVMatrix, false, scene.mvMatrix);
  gl.uniformMatrix3fv(scene.shaderProgram.uNMatrix, false, scene.normalMatrix);
    
  // load texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, scene.textureRust);
  gl.uniform1i(scene.shaderProgram.uSamplerBase, 0); //textture0
  
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, scene.textureCracks);
  gl.uniform1i(scene.shaderProgram.uSamplerCracks, 1); //textture1


  // load light
  gl.uniform3fv(scene.shaderProgram.uLightSourcePosition0, scene.lights.uLightSourcePosition0);
  
  // supply bump position
  gl.uniform3fv(scene.shaderProgram.uBumpPosition, scene.uBumpPosition);
  
  // set flash color
  gl.uniform4fv(scene.shaderProgram.uFlashColor, scene.flashActiveColor);
  

  // draw object
  gl.drawArrays(gl.TRIANGLES, 0, scene.numVertices / 3);
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
    return null;  // unknown shadertype
  }

  gl.shaderSource(shader, theSource);

  // compile the shader
  gl.compileShader(shader);

  // check if compilation was successful
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("There was an error compiling the shader: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


// let the fun begin!
document.addEventListener("DOMContentLoaded", start);
window.addEventListener("resize", resize);
