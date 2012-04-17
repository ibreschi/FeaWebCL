

!(function (exports){


var GLCL_SHARE_MODE     = true;         // shareMode is boolean
var NO_SHARE_MODE       = false; 


exports.Controller = function (){
  if (!(this instanceof Controller)){
    return new Controller();
  }
  this.models=[];
  this.current_model= 0;
  this.wireframe= 0;


  this.isGLCLshared   = GLCL_SHARE_MODE;

  this.webGlDrawer    = null;         // webGl framework
  this.subdivider = null;

};



Controller.prototype.InitController = function ()
{
 
    // start the CL subdivider engine
    //NBODY = 4 * GetWorkGroupSize() ;
  this.subdivider= ParallelSubdivider();

  // Load Objects
  this.InitModels();

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
};

Controller.prototype.InitModels= function(){
  console.log("Adding a Cube");
  this.add_obj("objs/cube.obj",6);
  console.log("Cube added");

  // console.log("Adding a Tetrahedron");
  // this.add_obj("objs/tetra.obj",5);
  // console.log("Tetrahedron added");

  // console.log("Adding a Bigguy");
  // this.add_obj("objs/bigguy.obj",3);
  // console.log("Bigguy added");
  // console.log("Adding a Monsterfrog");
  // this.add_obj("objs/monsterfrog.obj",3);
  // console.log("Monsterfrog added");


  // others add 
};



exports.Controller.prototype.currentModel = function(){
  return this.models[this.current_model];
};

Controller.prototype.next_model = function(){
  if (this.current_model<this.models.length-1)
    this.current_model +=1; 
  // fix dimension of list
};
Controller.prototype.prev_model = function(){
  if (this.current_model>0)
  this.current_model -=1; 
    // fix dimension of list
};

Controller.prototype.next_level = function(){
  var model = this.currentModel();
  if(model.cur_level<model.nr_levels -1){
    model.cur_level ++;

  }
};

Controller.prototype.prev_level = function(){
  var model = this.currentModel();
  if(model.cur_level>0){
    model.cur_level --;
  }
};

Controller.prototype.toggle_wireframe = function(){
  this.wireframe = !this.wireframe;
};




})(this);

//var controller = new Controller();
