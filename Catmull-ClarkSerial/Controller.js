

!(function (exports){

var WINW                = 500;          // drawing canvas width
var WINH                = 500;          // drawing canvas height
var JS_SIM_MODE         = true;
var CL_SIM_MODE         = false;
var GL_DRAW_MODE        = true;

var GLCL_SHARE_MODE     = true;         // shareMode is boolean
var NO_SHARE_MODE       = false; 


exports.Controller = function (){
  if (!(this instanceof Controller)){
    return new Controller();
  }
  this.models=[];
  this.current_model= 0;
  this.wireframe= true;


  this.js_simMode     = true;
  this.cl_simMode     = false;
  this.drawMode       = null;
  this.isSimRunning   = true;
  this.is3D           = true;
  this.isGLCLshared   = GLCL_SHARE_MODE;

  this.webGlDrawer    = null;         // webGl framework
  this.subdivider = null;

};



Controller.prototype.InitController = function ()
{
  if(WINW !== WINH) {
    console.error("Error: drawing canvas must be square");
    return;
  }
  
  // start the JS subdivider engine
  if (this.js_simMode){
    this.subdivider= new Subdivider();
    this.SetMode(this.js_simMode);
  }
  else {
    // start the CL subdivider engine
    this.subdivider= WebCLProgram();
    this.subdivider.InitWebCL();
    this.SetMode(this.js_simMode);
  }

  // Load Objects
  this.InitModels();

  // start of WebGL engine 
  if (this.is3D){
    this.webGlDrawer  = new WebGlDrawer();
    this.webGlDrawer.init("canvasCC",this); 
  }

  this.SetStats();  

  this.render(); 
}


Controller.prototype.add_obj = function(file,nr_levels){
  var model = new Model();
  model.meshes[0] = model.readFile(file);
  model.cur_level=0;
  model.nr_levels=nr_levels
  model.file = file;
  model.stats.vs[0] = model.meshes[0].countVertex();
  model.stats.fs[0] = model.meshes[0].countFaces();
  var levels;
  levels = this.subdivider.subdivide_levels(model.meshes[0], nr_levels - 1);
  for (i = 0; i < nr_levels - 1; i++) {
    model.meshes[i+1]=levels[i];
    model.stats.vs[i+1] = model.meshes[i+1].countVertex();
    model.stats.fs[i+1] = model.meshes[i+1].countFaces();
  }
  this.models.push(model);
};

Controller.prototype.InitModels= function(){
  var tStart = new Date().valueOf();
  // console.log("Adding a Cube");
  // this.add_obj("objs/cube.obj",5);
  // console.log("Cube added");
  console.log("Adding a Tetrahedron");
  this.add_obj("objs/tetra.obj",2);
  console.log("Tetrahedron added");
  // console.log("Adding a Bigguy");
  // this.add_obj("objs/bigguy.obj",3);
  // console.log("Bigguy added");
  // console.log("Adding a Monsterfrog");
  // this.add_obj("objs/monsterfrog.obj",3);
  // console.log("Monsterfrog added");

  ////  a teapot is impossible to draw couse it is not a correct mash
  //// console.log("Adding a Teapot");
  //// this.add_obj("objs/teapot.obj",3);
  //// console.log("Cube Teapot");
  var tEnd = new Date().valueOf();
  console.log("total Time :",tEnd-tStart);


  // others add 
};
Controller.prototype.render = function (){
  var model = this.models[this.current_model];

  if (this.wireframe) {
    this.webGlDrawer.tickWireframe();
  }
  else{
    //this.webGlDrawer.mesh_renderText();
    this.webGlDrawer.tick();
  }
}


exports.Controller.prototype.currentModel = function(){
  return this.models[this.current_model];
};

Controller.prototype.next_model = function(){
  if (this.current_model<this.models.length-1)
    this.current_model +=1; 
  // fix dimension of list
  this.SetStats();  
  this.webGlDrawer.changeMesh();
};
Controller.prototype.prev_model = function(){
  if (this.current_model>0)
  this.current_model -=1; 
    // fix dimension of list
  this.SetStats();  
  this.webGlDrawer.changeMesh();
};

Controller.prototype.next_level = function(){
  var model = this.currentModel();
  if(model.cur_level<model.nr_levels -1){
    model.cur_level ++;

  }
  this.SetStats();  
  this.webGlDrawer.changeMesh();
};

Controller.prototype.prev_level = function(){
  var model = this.currentModel();
  if(model.cur_level>0){
    model.cur_level --;
  }
  this.SetStats();  
  this.webGlDrawer.changeMesh();
};

Controller.prototype.toggle_wireframe = function(){
  this.wireframe = !this.wireframe;
};



Controller.prototype.SetStats= function(){
  var model = this.models[this.current_model];
  document.getElementById("numV").firstChild.nodeValue = model.stats.vs[model.cur_level];
  document.getElementById("numF").firstChild.nodeValue = model.stats.fs[model.cur_level];
  document.getElementById("nameModel").firstChild.nodeValue = model.file;
}

Controller.prototype.SetMode= function(isJs) {
  var div = document.getElementById("sim");
  if(isJs){
    div.firstChild.nodeValue =  "JS";
  }
  else {
    div.firstChild.nodeValue = (this.subdivider.cl === undefined)? "NA" : "CL";
  }
  var div = document.getElementById("drw");
  div.firstChild.nodeValue = (this.gl === null)? "NA" : "GL";
};

Controller.prototype.ToggleSimRunning=function(){
  this.isSimRunning = !this.isSimRunning;
}

Controller.prototype.Toggle3D=function(){
  this.is3D = !this.is3D;
}



})(this);

//var controller = new Controller();
