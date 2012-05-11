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
  this.app=null;
  this.poin=null;
	this.xRot = 0; 
	this.xSpeed = 0;
  this.yRot = 0;
  this.ySpeed = 0;
  this.z = 1.0;
  this.stop =false;
  this.filter = 1;
  this.xCube=1;
  this.pos=null;
  this.controller = null;
};


WebGlDrawer.prototype.init = function (canvasName,controller){
  this.canvasName= canvasName;
  this.controller = controller;

  this.focusCamera();
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

  var model = this.controller.currentModel();
  var punti = model.meshes[model.cur_level].vertexbuf;
  var norm = model.meshes[model.cur_level].normalbuf;
  // var ind = model.meshes[model.cur_level].indexbuf.reduce(function(previousValue, currentValue, index, array){  
  //       return previousValue.concat( currentValue.vi);}, [])
  var ind = model.meshes[model.cur_level].indexbuf;
  var faces = model.meshes[model.cur_level].faces ;
  // Setting the Point model
  this.poin = new PhiloGL.O3D.Model({
    program:'program2',
    vertices : punti,
    indices :ind
  });
  
  var that =this;
	var keyPressFun = function(e) {
    switch(e.key) {
      case 's':
        that.xSpeed=0;
        that.ySpeed=0;
        break;
      case 'o':
        that.xRot=0;
        that.yRot=0;
        that.xSpeed=0;
        that.ySpeed=0;
        break;
      case 'up':
        that.xSpeed -= 0.02;
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

  var mouseWheel= function(e) {
    e.stop();
    var camera = that.camera;
    camera.position.z += e.wheel;
    camera.update();
  }


  var dragMove =  function(e) {
    that.xRot = -e.y/100;
    that.yRot = e.x/100;
  }

  var loadFun = function(app){
    that.app =app;
  	that.gl = app.gl;
    var gl = that.gl;
    var canvas = app.canvas;
    that.program = app.program;
    that.camera = app.camera;
    that.view = new PhiloGL.Mat4;
    cube = that.cube;
    gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.viewport(10, 10, canvas.width, canvas.height);
    gl.clearColor(1,1 , 1, 0);
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
      'position': {
        value:   poin.vertices,
        size: 3
      },
      'ind':{
        value: poin.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        size :1
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
      }
    ],
    events: {
      onDragMove: dragMove,
      onKeyDown: keyPressFun,
      onMouseWheel: mouseWheel
    },
    onError: errorFun ,
    onLoad: loadFun 

  });
}

WebGlDrawer.prototype.animate = function() {
	this.xRot += this.xSpeed;
  this.yRot += this.ySpeed;
}

WebGlDrawer.prototype.focusCamera = function(){
  var model = this.controller.currentModel();
  var vBuff = model.meshes[0].vertexbuf;
  var nr = vBuff.length/3;
  var min,max,center=[];

  min = [Infinity,Infinity,Infinity];
  max = [-Infinity,-Infinity,-Infinity];

  function vec_min( a,  b){
    var r=[];
  r[0] = Math.min(a[0], b[0]);
  r[1] = Math.min(a[1], b[1]);
  r[2] = Math.min(a[2], b[2]);
  return r;
  }
  function vec_max( a,  b){
    var r=[];
  r[0] = Math.max(a[0], b[0]);
  r[1] = Math.max(a[1], b[1]);
  r[2] = Math.max(a[2], b[2]);
  return r;
  }

  var vert;

  for (var i = 0; i < nr; i++) {
    vert=[vBuff[i],vBuff[i+1],vBuff[i+2] ];
    min =vec_min(min, vert);
    max =vec_max(max, vert);
  }
  //vec_add(center, min, max);
  //center[0] = min[0]+max[0];
  //center[1] = min[1]+max[1];
  //center[2] = min[2]+max[2];

  //vec_mul(center, 0.5f, center);
  //center[0] *= 0.5;
  //center[1] *= 0.5;
  //center[2] *= 0.5;
  var focal_len = 6.0 * max[1];

  //console.log(center,min,max,focal_len);
  //this.z *=focal_len;
  var dimCub;
  dimCub =Math.max(max[0],max[1],max[2],Math.abs(min[0]),Math.abs(min[1]),Math.abs(min[2]));
  this.xCube=dimCub+ dimCub/100.0*30;
  this.z =-2*this.xCube;

}

