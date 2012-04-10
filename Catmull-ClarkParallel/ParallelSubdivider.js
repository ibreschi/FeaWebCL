

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


var curPosBuffer;                           // OpenCL buffer created from GL VBO
var curVelBuffer;                           // OpenCL buffer created from GL VBO

var nxtPosBuffer;                           // OpenCL buffer
var nxtVelBuffer;                           // OpenCL buffer

var bufferSize = null;

var globalWorkSize = new Int32Array(1);
var localWorkSize = new Int32Array(1);
var workGroupSize = 0;


!(function (exports){

exports.ParallelSubdivider = function (){
  if (!(this instanceof ParallelSubdivider)){
    return new ParallelSubdivider();
  }
  this.genFacePoints =null;
  this.genEdgePoints = null;
  this.genVertexPoints = null;

  // Face Datas
  this.facesVs= [];   // 
  this.facesFvert=[];  //



  // vertices data
  this.verts= null;


  //Edge data 
  this.edgesv0 = [];
  this.edgesv1 = [];
  this.edgesf0 = [];
  this.edgesf1 = [];
  this.edgesEvert = [];
};




ParallelSubdivider.prototype.initParallel = function (){

  webCLController = new WebCLController();
  webCLController.InitWebCL();
  var kernels = webCLController.getKernels();
  // setting the fp procedur  
  this.genFacePoints = kernels[0];
  // setting the Ep procedure
  this.genEdgePoints =kernels[1];
  // setting the Vp procedure
  this.genVertexPoints = kernels[2];
   

}


ParallelSubdivider.prototype.init = function(mesh){
  var i, j, nr_verts, nr_faces;
  var vbuf;
  var f=[];
  var vidx, nidx;
  var Sub_vertices=[];
  var subVert;

  this.first_iteration = 1;

  /* Create vertices */
  
  this.verts = new Float32Array(mesh.vertexbuf);
 // nr_verts = mesh.countVertex();

  // for (var i = 0; i < nr_verts; i++) {
  //   this.verts.push(new sdVertex());
  //   this.verts[i].vectorP=[vbuf[3*i],vbuf[3*i+1],vbuf[3*i+2]];
  //   this.verts.push(vbuf[3*i])
  // };
  var facesVs= [];
  var facesFvert= [];
  /* Create faces */
  nr_faces = mesh.faces.length;
   for (var k = 0; k < nr_faces; k++) {
    nr_verts = mesh.face_vertex_count(k);
     for (j = 0; j < nr_verts; j++) {
        vidx =mesh.face_vertex_index(k, j)[0];
        facesVs.push(vidx);
      }
      facesFvert.push(-1);
  }

  this.facesVs = new Int32Array(facesVs);
  this.facesFvert = new Int32Array(facesFvert);

  // /* Create edges */
  // this.update_links();
}


ParallelSubdivider.prototype.do_iteration= function(last_iteration){

  this.initParallel();

  // FacePoint Procedure
  this.genFacePoints.SetData([this.facesVs,this.facesFvert,this.verts]);
  this.genFacePoints.RunProgram();
  var ris =this.genFacePoints.GetResults();
  this.verts= Float32Concat(this.verts,ris[0]);
  this.facesFvert = ris[1];
  // output ok!!
  //console.log(this.verts ,this.facesFvert);

  // EdgePoint Procedure
  this.genEdgePoints.SetData([this.facesVs,this.facesFvert,this.verts]);
  // this.genEdgePoints.RunProgram();
  // ris =this.genEdgePoints.GetResults();
  // console.log(ris);
  
  // // VertexPoint Procedure
  // this.genVertexPoints.SetData([this.facesVs,this.facesFvert,this.verts]);
  // this.genVertexPoints.RunProgram();
  // ris =this.genVertexPoints.GetResults();
  // console.log(ris);
}


ParallelSubdivider.prototype.subdivide_levels = function(mesh,nr_levels){
  var levels=[];
  this.init(mesh);
  this.do_iteration(true);
  //for (i = 0; i < nr_levels; i++) {
    //this.do_iteration( i==nr_levels - 1 );
    //levels[i] = this.convert();
  //}

  //this.destroy();
  return levels;
}

ParallelSubdivider.prototype.destroy =function(){
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

function Float32Concat(first, second)
{
    var firstLength = first.length;
    var result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}


})(this);

