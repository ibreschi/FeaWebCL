!(function (exports){

exports.WebCLController = function (){
  if (!(this instanceof WebCLController)){
    return new WebCLController();
  }
  this.cl = null;
  this.platform_ids=[];
  this.platform_id;  
  this.device_ids=[]; 
  this.device_id;
  this.context=null;                                // OpenCL context
  this.queue=null;
  this.programs = [];
  this.kernels = [];

};

WebCLController.prototype.InitWebCL =function (){
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

WebCLController.prototype.getNewQueue = function(){
  try {
    return this.context.createCommandQueue(this.device_id, null);
  }
  catch (e)
  {
    console.error("Failed gettin a new Queue; Message: "+ e.message );
  }
}

WebCLController.prototype.getKernel = function(id){
  var kernelScript = document.getElementById(id);
  if(kernelScript === null || kernelScript.type !== "x-kernel")
    return null;
  return kernelScript.firstChild.textContent;
}


WebCLController.prototype.GetProgram = function (kernelName){
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


WebCLController.prototype.getKernels = function (){
  var list=[];
  // setting the fp procedure
  var genFacePoints = new GenFacePoints();
  this.GetProgram("genFacePoints");
  genFacePoints.initProcedure(this);
  list.push(genFacePoints);

  // setting the ep procedure
  var genEdgePoints = new GenEdgePoints();
  this.GetProgram("genEdgePoints");
  genEdgePoints.initProcedure(this);
  list.push(genEdgePoints);

  var genVertexPoints = new GenVertexPoints();
  this.GetProgram("genVertexPoints");
  genVertexPoints.initProcedure(this);
  list.push(genVertexPoints);
  return list;
}



// var cl = new WebCLComputeContext();
// var platform_ids = cl.getPlatformIDs();
// var platform_id = platform_ids[0];
// var device_ids = platform_id.getDeviceIDs(cl.DEVICE_TYPE_GPU);
// var device_id = device_ids[0];
// var context = cl.createSharedContext(cl.DEVICE_TYPE_GPU, null, null);
// var queue = context.createCommandQueue(device_id, null);




})(this);

