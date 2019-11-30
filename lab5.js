var gl;
var shaderProgram;

var zCameraPos = 10;
var horizontalAngle = 0;
var verticalAngle = 0;
var rotationSpeed = 4;
var ly = 0;
var lx = 0;
var lz = 0;
var xAngle = 0;
var yAngle = 0;
var zAngle = 0;
var cubeScale = 1;
var level = 1;
var lastXRotate = 0;
var lastYRotate = 0;
var lastYRotate = 0;
var pitch = 0;
var yaw = 0;
var roll = 0;

// set up the parameters for lighting
var light_ambient = [0, 0, 0, 1];
var light_diffuse = [0.8, 0.8, 0.8, 1];
var light_specular = [1, 1, 1, 1];
var light_pos = [lx, ly, lz, 1]; // eye space position

var mat_ambient = [1, 1, 1, 1];
var mat_diffuse = [0, 0, 1, 1];
var mat_specular = [0.9, 0.9, 0.9, 1];
var mat_shine = [100];

//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {}
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var squareVertexPositionBuffer;
var squareVertexNormalBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;

var cylinderVertexPositionBuffer;
var cylinderVertexNormalBuffer;
var cylinderVertexColorBuffer;
var cylinderVertexIndexBuffer;

var sphereVertexPositionBuffer;
var sphereVertexNormalBuffer;
var sphereVertexColorBuffer;
var sphereVertexIndexBuffer;

var susanVertexPositionBuffer;
var susanVertexNormalBuffer;
var susanVertexColorBuffer;
var susanVertexIndexBuffer;

var cyverts = [];
var cynormals = [];
var cycolors = [];
var cyindicies = [];

var data;
var susanVertices = [];
var susanColors = [];
var susanIndices = [];
var susanNormals = [];

function initJSON() {
  var request = new XMLHttpRequest();
  request.open("GET", "https://kiefergarrett.github.io/WebGL_Lab5/Susan.json");
  request.onreadystatechange =
    function() {
      if (request.readyState == 4) {
        console.log("state = " + request.readyState);
        data = JSON.parse(request.responseText);

        susanVertices = data.meshes[0].vertices;
        susanColors = data.meshes[0].colors[0];
        susanIndices = [].concat.apply([], data.meshes[0].faces);
        susanNormals = data.meshes[0].normals;

        initSusanBuffer();

      }
    };
  request.send();
}

function initSusanBuffer() {

  susanVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);
  susanVertexPositionBuffer.itemSize = 3;
  susanVertexPositionBuffer.numItems = susanVertices.length/3;

  susanVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW);
  susanVertexNormalBuffer.itemSize = 3;
  susanVertexNormalBuffer.numItems = susanNormals.length / 3;

  susanVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);
  susanVertexIndexBuffer.itemSize = 1;
  susanVertexIndexBuffer.numItems = susanIndices.length;

  susanVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanColors), gl.STATIC_DRAW);
  susanVertexColorBuffer.itemSize = 4;
  susanVertexColorBuffer.numItems = susanColors.length/4;

  console.log("Loaded");

}

function InitCylinder(nslices, nstacks) {
  var Dangle = 2 * Math.PI / (nslices - 1);

  for (j = 0; j < nstacks; j++)
    for (i = 0; i < nslices; i++) {
      var idx = j * nslices + i; // mesh[j][i]
      var angle = Dangle * i;
      cyverts.push(Math.cos(angle));
      cyverts.push(Math.sin(angle));
      cyverts.push(j * 3.0 / (nstacks - 1) - 1.5);

      cynormals.push(Math.cos(angle));
      cynormals.push(Math.sin(angle));
      cynormals.push(0.0);

      cycolors.push(Math.cos(angle));
      cycolors.push(Math.sin(angle));
      cycolors.push(j * 1.0 / (nstacks - 1));
      cycolors.push(1.0);
    }
  // now create the index array

  nindices = (nstacks - 1) * 6 * (nslices + 1);

  for (j = 0; j < nstacks - 1; j++)
    for (i = 0; i <= nslices; i++) {
      var mi = i % nslices;
      var mi2 = (i + 1) % nslices;
      var idx = (j + 1) * nslices + mi;
      var idx2 = j * nslices + mi; // mesh[j][mi]
      var idx3 = (j) * nslices + mi2;
      var idx4 = (j + 1) * nslices + mi;
      var idx5 = (j) * nslices + mi2;
      var idx6 = (j + 1) * nslices + mi2;

      cyindicies.push(idx);
      cyindicies.push(idx2);
      cyindicies.push(idx3);
      cyindicies.push(idx4);
      cyindicies.push(idx5);
      cyindicies.push(idx6);
    }
}

