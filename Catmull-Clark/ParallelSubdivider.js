

// procedure GenVertexPoints
// 1: forallverticesinVertexInBufferdo{inparallel}
// 2: if vertex vin is tagged for update then
// 3: Retrieve the corresponding vertex vout from VertexOut-
// Buffer
// 4: Retrieve the valence vc from VertexInBuffer
// 5: Set vout ⇐ vin×(vc−3)+(vout−vin)/vc vc
// 6: Write to VertexOutBuffer
// 7: end if
// 8: end for


 // Move old vertices 
 //  for (var i = 0; i < V; i++) {
 //    v =this.verts[i];

 //    if(i>=V)
 //      break;
 //    n= v.faces.length;
 //    vec_copy(v.vectorNewP, v.vectorP);
 //    appog=(n - 2) / n;
 //    vec_mul(v.vectorNewP, appog, v.vectorNewP);
 //    p= [0,0,0];
 //    for (var k = 0; k < v.faces.length; k++) {
 //      fi =this.faces.indexOf(v.faces[k]);
 //      var k=v.faces[k].fvert ;
 //      vec_add(p, p, this.verts[k].vectorP);
 //    };
 //    vec_mad(v.vectorNewP, 1.0 / (n * n), p);
 //    p= [0,0,0];
 //    for (var t = 0; t < v.edges.length; t++) {
 //      ei=v.edges[t];
 //      vec_add(p, p, this.edge_other(this.edges[ei], i).vectorP);
 //    };
 //    vec_mad(v.vectorNewP, 1.0 / (n * n), p);
 //  };

 //  for (var i = 0; i < V; i++) {
 //    v = this.verts[i];
 //    if (i >= V)
 //      break;
 //    vec_copy(v.vectorP, v.vectorNewP);
 //  };


var curPosBuffer;                           // OpenCL buffer created from GL VBO
var curVelBuffer;                           // OpenCL buffer created from GL VBO

var nxtPosBuffer;                           // OpenCL buffer
var nxtVelBuffer;                           // OpenCL buffer

var bufferSize = null;

var globalWorkSize = new Int32Array(1);
var localWorkSize = new Int32Array(1);
var workGroupSize = 0;


!(function (exports){

exports.WebCLProgram = function (){
  if (!(this instanceof WebCLProgram)){
    return new WebCLProgram();
  }
  this.cl = null;
  this.platform_ids=[];
  this.platform_id;  
  this.device_ids=[]; 
  this.device_id;
  this.context=null;                                // OpenCL context
  this.queue=null;
  this.genFacePoints = null;
  this.genVertexPoints =null;
  this.genEdgePoints =null;

  // Face Datas
  this.facesVs= [];   // 
  this.facesFvert;  //


};



WebCLProgram.prototype.InitWebCL =function (){
  try {
    if(typeof(WebCLComputeContext) === "undefined") {
      console.error("WebCLComputeContext is yet to be defined");
      return null;
    }

    this.cl = new WebCLComputeContext();

    if(this.cl === null) {
      console.error("Failed to create WebCL context");
      return;
    }

    // Select a compute device
    //
    this.platform_ids = this.cl.getPlatformIDs();
    if(this.platform_ids.length === 0) {
      console.error("No platforms available");
      return;
    }
    this.platform_id = this.platform_ids[0];

    // Select a compute device
    //

    this.device_ids = this.platform_id.getDeviceIDs(this.cl.DEVICE_TYPE_GPU);
    if(this.device_ids.length === 0) {
      console.error("No devices available");
      //return;
    }
    this.device_id = this.device_ids[0];
    // Create a compute context
    //
    this.context = this.cl.createSharedContext(this.cl.DEVICE_TYPE_GPU, null, null);
    // Create a command queue
    //
    this.queue = this.context.createCommandQueue(this.device_id, null);
    }
  catch (e)
  {
    console.error("Init Failed; Message: "+ e.message );
  }
}

WebCLProgram.prototype.getKernel = function(id){
  var kernelScript = document.getElementById(id);
  if(kernelScript === null || kernelScript.type !== "x-kernel")
    return null;
  return kernelScript.firstChild.textContent;
}


WebCLProgram.prototype.GetProgram = function (kernelName){
  try {
    // Create the compute program from the source buffer
    var kernelSource = this.getKernel(kernelName);

    if (kernelSource === null) {
      console.error("No kernel named: " + kernelName);
      return;
    }
    var program;
    program=this.context.createProgramWithSource(kernelSource);
    this.programs.push(program);

    // Build the program executable    
    program.buildProgram(null, null, null);
    
    // Create the compute kernel in the program we wish to run
    var kernel; 
    kernel = program.createKernel(kernelName);
    this.kernels.push(kernel);

  }
  catch (e)
  {
    console.error("Failure getting Program:"+kernelName+" Message: "+ e.message );
  }
}


WebCLProgram.prototype.getKernels = function (){

  // setting the fp procedure
  this.genFacePoints = new GenFacePoints();

  // setting the ep procedure
  this.genEdgePoints = new GenEdgePoints();

  // setting the ep procedure
  this.genVertexPoints = new GenVertexPoints();
}


WebCLProgram.prototype.do_iteration= function(last_iteration){
  this.getKernels();
  this.genFacePoints.RunProgram();
  this.genFacePoints.GetResults();

  this.genEdgePoints.RunProgram();
  this.genEdgePoints.GetResults();
  
  this.genVertexPoints.RunProgram();
  this.genVertexPoints.GetResults();
}


WebCLProgram.prototype.subdivide_levels = function(mesh,nr_levels){
  var levels=[];
  //this.init(mesh);
  for (i = 0; i < nr_levels; i++) {
    //this.do_iteration( i==nr_levels - 1 );
    levels[i] = this.convert();
  }

  this.destroy();
  return levels;
}

WebCLProgram.prototype.destroy =function(){
  var i ,j;

  for (i = 0; i < this.verts.length; i++)
  {
    this.verts[i].edges=[];
    this.verts[i].faces=[];
  }
  this.verts=[];
  for (j = 0; j < this.faces.length; j++)
    this.faces[j].vs=[];
  this.faces=[];
  this.edges=[];
}


})(this);

