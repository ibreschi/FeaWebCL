
!(function (exports){

exports.GenVertexPoints = function (){
  if (!(this instanceof GenVertexPoints)){
    return new GenVertexPoints();
  }
  this.cl = null;       // OpenCL context
  this.context=null; 
  this.queue=null;
  this.kernel =null;
  this.program = null;
  this.device_id;
                     
  this.globalWorkSize = new Int32Array(1);
  this.localWorkSize = new Int32Array(1);           
  this.workGroupSize;

  // Input Data
  this.facesFvert=null;
  this.verts =null;
  this.vertsFaces =null;
  this.vertsEdges =null;
  this.edgesv0 = null;
  this.edgesv1 = null;
  this.vELen =0;
  this.vFLen =0;

  // CL buffers
  this.inFacesFvert=null;
  this.inVerts =null;
  this.inVertsFaces =null;
  this.inVertsEdges =null; 
  this.inEdgesv0 = null;
  this.inEdgesv1 = null;
  this.outPoints= null;  

  // Output Data
  this.outP;
  this.outFFvert;


};

GenVertexPoints.prototype.initProcedure= function(webCLProgram){
  this.cl = webCLProgram.cl;
  this.context=webCLProgram.context;
  this.queue= webCLProgram.queue;
  this.kernel= webCLProgram.kernels[2];
  this.program = webCLProgram.programs[2];
  this.device_id =webCLProgram.device_id;



}

GenVertexPoints.prototype.SetData =function (args){
  this.facesFvert= new Int32Array(args[0]);
  this.verts = new Float32Array(args[1]);
  this.vertsFaces = new Int32Array(args[2]);
  this.vertsEdges = new Int32Array(args[3]);
  this.edgesv0=new Int32Array(args[4]);
  this.edgesv1=new Int32Array(args[5]);
  this.vELen =args[6];
  this.vFLen =args[7];

  console.log(this.vertsEdges ,this.edgesv0);
  this.workGroupSize=this.GetWorkGroupSize();
  this.globalWorkSize[0] = this.vertsFaces.length/this.vFLen ;
  this.localWorkSize[0]= 1;
  
  var cl = this.cl;
  var context = this.context;
  var queue = this.queue;

  try {
    
    var bufferSize1 = this.facesFvert.length * Int32Array.BYTES_PER_ELEMENT;
    this.inFacesFvert = context.createBuffer(cl.MEM_READ_ONLY, bufferSize1, null);
    if(this.inFacesFvert === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    var bufferSize2 = this.verts.length * Float32Array.BYTES_PER_ELEMENT;
    this.inVerts = context.createBuffer(cl.MEM_READ_WRITE, bufferSize2, null);
    if(this.inVerts === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    var bufferSize3 = this.vertsFaces.length * Float32Array.BYTES_PER_ELEMENT;
    
    this.inVertsFaces = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inVertsFaces === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    var bufferSize4 = this.vertsEdges.length * Float32Array.BYTES_PER_ELEMENT;
    
    this.inVertsEdges = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inVertsEdges === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    var bufferSize5 = this.edgesv0.length * Int32Array.BYTES_PER_ELEMENT;
    
    this.inEdgesv0 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize5, null);
    if(this.inEdgesv0 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    this.inEdgesv1 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize5, null);
    if(this.inEdgesv1 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    queue.enqueueWriteBuffer(this.inFacesFvert, true, 0, bufferSize1, this.facesFvert, null);
    queue.enqueueWriteBuffer(this.inVerts, true, 0, bufferSize2, this.verts, null);
    queue.enqueueWriteBuffer(this.inVertsFaces, true, 0, bufferSize3, this.vertsFaces, null);
    queue.enqueueWriteBuffer(this.inVertsEdges, true, 0, bufferSize4, this.vertsEdges, null);
    queue.enqueueWriteBuffer(this.inEdgesv0, true, 0, bufferSize5, this.edgesv0, null);
    queue.enqueueWriteBuffer(this.inEdgesv1, true, 0, bufferSize5, this.edgesv1, null);



    this.outPoints = context.createBuffer(cl.MEM_WRITE_ONLY, bufferSize2, null);
    if(this.outPoints === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    
    this.outP= new Float32Array(this.verts.length);
    queue.finish(function () { }, null);
  }
  catch (e)
  {
    console.error("Failure setting buffers; Message: "+ e.message);
  }
  return cl;

}

GenVertexPoints.prototype.RunProgram =function (){
  var kernel = this.kernel;
  var cl = this.cl;
  var queue = this.queue;
  try {
    if(cl === null)
      return;
    kernel.setKernelArgGlobal(0, this.inFacesFvert);
    kernel.setKernelArgGlobal(1, this.inVerts);
    kernel.setKernelArgGlobal(2, this.inVertsFaces);
    kernel.setKernelArgGlobal(3, this.inVertsEdges);
    kernel.setKernelArgGlobal(4, this.inEdgesv0);
    kernel.setKernelArgGlobal(5, this.inEdgesv1);
    kernel.setKernelArgGlobal(6, this.outPoints);
    kernel.setKernelArg(7, this.vFLen, cl.KERNEL_ARG_INT);
    kernel.setKernelArg(8, this.vELen, cl.KERNEL_ARG_INT);

    queue.enqueueNDRangeKernel(kernel, 1, 0, this.globalWorkSize, this.localWorkSize, null);
    
    var that = this;
    queue.finish(function () { 
      var bufferSize = that.verts.length * Float32Array.BYTES_PER_ELEMENT;
      that.queue.enqueueReadBuffer(that.inVerts, true, 0, bufferSize, that.outP, null);
    },null);
  }
  catch (e)
  {
    console.error("Failure  ; Message: "+ e.message);
  }

}


GenVertexPoints.prototype.GetResults= function()
{  
  return [this.outP, this.outFFvert];
}
GenVertexPoints.prototype.GetWorkGroupSize= function() {
    try {
      // Get the maximum work group size for executing the kernel on the device
      var workGroupSize= this.kernel.getKernelWorkGroupInfo(this.device_id, this.cl.KERNEL_WORK_GROUP_SIZE);
  }
  catch (e)
  {
    console.error( kernel+"Failure getting workGroupSize; Message: "+ e.message );
  }

  return workGroupSize;  
}



})(this);