function initCYBuffers() {

  var nslices = 100;
  var nstacks = 50;
  InitCylinder(nslices, nstacks);

  cylinderVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cyverts), gl.STATIC_DRAW);
  cylinderVertexPositionBuffer.itemSize = 3;
  cylinderVertexPositionBuffer.numItems = nslices * nstacks;

  cylinderVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cynormals), gl.STATIC_DRAW);
  cylinderVertexNormalBuffer.itemSize = 3;
  cylinderVertexNormalBuffer.numItems = nslices * nstacks;

  cylinderVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cyindicies), gl.STATIC_DRAW);
  cylinderVertexIndexBuffer.itemsize = 1;
  cylinderVertexIndexBuffer.numItems = (nstacks - 1) * 6 * (nslices + 1);

  cylinderVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cycolors), gl.STATIC_DRAW);
  cylinderVertexColorBuffer.itemSize = 4;
  cylinderVertexColorBuffer.numItems = nslices * nstacks;

}

var sphereVerts = [];
var sphereNormals = [];
var sphereColors = [];
var sphereIndices = [];

function InitSphere(nslices, radius) {

  for (var i = 0; i <= nslices; i++) {
    var theta = i * Math.PI / nslices;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var j = 0; j <= nslices; j++) {
      var phi = j * 2 * Math.PI / nslices;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;


      sphereVerts.push(radius * x);
      sphereVerts.push(radius * y);
      sphereVerts.push(radius * z);

      sphereNormals.push(x);
      sphereNormals.push(y);
      sphereNormals.push(z);

      sphereColors.push(radius * x);
      sphereColors.push(radius * y);
      sphereColors.push(radius * z);
      sphereColors.push(1.0);
    }
  }

  for (var i = 0; i < nslices; i++) {
    for (var j = 0; j < nslices; j++) {
      var v1 = (i * (nslices + 1)) + j;
      var v2 = v1 + nslices + 1;

      sphereIndices.push(v1);
      sphereIndices.push(v2);
      sphereIndices.push(v1 + 1);

      sphereIndices.push(v2);
      sphereIndices.push(v2 + 1);
      sphereIndices.push(v1 + 1);
    }
  }

}

function InitSphereBuffers() {

  var nslices = 100;
  InitSphere(nslices, 1.5);

  sphereVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVerts), gl.STATIC_DRAW);
  sphereVertexPositionBuffer.itemSize = 3;
  sphereVertexPositionBuffer.numItems = nslices * nslices;

  sphereVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals), gl.STATIC_DRAW);
  sphereVertexNormalBuffer.itemSize = 3;
  sphereVertexNormalBuffer.numItems = nslices * nslices;

  sphereVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
  sphereVertexIndexBuffer.itemsize = 1;
  sphereVertexIndexBuffer.numItems = (nslices - 1) * 6 * (nslices + 1);

  sphereVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereColors), gl.STATIC_DRAW);
  sphereVertexColorBuffer.itemSize = 4;
  sphereVertexColorBuffer.numItems = nslices * nslices;

}

////////////////    Initialize VBO  ////////////////////////

