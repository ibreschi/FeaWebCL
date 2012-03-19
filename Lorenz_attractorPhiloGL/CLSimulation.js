/*
 * Copyright (C) 2011 Samsung Electronics Corporation. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided the following conditions
 * are met:
 * 
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY SAMSUNG ELECTRONICS CORPORATION AND ITS
 * CONTRIBUTORS "AS IS", AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING
 * BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL SAMSUNG
 * ELECTRONICS CORPORATION OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES(INCLUDING
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS, OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT(INCLUDING
 * NEGLIGENCE OR OTHERWISE ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// local OpenCL info
//
var platform_ids;                           // array of OpenCL platform ids
var platform_id;                            // OpenCL platform id
var device_ids;                             // array of OpenCL device ids
var device_id;                              // OpenCL device id
var context;                                // OpenCL context
var queue;                                  // OpenCL command queue
var program;                                // OpenCL program
var kernel;                                 // OpenCL kernel

var curPosBuffer;                           // OpenCL buffer created from GL VBO
var curVelBuffer;                           // OpenCL buffer created from GL VBO

var nxtPosBuffer;                           // OpenCL buffer
var nxtVelBuffer;                           // OpenCL buffer

var bufferSize = null;
var cl = null;

var globalWorkSize = new Int32Array(1);
var localWorkSize = new Int32Array(1);
var workGroupSize = 0;

function getKernel(id) {
	var kernelScript = document.getElementById(id);
	if(kernelScript === null || kernelScript.type !== "x-kernel")
		return null;
	return kernelScript.firstChild.textContent;
}


function InitCL() {

	try {
		// Create CL buffers from GL VBOs
		// (Initial load of positions is via gl.bufferData)
		//
		curPosBuffer = context.createFromGLBuffer(cl.MEM_READ_WRITE, userData.curPosVBO);
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

		// 	console.log("--Test1--")
		// 	cpBufz1 = new Float32Array(bufferSize/4.0);
		// 	queue.enqueueReadBuffer(curPosBuffer,true,0,bufferSize,cpBufz1,null)
		// 	console.log("cpBufz1",cpBufz1[0],cpBufz1[1],cpBufz1[2],cpBufz1[3]);
			
		// 	cvBufz1 = new Float32Array(bufferSize/4.0);
		// 	queue.enqueueReadBuffer(curVelBuffer,true,0,bufferSize,cvBufz1,null)
		// 	console.log("cvBufz1",cvBufz1[0],cvBufz1[1],cvBufz1[2],cvBufz1[3]);
		// 	console.log("----")

		// 	TEST=1;
		// }


		globalWorkSize[0] = NBODY;   
		localWorkSize[0] = Math.min(workGroupSize, NBODY);
		localWorkSize[0]=1;

		
		queue.finish(GetNullResults, 0);
	}
	catch (e)
	{
		console.error("Lorenz Demo Failed ; Message: "+ e.message);
		test.showFailure();
	}
	return cl;
}

function GetNullResults(userData)
{
}

function SimulateCL(cl) {
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
		

		queue.finish(GetResults, cl);
    
	}
	catch (e)
	{
		console.error("Attractor Demo Failed ; Message: "+ e.message);
		test.showFailure();
	}
}

function GetResults(cl)
{  
	try {
		if(userData.isGLCLshared) {
			queue.enqueueReleaseGLObjects(curPosBuffer, null);
		}
	}
	catch (e)
	{
		console.error("Lorenz Demo Failed ; Message: "+ e.message);
		test.showFailure();
	}
}

function GetWorkGroupSize() {
	try {
		if(typeof(WebCLComputeContext) === "undefined") {
			console.error("WebCLComputeContext is yet to be defined");
			return null;
		}

		cl = new WebCLComputeContext();

		if(cl === null) {
			console.error("Failed to create WebCL context");
			return;
		}

		// Select a compute device
		//
		platform_ids = cl.getPlatformIDs();
		if(platform_ids.length === 0) {
			console.error("No platforms available");
			return;
		}
		platform_id = platform_ids[0];

		// Select a compute device
		//

		device_ids = platform_id.getDeviceIDs(cl.DEVICE_TYPE_GPU);
		if(device_ids.length === 0) {
			console.error("No devices available");
			//return;
		}
		device_id = device_ids[0];

		// Create a compute context
		//
		context = cl.createSharedContext(cl.DEVICE_TYPE_GPU, null, null);

		// Create a command queue
		//
		queue = context.createCommandQueue(device_id, null);

		// Create the compute program from the source buffer
		//

		var kernelSource = getKernel("attractor");

		if (kernelSource === null) {
			console.error("No kernel named: " + "attractor");
			return;
		}
		program = context.createProgramWithSource(kernelSource);

		// Build the program executable
		//
		program.buildProgram(null, null, null);
		
		// Create the compute kernel in the program we wish to run
		//

		kernel = program.createKernel("attractor");
	
		// Get the maximum work group size for executing the kernel on the device
		//
		workGroupSize = kernel.getKernelWorkGroupInfo(device_id, cl.KERNEL_WORK_GROUP_SIZE);
	}
	catch (e)
	{
		console.error("Attractor Demo Failed; Message: "+ e.message );
		test.showFailure();
	}

	return workGroupSize;  
}


