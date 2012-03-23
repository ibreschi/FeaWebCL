
function InitGL2(canvasName) {
    
    // points
    //
    userData.pointProgram  = gl.createProgram();
    gl.attachShader(userData.pointProgram, getShader( gl, "point-vshader" ));
    gl.attachShader(userData.pointProgram, getShader( gl, "point-fshader" ));
    gl.linkProgram(userData.pointProgram);
    gl.useProgram(userData.pointProgram);

    userData.curPosLoc = gl.getAttribLocation(userData.pointProgram, "curPos");
    userData.mvpPointLoc = gl.getUniformLocation(userData.pointProgram, "mvp");
    


    userData.curPosVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, userData.curPosVBO);
    gl.bufferData(gl.ARRAY_BUFFER, userData.curPos, gl.DYNAMIC_DRAW);
    
    // // cube
    // //
    // userData.cubeProgram  = gl.createProgram();
    // gl.attachShader(userData.cubeProgram, getShader( gl, "cube-vshader" ));
    // gl.attachShader(userData.cubeProgram, getShader( gl, "cube-fshader" ));
    // gl.linkProgram(userData.cubeProgram);
    // gl.useProgram(userData.cubeProgram);
    
    // userData.cubeLoc = gl.getAttribLocation(userData.cubeProgram, "cube");
    // userData.mvpCubeLoc = gl.getUniformLocation(userData.cubeProgram, "mvp");
    
    // userData.cubeVertices = new Float32Array(cubeVertices);
    // userData.cubeIndices  = new Uint16Array(cubeIndices);
    
    // userData.cubeVertexVBO = gl.createBuffer();
    // userData.cubeIndiceVBO = gl.createBuffer();

    // gl.bindBuffer(gl.ARRAY_BUFFER, userData.cubeVertexVBO);
    // gl.bufferData(gl.ARRAY_BUFFER, userData.cubeVertices, gl.STATIC_DRAW);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, userData.cubeIndiceVBO);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, userData.cubeIndices, gl.STATIC_DRAW);
    
    // initialize matrices
    //
    userData.modelMatrix.makeIdentity();
        
    var aspect = WINW / WINH;
    userData.vpMatrix.perspective(45, aspect, 1, 10000);
    
    var cameraPosition = [0, 0, 20];
    var cameraTarget = [0, 0, 0];
    var cameraUpVector = [0, 1, 0];      
    userData.vpMatrix.lookat(
            cameraPosition[0], cameraPosition[1], cameraPosition[2],
            cameraTarget[0], cameraTarget[1], cameraTarget[2], 
            cameraUpVector[0], cameraUpVector[1], cameraUpVector[2]);
 
 

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    return gl;
}

function DrawGL(gl) {
    if(gl === null || !userData.isSimRunning)
        return;
    
    if(userData.is3D) {
      userData.modelMatrix.rotate(userData.theta, 0, 1, 0);
      userData.mvpMatrix.load(userData.vpMatrix);
      userData.mvpMatrix.multiply(userData.modelMatrix);
    }
    else {
      userData.mvpMatrix.makeIdentity();
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // cube
    //
    if(userData.is3D) {
    gl.useProgram(userData.cubeProgram);
    userData.mvpMatrix.setUniform(gl,userData.mvpCubeLoc, false);

    gl.bindBuffer(gl.ARRAY_BUFFER, userData.cubeVertexVBO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, userData.cubeIndiceVBO);
        
    gl.enableVertexAttribArray(userData.cubeLoc);
    gl.vertexAttribPointer(userData.cubeLoc, CUBE_ATTRIB_SIZE, gl.FLOAT, false, CUBE_ATTRIB_SIZE * Float32Array.BYTES_PER_ELEMENT, 0 );
    gl.drawElements(gl.LINES, userData.cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    }

   
    // particles
    //
    gl.useProgram(userData.pointProgram);
    userData.mvpMatrix.setUniform(gl,userData.mvpPointLoc, false);
    gl.bindBuffer(gl.ARRAY_BUFFER, userData.curPosVBO);
    
    gl.enableVertexAttribArray(userData.curPosLoc);
    gl.vertexAttribPointer(userData.curPosLoc, POS_ATTRIB_SIZE, gl.FLOAT, false, POS_ATTRIB_SIZE * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.drawArrays(gl.POINTS, 0, NBODY);    
    

    gl.flush ();
}





var web