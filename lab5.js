var gl;
var shaderProgram;

var cubeScale = 1;
var level = 1;

var pitch = 0;
var yaw = 0;
var roll = 0;

var use_texture = 2;
var witney_Texture = 1;
var wall_Texture = 1;

var reset = 0;
var draw_type = 2;

var brick = "https://kiefergarrett.github.io/WebGL_Lab5/brick.png";

var garrettPic = "https://kiefergarrett.github.io/WebGL_Lab5/garrett.jpg";
var olivePic = "https://kiefergarrett.github.io/WebGL_Lab5/olive.jpg";

var posx = "https://kiefergarrett.github.io/WebGL_Lab5/posx.jpg";
var posy = "https://kiefergarrett.github.io/WebGL_Lab5/posy.jpg";
var posz = "https://kiefergarrett.github.io/WebGL_Lab5/posz.jpg";
var negx = "https://kiefergarrett.github.io/WebGL_Lab5/negx.jpg";
var negy = "https://kiefergarrett.github.io/WebGL_Lab5/negy.jpg";
var negz = "https://kiefergarrett.github.io/WebGL_Lab5/negz.jpg";


// set up the parameters for lighting
var light_ambient = [0, 0, 0, 1];
var light_diffuse = [0.8, 0.8, 0.8, 1];
var light_specular = [1, 1, 1, 1];
var light_pos = [0, 0, 0, 1]; 

var mat_ambient = [0, 0, 0, 1];
var mat_diffuse = [1, 1, 0, 1];
var mat_specular = [0.9, 0.9, 0.9, 1];
var mat_shine = [50];

//////////// Buffer parameters /////////////////
var cubeVertexPositionBuffer;
var cubeVertexNormalBuffer;
var cubeVertexTexCoordsBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

var posxWallTexture;
var negxWallTexture;
var posyWallTexture;
var negyWallTexture;
var poszWallTexture;
var negzWallTexture;

var garrettTexture;
var oliveTexture;


/////////// Envornment Matrix Parameters ///////////////

var posxM = mat4.create();
var posyM = mat4.create();
var poszM = mat4.create();
var negxM = mat4.create();
var negyM = mat4.create();
var negzM = mat4.create();

var witneyMatrix = mat4.create();

var myPortraitM = mat4.create();
var olivePortraitM = mat4.create();

var vMatrix = mat4.create(); // view matrix
var pMatrix = mat4.create(); //projection matrix
var nMatrix = mat4.create(); // normal matrix
var v2wMatrix = mat4.create(); // eye space to world space matrix

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

function webGLStart() {
  var canvas = document.getElementById("code04-canvas");
  initGL(canvas);
  initShaders();

  gl.enable(gl.DEPTH_TEST);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexCoords");
  gl.enableVertexAttribArray(shaderProgram.vertexTexCoordsAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
  shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");
  shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
  shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
  shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

  shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");
  shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
  shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

  shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
  shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");
  shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");

  initBuffers();

  brickTexture = texture2D(brick);
  
  garrettTexture = texture2D(garrettPic);
  oliveTexture = texture2D(olivePic);

  posxWallTexture = texture2D(posx);
  negxWallTexture = texture2D(negx);
  posyWallTexture = texture2D(posy);
  negyWallTexture = texture2D(negy);
  poszWallTexture = texture2D(posz);
  negzWallTexture = texture2D(negz);

  initCubeMap();

  gl.clearColor(1, 1, 1, 1.0);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('keydown', onKeyDown, false);

  mat4.identity(posxM);
  mat4.translate(posxM, [50, 0, 0]);
  mat4.rotate(posxM, degToRad(270), [0, 1, 0]);
  mat4.scale(posxM, [100, 100, 100]);

  mat4.identity(posyM);
  mat4.translate(posyM, [0, 50, 0]);
  mat4.rotate(posyM, degToRad(270), [1, 0, 0]);
  mat4.rotate(posyM, degToRad(180), [0, 1, 0]);
  mat4.scale(posyM, [100, 100, 100]);

  mat4.identity(poszM);
  mat4.translate(poszM, [0, 0, 50]);
  mat4.rotate(poszM, degToRad(180), [0, 1, 0]);
  mat4.scale(poszM, [100, 100, 100]);

  mat4.identity(negxM);
  mat4.translate(negxM, [-50, 0, 0]);
  mat4.rotate(negxM, degToRad(90), [0, 1, 0]);
  mat4.scale(negxM, [100, 100, 100]);

  mat4.identity(negyM);
  mat4.translate(negyM, [0, -50, 0]);
  mat4.rotate(negyM, degToRad(90), [1, 0, 0]);
  mat4.rotate(negyM, degToRad(180), [0, 1, 0]);
  mat4.scale(negyM, [100, 100, 100]);

  mat4.identity(negzM);
  mat4.translate(negzM, [0, 0, -50]);
  mat4.scale(negzM, [100, 100, 100]);

  mat4.identity(witneyMatrix);
  mat4.translate(witneyMatrix, [0, 0, -10]);
  mat4.rotate(witneyMatrix, degToRad(270), [1, 0, 0]);
  mat4.scale(witneyMatrix, [1,1,1]);

  mat4.identity(olivePortraitM);
  mat4.translate(olivePortraitM, [5, 0, 0]);
  mat4.rotate(olivePortraitM, degToRad(270), [0, 1, 0]);
  mat4.scale(olivePortraitM, [1,1,1]);

  mat4.identity(myPortraitM);
  mat4.translate(myPortraitM, [5, 0, -5]);
  mat4.rotate(myPortraitM, degToRad(270), [0, 1, 0]);
  mat4.scale(myPortraitM, [1,1,1]);

  drawScene();


  if (reset == 0) {
    requestAnimationFrame(loop);
  }
}

function initBuffers() {

  initSQBuffers();
  initCubeBuffers();
  initWitneyUmbBuffers();

}

function setMatrixUniforms(matrix) {
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, matrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);
  gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);
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