WebGlDrawer.prototype.changeMesh= function(){
  var model = this.controller.currentModel();
  var punti = model.meshes[model.cur_level].vertexbuf;
  // console.log(model.meshes[model.cur_level].indexbuf.length);
  var ind =  model.meshes[model.cur_level].indexbuf;
  var poin = this.poin;
  var gl= this.gl;
  poin.vertices=punti;
  poin.indices=ind;
  // set buffer with point data
  this.program.program2.setBuffers({
    'position': {
      value:   poin.vertices,
      size: 3
    },
      'ind':{
        value: poin.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        size :1
      }
  });
  this.focusCamera();
  var cube= this.cube;
  var xCube=this.xCube;
  cube.vertices= [ 
      -xCube, -xCube, -xCube,   // 0
      -xCube,  xCube, -xCube,   // 1
      xCube,  xCube, -xCube,   // 2
      xCube, -xCube, -xCube,   // 3
      -xCube, -xCube,  xCube,   // 4 frontface
      -xCube,  xCube,  xCube,   // 5
      xCube,  xCube,  xCube,   // 6
      xCube, -xCube,  xCube,   // 7
      ];
  this.program.program1.setBuffers({
    'aVertexPositionz': {
      value:   cube.vertices,
      size: 3
    }
  });

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
  if(this.controller.is3D) {
    gl.useProgram(program.program1.program);
    cube.position.set(0, 0, this.z);
    cube.rotation.set(this.xRot, this.yRot, 0);
    //update element matrix
    cube.update();
    //get new view matrix out of element and camera matrices
    view.mulMat42(camera.view, cube.matrix);
    //set attributes, indices and textures
    program.program1.setBuffer('aVertexPositionz').setBuffer('indices');
    // set uniforms
    program.program1.setUniform('uMVMatrix', view)
           .setUniform('uPMatrix', camera.projection);
    // draw lines
    gl.drawElements(gl.LINES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

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

  program.program2.setBuffer('position').setBuffer('ind');
  
  gl.drawArrays(gl.POINTS, 0, this.poin.vertices.length/3); 
  //gl.drawElements(gl.TRIANGLES,  this.poin.indices.length, gl.UNSIGNED_SHORT,0); 
  //gl.drawElements(gl.LINES,  this.poin.indices.length, gl.UNSIGNED_SHORT,0); 
  


}


WebGlDrawer.prototype.drawSceneWire = function (){
  var gl = this.gl;
  var cube = this.cube;
  var view = this.view;
  var poin = this.poin;
  var program = this.program;
  var camera = this.camera;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // //draw Cube
  if(this.controller.is3D) {
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

  program.program2.setBuffer('position').setBuffer('ind');
  
  //gl.drawArrays(gl.POINTS, 0, this.poin.vertices.length/3); 
  //gl.drawElements(gl.TRIANGLES,  this.poin.indices.length, gl.UNSIGNED_SHORT,0); 
  gl.drawElements(gl.LINES,  this.poin.indices.length, gl.UNSIGNED_SHORT,0); 
  

}
WebGlDrawer.prototype.mesh_renderText= function(){
  var nr_faces,nr_verts;
  var model = this.controller.currentModel();
  var mesh = model.meshes[model.cur_level];
  var ele1,ele2;
  nr_faces = mesh.faces.length;

  for(var f = 0; f<nr_faces;f++){
    
    nr_verts=mesh.face_vertex_count(f);
    console.log("Faccia: ",f," num vert ",nr_verts );
    //a polygon
    for(var v =0;v<nr_verts;v++){

      ele1=mesh.get_normal(f,v);
      if (ele1){
        console.log("  Normale di ",v,"=",ele1);
      }
      ele2= mesh.get_vertex(f,v);
      console.log("  Valore di ",v,"=",ele2);
    }
  }
}



WebGlDrawer.prototype.tick = function(){
  this.drawScene();
  this.animate();
  that =this;
  PhiloGL.Fx.requestAnimationFrame(function callback(){
    that.controller.render();
    }
  );
}

WebGlDrawer.prototype.tickWireframe = function(){
  this.drawSceneWire();
  this.animate();
  that =this;
  PhiloGL.Fx.requestAnimationFrame(function callback(){
    that.controller.render();
    }
  );
}
})(this);
