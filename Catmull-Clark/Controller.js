

!(function (exports){

var WINW                = 500;          // drawing canvas width
var WINH                = 500;          // drawing canvas height
var JS_SIM_MODE         = true;
var CL_SIM_MODE         = true;
var GL_DRAW_MODE        = true;

var GLCL_SHARE_MODE     = true;         // shareMode is boolean
var NO_SHARE_MODE       = false; 


exports.Controller = function (){
  if (!(this instanceof Controller)){
    return new Controller();
  }
  this.models=[];
  this.current_model= 0;
  this.wireframe= 0;


  this.js_simMode     = true;
  this.cl_simMode     = false;
  this.drawMode       = null;
  this.isSimRunning   = true;
  this.is3D           = true;
  this.isGLCLshared   = GLCL_SHARE_MODE;

  this.webGlDrawer    = null;         // webGl framework
  this.cl             = null;         // handle for CL context


  if(WINW !== WINH) {
    console.error("Error: drawing canvas must be square");
    return;
  }
  this.InitController();
};



Controller.prototype.InitController = function ()
{
  
  this.InitModels();
  this.webGlDrawer  = new WebGlDrawer();
  this.webGlDrawer.init("canvasPrima");  

  this.render(); 

  SetMode();
  MainLoop();
}


Controller.prototype.add_obj = function(file,nr_levels){
  var model = new Model();
  model.meshes[0] = model.readFile(file);
  model.cur_level=0;
  model.nr_levels=nr_levels
  model.stats.vs[0] = model.meshes[0].countVertex();
  model.stats.fs[0] = model.meshes[0].countFaces();

  var sub = new Subdivider();
  var levels;
  levels = sub.subdivide_levels(model.meshes[0], nr_levels - 1);
  //for (i = 0; i < nr_levels - 1; i++) {
  //  model.meshes[i+1]=levels[i];
  //  model.stats.vs[i+1] = model.meshes[i+1].countVertex();
  //  model.stats.fs[i+1] = model.meshes[i+1].countFaces();
  //}
  this.models.push(model);
};


Controller.prototype.current_model = function(){
  return this.models[this.current_model].mesh;
};

Controller.prototype.next_model = function(){
  this.current_model +=1; 
  // fix dimension of list
};
Controller.prototype.prev_model = function(){
  this.current_model -=1; 
    // fix dimension of list
};

Controller.prototype.next_level = function(){
  var model = this.current_model;
  if(this.cur_level<model.nr_levels -1){
    model.cur_level ++;
  }
};

Controller.prototype.prev_level = function(){
  var model = this.current_model;
  if(this.cur_level>0){
    model.cur_level --;
  }
};

Controller.prototype.toggle_wireframe = function(){
  this.wireframe = !this.wireframe;
};


Controller.prototype.InitModels= function(){
  this.add_obj("cube.obj",4);
};

Controller.prototype.SetMode= function() {
  var div = document.getElementById("sim");

  div.firstChild.nodeValue = (userData.cl === null)? "NA" : "CL";
  
  var div = document.getElementById("drw");
  div.firstChild.nodeValue = (userData.gl === null)? "NA" : "GL";
};

Controller.prototype.render = function (){
  var model = this.models[this.current_model];
  console.log(model);
  // glPushAttrib(GL_LIGHTING_BIT | GL_POLYGON_BIT);
  // glMaterialfv(GL_FRONT_AND_BACK, GL_DIFFUSE,
  //        (GLfloat[4]) { 1.0f, 1.0f, 1.0f, 1.0f });

  if (this.wireframe) {
    //SETUP OF 
  //     glDisable(GL_LIGHTING);
  //     glColor3f(0.0f, 1.0f, 0.0f);
  //     glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
  }
  // DRAW THE CURRENT LEVEL OF THE MODEL IN NORMAL MODE
  //glCallList(ed_obj->lists + ed_obj->cur_level);

  // glPopAttrib();
  this.webGlDrawer.tick();
}


})(this);

var controller = new Controller();