var texture2D = function(textureSource) {
  var texture;
  texture = gl.createTexture();
  texture.image = new Image();
  texture.image.crossOrigin = "anonymous";
  texture.image.onload = function() { handle2DTextureLoaded(texture); };
  texture.image.src = textureSource;
  console.log("loading texture....");
  return texture;
};

function handle2DTextureLoaded(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

var cubemapTexture;

function initCubeMap() {
    cubemapTexture = gl.createTexture();

    cubemapTexture.imagePosX = new Image();
    cubemapTexture.imageNegX = new Image();
    cubemapTexture.imagePosY = new Image();
    cubemapTexture.imageNegY = new Image();
    cubemapTexture.imagePosZ = new Image();
    cubemapTexture.imageNegZ = new Image();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    cubemapTexture.imagePosX.crossOrigin = "anonymous";
    cubemapTexture.imagePosX.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 0); };
    cubemapTexture.imagePosX.src = posx;

    cubemapTexture.imageNegX.crossOrigin = "anonymous";
    cubemapTexture.imageNegX.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 1); };
    cubemapTexture.imageNegX.src = negx;

    cubemapTexture.imagePosY.crossOrigin = "anonymous";
    cubemapTexture.imagePosY.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 2); };
    cubemapTexture.imagePosY.src = posy;

    cubemapTexture.imageNegY.crossOrigin = "anonymous";
    cubemapTexture.imageNegY.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 3); };
    cubemapTexture.imageNegY.src = negy;

    cubemapTexture.imagePosZ.crossOrigin = "anonymous";
    cubemapTexture.imagePosZ.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 4); };
    cubemapTexture.imagePosZ.src = posz;

    cubemapTexture.imageNegZ.crossOrigin = "anonymous";
    cubemapTexture.imageNegZ.onload = function() { handleCubemapTextureLoaded(cubemapTexture, 5); };
    cubemapTexture.imageNegZ.src = negz;

    console.log("loading cubemap texture....");
}

function handleCubemapTextureLoaded(texture, index) {

    if (index == 0) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imagePosX);
    }

    if (index == 1) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imageNegX);
    }

    if (index == 2) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imagePosY);
    }

    if (index == 3) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imageNegY);
    }

    if (index == 4) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imagePosZ);
    }

    if (index == 5) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.imageNegZ);
    }
}

var squareVertexPositionBuffer;
var squareVertexNormalBuffer;
var squareVertexColorBuffer;
var squareVertexIndexBuffer;
var squareVertexTexCoordsBuffer;

var sqvertices = [];
var sqnormals = [];
var sqindices = [];
var sqcolors = [];
var sqTexCoords=[];

function InitSquare() {
        sqvertices = [
             0.5,  0.5,  0,
	            -0.5,  0.5,  0,
	             - 0.5, -0.5, 0,
 	             0.5, -0.5,  0,
        ];
	sqindices = [0,1,2, 0,2,3];
        sqcolors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
        ];
        sqnormals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];
        sqTexCoords = [0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0];
}


function initSQBuffers() {

        InitSquare();
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqvertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        squareVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqnormals), gl.STATIC_DRAW);
        squareVertexNormalBuffer.itemSize = 3;
        squareVertexNormalBuffer.numItems = 4;

        squareVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
        squareVertexTexCoordsBuffer.itemSize = 2;
        squareVertexTexCoordsBuffer.numItems = 4;

	      squareVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sqindices), gl.STATIC_DRAW);
        squareVertexIndexBuffer.itemsize = 1;
        squareVertexIndexBuffer.numItems = 6;

        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqcolors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;

}