function initCubeBuffers() {

  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  var vertices = [
    // Top
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    // Left
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,

    // Right
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,

    // Front
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,

    // Bottom
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, -1.0, -1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 24;

  squareVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
  var normals = [
    // Top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  squareVertexNormalBuffer.itemSize = 3;
  squareVertexNormalBuffer.numItems = 24;


  var indices = [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];
  squareVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  squareVertexIndexBuffer.itemsize = 1;
  squareVertexIndexBuffer.numItems = 36;

  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  var colors = [
    // Top
    0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,

    // Left
    0.75, 0.25, 0.5, 1.0,
    0.75, 0.25, 0.5, 1.0,
    0.75, 0.25, 0.5, 1.0,
    0.75, 0.25, 0.5, 1.0,

    // Right
    0.25, 0.25, 0.75, 1.0,
    0.25, 0.25, 0.75, 1.0,
    0.25, 0.25, 0.75, 1.0,
    0.25, 0.25, 0.75, 1.0,

    // Front
    1.0, 0.0, 0.15, 1.0,
    1.0, 0.0, 0.15, 1.0,
    1.0, 0.0, 0.15, 1.0,
    1.0, 0.0, 0.15, 1.0,

    // Back
    0.0, 1.0, 0.15, 1.0,
    0.0, 1.0, 0.15, 1.0,
    0.0, 1.0, 0.15, 1.0,
    0.0, 1.0, 0.15, 1.0,

    // Bottom
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 24;
}

function initBuffers() {

  initSusanBuffer();
  initCubeBuffers();
  initCYBuffers();
  InitSphereBuffers();

}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

function setMatrixUniforms(matrix) {
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, matrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function PushMatrix(stack, matrix) {
  var copy = mat4.create();
  mat4.set(matrix, copy);
  stack.push(copy);
}

function PopMatrix(stack) {
  if (stack.length == 0) {
    throw "Invalid popMatrix!";
  }
  var copy = stack.pop();
  return copy;
}


function drawSphere(matrix) {
  var mat_diffuse = [0, 1, 1, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, sphereVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);

  gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

function drawCube(matrix) {
  var mat_diffuse = [1, 0, 1, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

  gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawCylinder(matrix) {
  var mat_diffuse = [0, 0, 1, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader

  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cylinderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cylinderVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cylinderVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderVertexIndexBuffer);

  gl.drawElements(gl.TRIANGLES, cylinderVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

function drawSusan(matrix) {
  var mat_diffuse = [0, 0, 1, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader

  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, susanVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, susanVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, susanVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, susanVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanVertexIndexBuffer);

  gl.drawElements(gl.TRIANGLES, susanVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

var vMatrix = mat4.create(); // view matrix
var mMatrix = mat4.create();
var mMatrix1 = mat4.create(); // model matrix
var mMatrix2 = mat4.create();
var mMatrix3 = mat4.create();
var pMatrix = mat4.create(); //projection matrix
var nMatrix = mat4.create(); // normal matrix
var Z_angle = 0.0;

///////////////////////////////////////////////////////////////

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix); // set up the projection matrix
  vMatrix = mat4.lookAt([0, 0, 10], [yaw, pitch, 0], [0, 1, 0], vMatrix); // set up the view matrix
  vMatrix = mat4.rotate(vMatrix, degToRad(roll), [0, 0, 1]);

  var model = mat4.create();
  mat4.identity(model);
  model = mat4.multiply(model, mMatrix);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, model);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSusan(model);

  model = mat4.multiply(model, mMatrix1);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, model);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSphere(model);
  //
  // model = mat4.multiply(model, mMatrix2);
  //
  // mat4.identity(nMatrix);
  // nMatrix = mat4.multiply(nMatrix, vMatrix);
  // nMatrix = mat4.multiply(nMatrix, model);
  // nMatrix = mat4.inverse(nMatrix);
  // nMatrix = mat4.transpose(nMatrix);
  //
  // shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
  //
  // drawCube(model);

}


///////////////////////////////////////////////////////////////

function webGLStart() {
  var canvas = document.getElementById("code04-canvas");
  initGL(canvas);
  initShaders();
  initJSON();

  gl.enable(gl.DEPTH_TEST);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
  shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");
  shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
  shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
  shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

  shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");
  shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
  shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

  //initJSON();

  initBuffers();

  gl.clearColor(1, 1, 1, 1.0);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('keydown', onKeyDown, false);

  mat4.identity(mMatrix);
  mat4.identity(mMatrix1);
  mat4.translate(mMatrix1, [0, 0, 2]);
  // mat4.identity(mMatrix2);
  // mat4.translate(mMatrix2, [0, 0, -4]);

  drawScene();

  requestAnimationFrame(loop);
}

function BG(red, green, blue) {
  gl.clearColor(red, green, blue, 1.0);
  drawScene();
}

function redraw() {
  gl.clearColor(1, 1, 1, 1.0);
  Z_angle = 0;
  xAngle = 0;
  yAngle = 0;
  zAngle = 0;
  cubeScale = 1;
  document.getElementById('cubeScale').value = 0;
  document.getElementById('xRotate').value = 0;
  document.getElementById('yRotate').value = 0;
  document.getElementById('zRotate').value = 0;
  drawScene();
}

function Level1() {
  level = 1;
}

function Level2() {
  level = 2;
}

function Level3() {
  level = 3;
}

function redraw() {
  level = 1;
  roll = 0;
  yaw = 0;
  pitch = 0;

  drawScene();
}

function onKeyDown(event) {
  console.log(event.keyCode);
  switch (event.keyCode) {
    case 87:
      if (event.shiftKey) { // Foward
        console.log('enter W');
        lz = lz + 0.1;
        light_pos = [lx, ly, lz, 1];
      } else {
        console.log('enter w');
        lz = lz + 0.1;
        light_pos = [lx, ly, lz, 1];
      }
      break;
    case 83:
      if (event.shiftKey) { // Back
        console.log('enter S');
        lz = lz - 0.1;
        light_pos = [lx, ly, lz, 1];
      } else {
        console.log('enter s');
        lz = lz - 0.1;
        light_pos = [lx, ly, lz, 1];
      }
      break;
    case 65:
      if (event.shiftKey) { // Left
        console.log('enter A');
        lx = lx - 0.1;
        light_pos = [lx, ly, lz, 1];
      } else {
        console.log('enter a');
        lx = lx - 0.1;
        light_pos = [lx, ly, lz, 1];

      }
      break;
    case 68:
      if (event.shiftKey) { // Right
        console.log('enter D');
        lx = lx + 0.1;
        light_pos = [lx, ly, lz, 1];
      } else {
        console.log('enter d');
        lx = lx + 0.1;
        light_pos = [lx, ly, lz, 1];
      }
      break;
    case 81:
      if (event.shiftKey) { // UP
        console.log('enter Q');
        ly = ly + 0.1;
        light_pos = [lx, ly, lz, 1];
      } else {
        console.log('enter q');
        ly = ly + 0.1;
        light_pos = [lx, ly, lz, 1];
      }
      break;
    case 69:
      if (event.shiftKey) { // Down
        console.log('enter E');
        ly = ly - 0.1;
        light_pos = [lx, ly, lz, 1];

      } else {
        console.log('enter e');
        ly = ly - 0.1;
        light_pos = [lx, ly, lz, 1];
      }
      break;
    case 80: // Pitch
      if (event.shiftKey) {
        console.log('enter P');
        pitch = pitch + 0.5;
      } else {
        console.log('enter p');
        pitch = pitch - 0.5;
      }
      break;
    case 89: // Yaw
      if (event.shiftKey) {
        console.log('enter Y');
        yaw = yaw - 0.5;
      } else {
        console.log('enter y');
        yaw = yaw + 0.5;

      }
      break;
    case 82: // Roll
      if (event.shiftKey) {
        console.log('enter R');
        roll = roll + 0.5;
      } else {
        console.log('enter r');
        roll = roll - 0.5;
      }
      break;
  }
  drawScene();
}

/**
 * Removes all mouse listeners when the mouse is not clicked.
 */
function onDocumentMouseUp(event) {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
  document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

/**
 * Removes mouse listeners when mouse leaves the canvas.
 */
function onDocumentMouseOut(event) {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
  document.removeEventListener('mouseout', onDocumentMouseOut, false);
}


/**
 * Sets the event listeners on mouse down.
 */
function onDocumentMouseDown(event) {
  event.preventDefault();
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);
  document.addEventListener('mouseout', onDocumentMouseOut, false);
  var mouseX = event.clientX;
  var mouseY = event.clientY;

  lastMouseX = mouseX;
  lastMouseY = mouseY;

}

var loop = function () {

    mMatrix = mat4.rotate(mMatrix, degToRad(1), [0,1,0]);

    drawScene();

		requestAnimationFrame(loop);

	};

/**
 * Calculates the mouse displacement on mouse move.
 */
function onDocumentMouseMove(event) {
  var mouseX = event.clientX;
  var mouseY = event.ClientY;
  var diffX = mouseX - lastMouseX;
  var diffY = mouseY - lastMouseY;

  Z_angle = diffX / 5;

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  if (level == 1) {
    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle), [0, 1, 1]); // now set up the model matrix
  } else if (level == 2) {
    mMatrix1 = mat4.rotate(mMatrix1, degToRad(Z_angle), [0, 1, 1]); // now set up the model matrix
  } else if (level == 3) {
    mMatrix2 = mat4.rotate(mMatrix2, degToRad(Z_angle), [0, 1, 1]); // now set up the model matrix
  }

  drawScene();
}
