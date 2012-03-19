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

var WINW                = 400;          // drawing canvas width
var WINH                = 400;          // drawing canvas height

var NBODY               = 2048;         // default number of particles to simulate
var INNER_FLOPS         = 25;           // number of flops in inner loop of simulation

var SAMPLEPERIOD        = 10;           // calculate fps and sim/draw times over this many frames
var DISPLAYPERIOD       = 400;          // msecs between display updates of fps and sim/draw times

var POS_ATTRIB_SIZE     = 4;            // xyzm, xyzm, xyzm, ...
var VEL_ATTRIB_SIZE     = 4;            // vx, vy, vz, unused, vx, vy, vz, unused, ...
var CUBE_ATTRIB_SIZE    = 3;            // xyz, xyz, ...
     
var CL_SIM_MODE         = true;
var GL_DRAW_MODE        = true;

var GLCL_SHARE_MODE     = true;         // shareMode is boolean
var NO_SHARE_MODE       = false; 

var EPSSQR              = 50;           // softening factor
var DT                  = 0.01;        // time delta    


function UserData() {
	this.curPos         = null;         // current particle position and mass
	this.curVel         = null;         // current particle velocity
	this.genPos         = null;         // generation particle position and mass
	this.genVel         = null;         // generation particle velocity
	this.curPosLoc      = null;         // location of curPos attribute in vertex shader
	this.curVelLoc      = null;         // location of curVel attribute in vertex shader

	this.mvpPointLoc    = null;         // location of mvp matrix in point vertex shader
	this.mvpCubeLoc     = null;         // location of mvp matrix in cube vertex shader

	this.cubeVertices   = null;         // cube vertex array
	this.cubeIndices    = null;         // cube indice array
	this.cubeLoc        = null;         // location of cube attribute in vertex shader

	this.pointProgram   = null;         // GL program with point shaders
	this.cubeProgram    = null;         // GL program with cube shaders

	this.curPosVBO      = null;         // shared buffer between GL and CL
	this.curVelVBO      = null;         // shared buffer between GL and CL

	this.cubeVertexVBO  = null;
	this.cubeIndiceVBO  = null;

	this.theta          = 0.2;                  // angle to rotate model    
	this.modelMatrix    = new J3DIMatrix4();    // updated each frame
	this.vpMatrix       = new J3DIMatrix4();    // constant
	this.mvpMatrix      = new J3DIMatrix4();    // updated each frame

	this.simMode        = null; 
	this.drawMode       = null;
	this.isSimRunning	= true;
	this.is3D			= true;
	this.isGLCLshared   = GLCL_SHARE_MODE;

	this.gl             = null;         // handle for GL context
	this.cl             = null;         // handle for CL context
}

var userData = null;

function RANDM1TO1() { return Math.random() * 2 - 1; }
function RAND0TO1() { return Math.random(); }

function onLoad() {
	if(WINW !== WINH) {
		console.error("Error: drawing canvas must be square");
		return;
	}

	userData = new UserData();
	// //Init Controller to Get the WorkGroupSize & Set NBODY to multiple of it.
	//
	InitController();
	NBODY = 4 * GetWorkGroupSize() ;
	//Init Controller to Get the CL Object.
	//
	InitController();
	userData.cl  = InitCL();
	SetMode();
	setInterval( MainLoop, 0 );
}

function InitController()
{

	userData.curPos = new Float32Array(NBODY * POS_ATTRIB_SIZE);
	userData.curVel = new Float32Array(NBODY * VEL_ATTRIB_SIZE);

	userData.genPos = new Float32Array(NBODY * POS_ATTRIB_SIZE);
	userData.genVel = new Float32Array(NBODY * VEL_ATTRIB_SIZE);

	InitParticles();
	userData.gl  = InitGL("canvas3D");   
}


function InitParticles() {
	InitParticlesOnFountain();
	document.getElementById("num").firstChild.nodeValue = NBODY;
}

function MainLoop() {

	if(userData.isSimRunning) {
		SimulateCL(userData.cl);
	}
	Draw();
}

function Draw() {
	DrawGL(userData.gl);
}

function SetMode() {
	var div = document.getElementById("sim");
	div.firstChild.nodeValue = (userData.cl === null)? "NA" : "CL";
	var div = document.getElementById("drw");
	div.firstChild.nodeValue = (userData.gl === null)? "NA" : "GL";
}

function ToggleSimRunning()
{
	userData.isSimRunning = !userData.isSimRunning;
}

function Toggle3D()
{
	userData.is3D = !userData.is3D;
}




