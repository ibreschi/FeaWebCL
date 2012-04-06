!(function (exports){

exports.GenFacePoints = function (){
  if (!(this instanceof GenFacePoints)){
    return new GenFacePoints();
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
};


GenFacePoints.prototype.InitBuffers =function (){

  try {
    // Create CL buffers from GL VBOs
    // (Initial load of positions is via gl.bufferData)
    //console.log(userData.webGlDrawer.app.buffers.curPos);
    curPosBuffer = context.createFromGLBuffer(cl.MEM_READ_WRITE, userData.webGlDrawer.app.buffers.curPos);
    if(curPosBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    bufferSize = NBODY * POS_ATTRIB_SIZE * Float32Array.BYTES_PER_ELEMENT;
    // Create CL working buffers (will be copied to current buffers after computation)
    //

    curVelBuffer = context.createBuffer(cl.MEM_READ_WRITE, bufferSize, null);
    if(curVelBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    

    genPosBuffer = context.createBuffer(cl.MEM_READ_ONLY, bufferSize, null);
    if(genPosBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    


    genVelBuffer = context.createBuffer(cl.MEM_READ_ONLY, bufferSize, null);
    if(genVelBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    queue.enqueueWriteBuffer(curVelBuffer, true, 0, bufferSize, userData.curVel, null);
    queue.enqueueWriteBuffer(genPosBuffer, true, 0, bufferSize, userData.genPos, null);
    queue.enqueueWriteBuffer(genVelBuffer, true, 0, bufferSize, userData.genVel, null);

    nxtPosBuffer = context.createBuffer(cl.MEM_READ_ONLY, bufferSize, null);
    if(nxtPosBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    nxtVelBuffer = context.createBuffer(cl.MEM_READ_ONLY, bufferSize, null);
    if(nxtPosBuffer === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
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


    globalWorkSize[0] = NBODY;   
    localWorkSize[0] = Math.min(workGroupSize, NBODY);
    localWorkSize[0]=1;

    
    queue.finish(this.GetNullResults, 0);
  }
  catch (e)
  {
    console.error("Failure setting buffers; Message: "+ e.message);
    test.showFailure();
  }
  return cl;

}

GenFacePoints.prototype.GetNullResults =function(userData)
{
}


GenFacePoints.prototype.RunProgram =function (){
    try {
    if(cl === null)
      return;
    if(userData.isGLCLshared) {
      queue.enqueueAcquireGLObjects(curPosBuffer, null);
    }

    var localMemSize = localWorkSize[0] * POS_ATTRIB_SIZE * Float32Array.BYTES_PER_ELEMENT;
    kernel.setKernelArgGlobal(0, curPosBuffer);
    kernel.setKernelArgGlobal(1, curVelBuffer);
    kernel.setKernelArgGlobal(2, genPosBuffer);
    kernel.setKernelArgGlobal(3, genVelBuffer);
    kernel.setKernelArg(4, DT, cl.KERNEL_ARG_FLOAT);
    queue.enqueueNDRangeKernel(kernel, 1, 0, globalWorkSize, localWorkSize, null);
    

    queue.finish(this.GetResults, cl);
    
  }
  catch (e)
  {
    console.error("Failure  ; Message: "+ e.message);
  }

}


GenFacePoints.prototype.GetResults = function (cl)
{  
  try {
    if(userData.isGLCLshared) {
      queue.enqueueReleaseGLObjects(curPosBuffer, null);
    }
  }
  catch (e)
  {
    console.error("Failure getting resoults ; Message: "+ e.message);
    test.showFailure();
  }
}
GenFacePoints.prototype.GetWorkGroupSize= function() {
    try {
      // Get the maximum work group size for executing the kernel on the device
      //
      kernel =this.kernel;
      console.log(kernel.getKernelWorkGroupInfo(device_id, cl.KERNEL_WORK_GROUP_SIZE))

  }
  catch (e)
  {
    console.error( kernel+"Failure getting workGroupSize; Message: "+ e.message );
  }

  //return workGroupSize;  
}



})(this);
