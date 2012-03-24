!(function (exports){

test = 1;
exports.WebGlDrawer = function (){
	if (!(this instanceof WebGlDrawer)){
		return new WebGlDrawer();
	}
	this.canvasName ="";
	this.gl = null;
	this.view= null;
	this.camera= null;
	this.program= null;
	this.cube = null;
  this.cube2= null;
  this.poin=null;
	this.xRot = 0; 
	this.xSpeed = 0;
  this.yRot = 0;
  this.ySpeed = 0;
  this.z = -10.0;
  this.stop =false;
  this.filter = 1;
  this.xCube=2;



};
WebGlDrawer.prototype.init = function (canvasName){
  this.canvasName= canvasName;
  //Create object
  var xCube= this.xCube;
  this.cube = new PhiloGL.O3D.Model({
    program:'program1',
    vertices: [ 
      -xCube, -xCube, -xCube,   // 0
      -xCube,  xCube, -xCube,   // 1
      xCube,  xCube, -xCube,   // 2
      xCube, -xCube, -xCube,   // 3
      -xCube, -xCube,  xCube,   // 4 frontface
      -xCube,  xCube,  xCube,   // 5
      xCube,  xCube,  xCube,   // 6
      xCube, -xCube,  xCube,   // 7
      ],

    indices:  [
      0, 1,              // backface
      1, 2,
      2, 3,
      3, 0,
      4, 5,              // frontface
      5, 6,
      6, 7,
      7, 4,
      0, 4,              // back to front
      1, 5,
      2, 6,
      3, 7]
  });


  xCube= 1;
  this.cube2 = new PhiloGL.O3D.Model({
    program:'program3',
    vertices: [ 
      -xCube, -xCube, -xCube,   // 0
      -xCube,  xCube, -xCube,   // 1
      xCube,  xCube, -xCube,   // 2
      xCube, -xCube, -xCube,   // 3
      -xCube, -xCube,  xCube,   // 4 frontface
      -xCube,  xCube,  xCube,   // 5
      xCube,  xCube,  xCube,   // 6
      xCube, -xCube,  xCube,   // 7
      ],

    indices:  [
      0, 1,              // backface
      1, 2,
      2, 3,
      3, 0,
      4, 5,              // frontface
      5, 6,
      6, 7,
      7, 4,
      0, 4,              // back to front
      1, 5,
      2, 6,
      3, 7]
  });
  // Setting the Point model
  this.poin = new PhiloGL.O3D.Model({
     program:'program2',
     vertices : userData.curPos,
      //indices: userData.curPosIndex
   });
  
      

  var that =this;
	var keyPressFun = function(e) {
    switch(e.key) {
      case 's':
        that.xSpeed=0;
        that.ySpeed=0;
        break;
      case 'up':
        that.xSpeed -= 0.02;
        console.log(that.xSpeed);
        break;
      case 'down':
        that.xSpeed += 0.02;
        break;
      case 'left':
        that.ySpeed -= 0.02;
        break;
      case 'right':
        that.ySpeed += 0.02;
        break;
      //handle page up/down
      default:
        if (e.code == 33) {
          that.z -= 0.1;
        } else if (e.code == 34) {
          that.z += 0.1;
        }
    }
  }
  var errorFun = function (e){
    alert("An error ocurred while loading the application" + e);
  }

  var loadFun = function(app){
  	  that.gl = app.gl;
    var gl = that.gl;
    var  canvas = app.canvas,
      rCube = 0;
    that.program = app.program;
    that.camera = app.camera;
    that.view = new PhiloGL.Mat4;
    cube = that.cube;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      
      that.camera.view.id();



      that.program.program1.setBuffers({
        'aVertexPositionz': {
          value: cube.vertices,
          size: 3
        },
        'indices': {
          value: cube.indices,
          bufferType: gl.ELEMENT_ARRAY_BUFFER,
          size: 1
        }
      });

       poin=that.poin;
   // set buffer with point data
    that.program.program2.setBuffers({
       'curPos': {
         value:   poin.vertices,
         size: 4
       }
       // ,
       // 'indices': {
       //    value: poin.indices,
       //    bufferType: gl.ELEMENT_ARRAY_BUFFER,
       //    size: 1
       //  }
    });

      cube2 = that.cube2;

            //set buffers with cube data
      that.program.program3.setBuffers({
        'aVertexPosition': {
          value: cube2.vertices,
          size: 3
        }
        ,
        'indices': {
          value: cube2.indices,
          bufferType: gl.ELEMENT_ARRAY_BUFFER,
          size: 1
        }
      });


   
  }

   PhiloGL(this.canvasName,{
      program: [{
             id:'program1',
         from: 'ids',
         vs: 'cube-vshader',
         fs: 'cube-fshader',
            },
           {
             id: 'program2',
             from: 'ids',
             vs: 'point-vshader',
             fs: 'point-fshader',
        },
           {
             id:'program3',
            from :'ids',
            vs: 'cube2-vshader',
            fs:'cube2-fshader',
          }
      ],
   events: {
     onKeyDown: keyPressFun
    },
   onError: errorFun ,
   onLoad: loadFun 
 });
}

WebGlDrawer.prototype.animate = function() {
	this.xRot += this.xSpeed;
  this.yRot += this.ySpeed;
}



WebGlDrawer.prototype.drawScene = function (){
	var gl = this.gl;
  var cube = this.cube;
  var view = this.view;
  var poin = this.poin;
  var program = this.program;
  var camera = this.camera;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// //draw Cube
  if(userData.is3D) {
    gl.useProgram(program.program1.program);
    cube.position.set(0, 0, this.z);
    cube.rotation.set(this.xRot, this.yRot, 0);
    //update element matrix
    cube.update();
    //get new view matrix out of element and camera matrices
    view.mulMat42(camera.view, cube.matrix);
    // //set attributes, indices and textures
    program.program1.setBuffer('aVertexPositionz').setBuffer('indices');
    // //set uniforms
    program.program1.setUniform('uMVMatrix', view)
           .setUniform('uPMatrix', camera.projection);
    // //draw triangles
    gl.drawElements(gl.LINES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

   }
  var cube2 =this.cube2;
  if(userData.is3D) {
    program.program3.use();
    cube2.position.set(1, 2, this.z);
    cube2.rotation.set(this.xRot, this.yRot, 0);
    //update element matrix
    cube2.update();
    //get new view matrix out of element and camera matrices
    view.mulMat42(camera.view, cube2.matrix);
    // //set attributes, indices and textures
    program.program3.setBuffer('aVertexPosition').setBuffer('indices');
    // //set uniforms
    program.program3.setUniform('uMVMatrix', view)
           .setUniform('uPMatrix', camera.projection);
    // //draw triangles
    gl.drawElements(gl.LINES, cube2.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  
  gl.useProgram(program.program2.program);
  poin.position.set(0, 0, this.z);
  poin.rotation.set(this.xRot, this.yRot, 0);
  //update element matrix
  poin.update();
  //get new view matrix out of element and camera matrices
  view.mulMat42(camera.view, poin.matrix);
  //set attributes, indices and textures
  //set uniforms
  program.program2.setUniform('uMVMatrix', view)
           .setUniform('uPMatrix', camera.projection);

  if(test ==1){
    console.log(NBODY);
    console.log(poin.vertices.length);
    test =2 ;
  }

  program.program2.setBuffer('curPos');
  gl.drawArrays(gl.POINTS, 0, NBODY);   

}


WebGlDrawer.prototype.tick = function(){
  this.drawScene();
  this.animate();
  that =this;
  PhiloGL.Fx.requestAnimationFrame(function callback(){
    that.tick();
    }
  );
}



})(this);
