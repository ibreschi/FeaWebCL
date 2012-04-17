!(function (exports){

exports.GenEdgePoints = function (){
  if (!(this instanceof GenEdgePoints)){
    return new GenEdgePoints();
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
  this.facesFvert;
  this.verts;
  this.edgesv0; 
  this.edgesv1;
  this.edgesf0;
  this.edgesf1; 

  // CL buffers
  this.inFacesFvert= null;  
  this.inVerts= null;  
  this.inEdgesv0= null;  
  this.inEdgesv1= null;  
  this.inEdgesf0= null;  
  this.inEdgesf1= null; 
  this.outEdgesEvert = null;
  this.outPoints= null;


  // Output Data
  this.outP;
  this.outEEvert;


};

GenEdgePoints.prototype.initProcedure= function(webCLProgram){
  this.cl = webCLProgram.cl;
  this.context=webCLProgram.context;
  this.queue =webCLProgram.queue;
  this.kernel= webCLProgram.kernels[1];
  this.program = webCLProgram.programs[1];
  this.device_id =webCLProgram.device_id;


}

function hcf(text1,text2){
  var gcd=1;
  if (text1>text2) {
    text1=text1+text2;
    text2=text1-text2;
    text1=text1-text2;}
  if ((text2==(Math.round(text2/text1))*text1)) {
    gcd=text1;
  }
  else {
  for (var i = Math.round(text1/2) ; i > 1; i=i-1) {
    if ((text1==(Math.round(text1/i))*i))
    if ((text2==(Math.round(text2/i))*i)) {gcd=i; i=-1;}
  }
}
return gcd;
}
GenEdgePoints.prototype.SetData =function (args){
  this.facesFvert= args[0];
  this.verts = args[1];
  this.edgesv0 = args[2];
  this.edgesv1 = args[3];
  this.edgesf0 = args[4];
  this.edgesf1 = args[5];

  this.workGroupSize=this.GetWorkGroupSize();
  this.globalWorkSize[0] = this.edgesv0.length ;  
  if (this.workGroupSize> this.edgesv0.length)
    this.localWorkSize[0] = this.edgesv0.length;
  else 
    this.localWorkSize[0] = hcf(this.workGroupSize, this.edgesv0.length);
  

  // console.log(this.globalWorkSize[0],this.localWorkSize[0] ,this.edgesv0.length);
  //console.log("GEp SetData :",this.queue.getCommandQueueInfo(this.cl.QUEUE_REFERENCE_COUNT));


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
   
    this.inVerts = context.createBuffer(cl.MEM_READ_ONLY, bufferSize2, null);
    if(this.inVerts === null) {
      console.error("Failed to allocate device memory");
      return null;
    }


    var bufferSize3 = this.edgesv0.length * Int32Array.BYTES_PER_ELEMENT;
    this.inEdgesv0 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inEdgesv0 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    this.inEdgesv1 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inEdgesv1 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    this.inEdgesf0 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inEdgesf0 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }
    
    this.inEdgesf1 = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.inEdgesf1 === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    queue.enqueueWriteBuffer(this.inFacesFvert, true, 0, bufferSize1, this.facesFvert, null);
    queue.enqueueWriteBuffer(this.inVerts, true, 0, bufferSize2, this.verts, null);
    queue.enqueueWriteBuffer(this.inEdgesv0, true, 0, bufferSize3, this.edgesv0, null);
    queue.enqueueWriteBuffer(this.inEdgesv1, true, 0, bufferSize3, this.edgesv1, null);
    queue.enqueueWriteBuffer(this.inEdgesf0, true, 0, bufferSize3, this.edgesf0, null);
    queue.enqueueWriteBuffer(this.inEdgesf1, true, 0, bufferSize3, this.edgesf1, null);


    this.outEdgesEvert = context.createBuffer(cl.MEM_READ_ONLY, bufferSize3, null);
    if(this.outEdgesEvert === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    var bufferSize4 = this.edgesv0.length*3 *Float32Array.BYTES_PER_ELEMENT;
    // this buffer contains the new facepoints that are one for each old face
    this.outPoints = context.createBuffer(cl.MEM_WRITE_ONLY, bufferSize4, null);
    if(this.outPoints === null) {
      console.error("Failed to allocate device memory");
      return null;
    }

    this.outP= new Float32Array(this.edgesv0.length*3);
    this.outEEvert= new Int32Array(this.edgesv0.length);


    queue.finish(function () { }, null);

  }
  catch (e)
  {
    console.error("Failure setting buffers; Message: "+ e.message);
  }
  return cl;

}

GenEdgePoints.prototype.RunProgram =function (){
  var kernel = this.kernel;
  var cl = this.cl;
  var queue = this.queue;
  try {
    if(cl === null)
      return;
    var len = 4;
    kernel.setKernelArgGlobal(0, this.inFacesFvert);
    kernel.setKernelArgGlobal(1, this.inVerts);
    kernel.setKernelArgGlobal(2, this.inEdgesv0);
    kernel.setKernelArgGlobal(3, this.inEdgesv1);
    kernel.setKernelArgGlobal(4, this.inEdgesf0);
    kernel.setKernelArgGlobal(5, this.inEdgesf1);
    kernel.setKernelArgGlobal(6, this.outPoints);
    kernel.setKernelArgGlobal(7, this.outEdgesEvert);

    queue.enqueueNDRangeKernel(kernel, 1, 0, this.globalWorkSize, this.localWorkSize, null);


    // qui errore queue si rompe dopo questo ^^^^^^^^^^^ la causa dovrebbe essere 
    // o nel tempo che impiega il kernel a essere eseguito 
    // o nei dati che gli sono passati 

  }
  catch (e)
  {
    console.error("Failure running program; Message: "+ e.message);
  }
  try {
    var that = this;
    queue.finish(function () { 
        var bufferSize = (that.edgesv0.length*3)*Float32Array.BYTES_PER_ELEMENT;
        that.queue.enqueueReadBuffer(that.outPoints, true, 0, bufferSize, that.outP, null);
        var bufferSize2 = that.edgesv0.length*Int32Array.BYTES_PER_ELEMENT;
        that.queue.enqueueReadBuffer(that.outEdgesEvert , true, 0, bufferSize2, that.outEEvert, null);
        that.Clean();
    },cl);
  }
  catch (e)
  {
    console.error("Failure getting results; Message: "+ e.message);
  }  

}

GenEdgePoints.prototype.Clean= function(){
  //console.log("GEp PreClean :",this.queue.getCommandQueueInfo(this.cl.QUEUE_REFERENCE_COUNT));
        
  this.inFacesFvert.releaseCLResource();
  this.inVerts.releaseCLResource();
  this.inEdgesv0.releaseCLResource(); 
  this.inEdgesv1.releaseCLResource();
  this.inEdgesf0.releaseCLResource();  
  this.inEdgesf1.releaseCLResource();
  this.outEdgesEvert.releaseCLResource();
  this.outPoints.releaseCLResource();
  //this.program.releaseCLResource();
  //this.kernel.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  this.queue.releaseCLResource();
  // this.context.releaseCLResource();
  //console.log("GEp PostClean :",this.queue.getCommandQueueInfo(this.cl.QUEUE_REFERENCE_COUNT));
}

GenEdgePoints.prototype.GetResults= function()
{  
  return [this.outP, this.outEEvert];
}
GenEdgePoints.prototype.GetWorkGroupSize= function() {
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
