!(function (exports){

exports.GenFacePoints = function (){
  if (!(this instanceof GenFacePoints)){
    return new GenFacePoints();
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
  this.facesVs;
  this.facesFvert;
  this.verts;

  // CL buffers
  this.curFacesVs= null;  
  this.curFacesFvert= null;  
  this.curVerts= null;  
  this.outPoints= null;  
  this.outFacesFvert= null;  

  // Output Data
  this.outP;


};

GenFacePoints.prototype.initProcedure= function(webCLProgram){
  this.cl = webCLProgram.cl;
  this.context=webCLProgram.context;
  this.queue= webCLProgram.queue;
  this.kernel= webCLProgram.kernels[0];
  this.program = webCLProgram.programs[0];
  this.device_id =webCLProgram.device_id;


}

GenFacePoints.prototype.SetData =function (args){
  this.facesVs = args[0];
  this.facesFvert= args[1];
  this.verts = args[2];
  this.workGroupSize=this.GetWorkGroupSize();
  this.globalWorkSize[0] = this.facesFvert.length ;
  console.log("miao ",this.globalWorkSize[0], this.queue.getCommandQueueInfo(this.cl.QUEUE_REFERENCE_COUNT));
  this.localWorkSize[0]= 1;

  var cl = this.cl;
  var context = this.context;
  var queue = this.queue;
  try {
    
    var bufferSize1 = this.facesVs.length * Int32Array.BYTES_PER_ELEMENT;
    this.curFacesVs = context.createBuffer(cl.MEM_READ_ONLY, bufferSize1, null);
    if(this.curFacesVs === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    
    var bufferSize2 = this.facesFvert.length * Int32Array.BYTES_PER_ELEMENT;
    this.curFacesFvert = context.createBuffer(cl.MEM_WRITE_ONLY, bufferSize2, null);
    if(this.curFacesFvert === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    var bufferSize3 = this.verts.length * Float32Array.BYTES_PER_ELEMENT;
   
    this.curVerts = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.curVerts === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    queue.enqueueWriteBuffer(this.curFacesVs, true, 0, bufferSize1, this.facesVs, null);
    queue.enqueueWriteBuffer(this.curFacesFvert, true, 0, bufferSize2, this.facesFvert, null);
    queue.enqueueWriteBuffer(this.curVerts, true, 0, bufferSize3, this.verts, null);


    var bufferSize4 = this.facesFvert.length*3 *Float32Array.BYTES_PER_ELEMENT;
    // this buffer contains the new facepoints that are one for each old face
    this.outPoints = context.createBuffer(cl.MEM_WRITE_ONLY, bufferSize4, null);
    if(this.outPoints === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    // nxtVelBuffer = context.createBuffer(cl.MEM_READ_ONLY, bufferSize, null);
    // if(nxtPosBuffer === null) {
    //   console.error("Failed to allocate device memory");
    //   return null;
    // }
    
    // if(TEST==0){

    //  console.log("--Test1--")
    //  cpBufz1 = new Float32Array(bufferSize/4.0);
    //  queue.enqueueReadBuffer(curPosBuffer,true,0,bufferSize,cpBufz1,null)
    //  console.log("cpBufz1",cpBufz1[0],cpBufz1[1],cpBufz1[2],cpBufz1[3]);
      
    //  cvBufz1 = new Float32Array(bufferSize/4.0);
    //  queue.enqueueReadBuffer(curVelBuffer,true,0,bufferSize,cvBufz1,null)
    //  console.log("cvBufz1",cvBufz1[0],cvBufz1[1],cvBufz1[2],cvBufz1[3]);
    //  console.log("----")

    //  TEST=1;
    // }

    this.outP= new Float32Array(this.facesFvert.length*3);
    queue.finish(function () { }, null);
  }
  catch (e)
  {
    console.error("Failure setting buffers; Message: "+ e.message);
  }
  return cl;

}

GenFacePoints.prototype.RunProgram =function (){
  var kernel = this.kernel;
  var cl = this.cl;
  var queue = this.queue;
  try {
    if(cl === null)
      return;
    var len = 4;
    kernel.setKernelArgGlobal(0, this.curFacesVs);
    kernel.setKernelArgGlobal(1, this.curFacesFvert);
    kernel.setKernelArgGlobal(2, this.curVerts);
    kernel.setKernelArgGlobal(3, this.outPoints);
    kernel.setKernelArg(4, len, cl.KERNEL_ARG_INT);
    queue.enqueueNDRangeKernel(kernel, 1, 0, this.globalWorkSize, this.localWorkSize, null);
    
    var that = this;
    queue.finish(function () { 
      var bufferSize = (that.facesFvert.length*3)*Float32Array.BYTES_PER_ELEMENT;
      that.queue.enqueueReadBuffer(that.outPoints, true, 0, bufferSize, that.outP, null);
      var bufferSize2 = that.facesFvert.length*Int32Array.BYTES_PER_ELEMENT;
      that.queue.enqueueReadBuffer(that.curFacesFvert , true, 0, bufferSize2, that.facesFvert, null);
    },null);
  }
  catch (e)
  {
    console.error("Failure running program; Message: "+ e.message);
  }

}


GenFacePoints.prototype.GetResults= function()
{  
  return [this.outP, this.facesFvert];
}
GenFacePoints.prototype.GetWorkGroupSize= function() {
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