function drawSquare(matrix, texture) {
  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, matrix);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  var mat_diffuse = [0, 1, 0, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, squareVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader
  gl.uniform1i(shaderProgram.use_textureUniform, use_texture);

  gl.activeTexture(gl.TEXTURE1);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader

  gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader

  if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, squareVertexPositionBuffer.numItems);	
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, squareVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);	
}

var witneyVerts = [];
var witneyNormals = [];
var witneyIndices = [];
var witneyColors = [];
var witneyTexCoords = [];

function initWitneysUmbrella(minV, maxV, minU, maxU, step) {

  var iRange = (maxV - minV) / step;
  var jRange = (maxU - minU) / step;
  
  for (var u = minU; u <= maxU; u = u + step) {
    for(var v = minV; v <= maxV; v = v + step) {
      var x = v * u;
      var y = u;
      var z = v * v;

      var tx = u;
      var ty = 1;
      var tz = 0;

      var sx = v;
      var sy = 0;
      var sz = 2 * v;

      var nx = ty * sz - tz * sy;
      var ny = tz * sx - tx * sz;
      var nz = tx * sy - ty * sx;


      var length = Math.sqrt(nx * nx + ny * ny + nz * nz);



      if (length != 0) {
        nx /= length;
        ny /= length;
        nz /= length;
      }


      witneyVerts.push(x);
      witneyVerts.push(y);
      witneyVerts.push(z);

      witneyNormals.push(nx);
      witneyNormals.push(ny);
      witneyNormals.push(nz);

      witneyColors.push(x);
      witneyColors.push(y);
      witneyColors.push(z);
      witneyColors.push(1.0);

      witneyTexCoords.push(0.0);
      witneyTexCoords.push(0.0);

      witneyTexCoords.push(1.0);
      witneyTexCoords.push(0.0);

      witneyTexCoords.push(1.0);
      witneyTexCoords.push(1.0);

      witneyTexCoords.push(0.0);
      witneyTexCoords.push(1.0);
      

    }
  }

  for (var i = 0; i < iRange; i++) {
    for (var j = 0; j < jRange; j++) {
      var v1 = (i * (iRange + 1) + j);
      var v2 = v1 + jRange + 1;

      witneyIndices.push(v1);
      witneyIndices.push(v2);
      witneyIndices.push(v1 + 1);

      witneyIndices.push(v2);
      witneyIndices.push(v2 + 1);
      witneyIndices.push(v1 + 1);
    }
  }
}

var witneyVertexPositionBuffer;
var witneyVertexNormalBuffer;
var witneyVertexTexCoordsBuffer;
var witneyVertexIndexBuffer;
var witneyVertexColorBuffer;


function initWitneyUmbBuffers() {
  var minV = -2;
  var maxV = 2;
  var minU = -2;
  var maxU = 2;
  var step = 0.5;

  initWitneysUmbrella(minV, maxV, minU, maxU, step);

  witneyVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(witneyVerts), gl.STATIC_DRAW);
  witneyVertexPositionBuffer.itemSize = 3;
  witneyVertexPositionBuffer.numItems = witneyVerts.length / 3;

  witneyVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(witneyNormals), gl.STATIC_DRAW);
  witneyVertexNormalBuffer.itemSize = 3;
  witneyVertexNormalBuffer.numItems = witneyNormals.length / 3;

  witneyVertexTexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexTexCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(witneyTexCoords), gl.STATIC_DRAW);
  witneyVertexTexCoordsBuffer.itemSize = 2;
  witneyVertexTexCoordsBuffer.numItems = witneyTexCoords.length / 2;

	witneyVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, witneyVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(witneyIndices), gl.STATIC_DRAW);
  witneyVertexIndexBuffer.itemsize = 1;
  witneyVertexIndexBuffer.numItems = witneyIndices.length;

  witneyVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(witneyColors), gl.STATIC_DRAW);
  witneyVertexColorBuffer.itemSize = 4;
  witneyVertexColorBuffer.numItems = witneyColors / 4;
  
}

function drawWitneyUmbrella(matrix, texture) {
  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, matrix);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  var mat_diffuse = [1, 0, 1, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, witneyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, witneyVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, witneyVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, witneyVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, witneyVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, witneyVertexIndexBuffer);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader
  gl.uniform1i(shaderProgram.use_textureUniform, use_texture);

  gl.activeTexture(gl.TEXTURE1);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader

  gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader

  if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, witneyVertexPositionBuffer.numItems);	
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, witneyVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
}

////////////////    Initialize VBO  ////////////////////////

function initCubeBuffers() {

  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
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
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = 24;

  cubeVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
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
  cubeVertexNormalBuffer.itemSize = 3;
  cubeVertexNormalBuffer.numItems = 24;

  cubeVertexTexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordsBuffer);

  sqTexCoords = [0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0, 0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
  cubeVertexTexCoordsBuffer.itemSize = 2;
  cubeVertexTexCoordsBuffer.numItems = 24;

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

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemsize = 1;
  cubeVertexIndexBuffer.numItems = 36;

  cubeVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
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
  cubeVertexColorBuffer.itemSize = 4;
  cubeVertexColorBuffer.numItems = 24;
}

function drawCube(matrix, texture) {
  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, matrix);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  var mat_diffuse = [1, 0, 0, 1];
  gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
  gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
  gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

  gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
  gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
  gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTexCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexTexCoordsAttribute, cubeVertexTexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // draw elementary arrays - triangle indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  setMatrixUniforms(matrix); // pass the modelview mattrix and projection matrix to the shader
  gl.uniform1i(shaderProgram.use_textureUniform, use_texture);

  gl.activeTexture(gl.TEXTURE1);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader

  gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use
  gl.bindTexture(gl.TEXTURE_2D, texture);    // bind the texture object to the texture unit
  gl.uniform1i(shaderProgram.textureUniform, 0);   // pass the texture unit to the shader

  if (draw_type ==1) gl.drawArrays(gl.LINE_LOOP, 0, cubeVertexPositionBuffer.numItems);	
	else if (draw_type==2) gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0);
}

var Z_angle = 0.0;

///////////////////////////////////////////////////////////////

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  pMatrix = mat4.perspective(90, 1.0, 0.1, 200, pMatrix); // set up the projection matrix

  vMatrix = mat4.lookAt([0, 0, 0], [0, 0, 0], [0, 1, 0], vMatrix); // set up the view matrix

  vMatrix = mat4.rotateY(vMatrix,degToRad(yaw));
  vMatrix = mat4.rotateX(vMatrix,degToRad(pitch));

  //var model = mat4.create();
  //mat4.identity(model);
  //model = mat4.multiply(model, mMatrix);

  console.log(use_texture);

  use_texture = wall_Texture;
  drawSixWallEnv();

  use_texture = witney_Texture;
  drawWitneyUmbrella(witneyMatrix, posxWallTexture);

  use_texture = wall_Texture;
  drawSquare(myPortraitM, garrettTexture);
  drawSquare(olivePortraitM, oliveTexture);
}

function drawSixWallEnv() {

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, posxM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(posxM, posxWallTexture);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, posyM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(posyM, posyWallTexture);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, poszM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(poszM, poszWallTexture);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, negxM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(negxM, negxWallTexture);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, negyM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(negyM, negyWallTexture);

  mat4.identity(nMatrix);
  nMatrix = mat4.multiply(nMatrix, vMatrix);
  nMatrix = mat4.multiply(nMatrix, negzM);
  nMatrix = mat4.inverse(nMatrix);
  nMatrix = mat4.transpose(nMatrix);

  mat4.identity(v2wMatrix);
  v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
  v2wMatrix = mat4.transpose(v2wMatrix);

  shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");

  drawSquare(negzM, negzWallTexture);

}

function BG(red, green, blue) {
  gl.clearColor(red, green, blue, 1.0);
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

/**
 * Calculates the mouse displacement on mouse move.
 */
function onDocumentMouseMove(event) {
  var mouseX = event.clientX;
  var mouseY = event.clientY;
  var diffX = mouseX - lastMouseX;
  var diffY = mouseY - lastMouseY;

  var yaw_angle = diffX / 5;
  var pitch_angle = diffY / 5;

  lastMouseX = mouseX;
  lastMouseY = mouseY;

  if (yaw >= 360 || yaw <= -360) {
    yaw = 0;
  }

  yaw = yaw - yaw_angle;
  pitch = pitch + pitch_angle;

  drawScene();
}

function texture(value) {

  if (value == 0) {
    draw_type = 1;
  } else if (value == 1) {
    draw_type = 2;
  } else if (value == 2) {
    witney_Texture = 0;
    wall_Texture = 0;
  } else if (value == 3) {
    witney_Texture = 2;
    wall_Texture = 1;
  }

  drawScene();

}

function redraw() {

  reset = 1;
  webGLStart();
}

function witneySwitchTexture() {

  if (witney_Texture == 1) {
    witney_Texture = 2;
  } else {
    witney_Texture = 1;
  }
  drawScene();

}

var loop = function () {

  if (witneyIsRotating == 1) {
    witneyMatrix = mat4.rotate(witneyMatrix, degToRad(0.5), [0,1,1]);
  }

  drawScene();

	requestAnimationFrame(loop);
};

var witneyIsRotating = 1;

function rotateWitney() {
  if (witneyIsRotating == 1) {
    witneyIsRotating = 0;
  } else {
    witneyIsRotating = 1;
  }
}