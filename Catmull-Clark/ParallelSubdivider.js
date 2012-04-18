!(function (exports){

exports.ParallelSubdivider = function (){
  if (!(this instanceof ParallelSubdivider)){
    return new ParallelSubdivider();
  }

  this.webCLController =null;
  // Parallel procedures
  this.genFacePoints =null;
  this.genEdgePoints = null;
  this.genVertexPoints = null;

  // 
  this.vertForFace=0;

  // Face Data
  this.facesVs= null;    
  this.facesFvert=null;  

  // Vertices Data
  this.verts= null;
  this.vertsEdges= null;
  this.vertsNed =[];
  this.vertsFaces= null;
  this.vertsNfa =[];

  this.vertsEdOffset=[];
  this.vertsEdOffset2 = [];
  this.oldLen=0;

  // Edge Data 
  this.edgesv0 = null;
  this.edgesv1 = null;
  this.edgesf0 = null;
  this.edgesf1 = null;
  this.edgesEvert = null;
};


ParallelSubdivider.prototype.initParallel = function (){

  this.webCLController = new WebCLController();
  this.webCLController.InitWebCL();
  var kernels = this.webCLController.getKernels();
  // setting the Fp procedure 
  this.genFacePoints = kernels[0];
  // setting the Ep procedure
  this.genEdgePoints =kernels[1];
  // setting the Vp procedure
  this.genVertexPoints = kernels[2];
   

}
ParallelSubdivider.prototype.update_links = function(){
  
  var vertsEdges= [];
  var vertsFaces= [];
  for (var i = 0; i < this.verts.length/3; i++) {
    vertsEdges[i] =[];
    vertsFaces[i] =[];
    this.vertsNed[i]=0;
    this.vertsEdOffset[i] =0;
    this.vertsNfa[i] = 0;
  };

  var len = 4;

  var edgesf0 = [];
  var edgesf1= [];
  var edgesv0 = [];
  var edgesv1= [];
  var edgesevert= [];

  for (var i = 0; i < this.facesVs.length ; i++){
      var v0, v1, ei;
      v0 = this.facesVs[i];
      if((i+1)%len===0)
        v1 = this.facesVs[i-3];
      else 
        v1 = this.facesVs[i+1];
      vertsFaces[v0].push(Math.floor(i/4));
      this.vertsNfa[v0]+=1;
      ei = this.find_edge(vertsEdges,edgesv0,edgesv1,v0, v1);
      if (ei == -1) {
        edgesv0.push(v0);
        edgesv1.push(v1);
        edgesf0.push(Math.floor(i/4)); 
        edgesf1.push(-1);
        edgesevert.push(-1);
        ei = edgesevert.length - 1;
        vertsEdges[v0].push(ei);
        vertsEdges[v1].push(ei);
        this.vertsNed[v0]+=1;
        this.vertsNed[v1]+=1;
        } else {
          edgesf1[ei]=Math.floor(i/4);
        }
  }
  // ok vertsEdges
  // ok vertsFaces
  for(var i = 1; i < this.vertsNed.length; i++) {
    this.vertsEdOffset[i]=this.vertsNed[i]+this.vertsEdOffset[i-1];
  }

  var vertsEdOffset=[];
  vertsEdOffset[0] =3;
  for (var i =1 ; i<this.vertsNed.length-1;i++){
    vertsEdOffset[i]=this.vertsNed[i]+vertsEdOffset[i-1];
  }
  vertsEdOffset = [0].concat(vertsEdOffset);
  this.vertsEdOffset2=vertsEdOffset;

  this.vertsEdges=new Int32Array(flatList(vertsEdges));
  this.vertsFaces=new Int32Array(flatList(vertsFaces)); 

  this.edgesv0 = new Int32Array(edgesv0);
  this.edgesv1 = new Int32Array(edgesv1);
  this.edgesf0 = new Int32Array(edgesf0);
  this.edgesf1 = new Int32Array(edgesf1);
  this.edgesEvert = new Int32Array(edgesevert);

}

ParallelSubdivider.prototype.find_edge= function(vertsEdges,edgesv0,edgesv1,v0, v1){
 var ei ,v , v_0,v_1;
  v=vertsEdges[v0];
  for (var i = 0; i < v.length; i++) {
    ei =v[i];
    v_0 = edgesv0[ei];
    v_1 = edgesv1[ei];
    if ((v_0 == v0 && v_1 == v1) ||  (v_0 == v1 && v_1 == v0))
      return ei;
  };
 return -1;
}
ParallelSubdivider.prototype.get_edge= function(v0, v1){
  var ei , v_0,v_1, offset ;
  offset =this.vertsEdOffset2[v0];
  for (var i = 0; i < this.vertsNed[v0]; i++) {

    ei =this.vertsEdges[(offset)+i];
    v_0 = this.edgesv0[ei];
    v_1 = this.edgesv1[ei];
    if ((v_0 == v0 && v_1 == v1) ||  (v_0 == v1 && v_1 == v0))
      return ei;
  };
 return -1;
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
  this.vertForFace =nr_verts;


  this.facesVs = new Int32Array(facesVs);
  this.facesFvert = new Int32Array(facesFvert);

  /* Create edges */
  this.update_links();
}


ParallelSubdivider.prototype.do_iteration= function(last_iteration){

  this.initParallel();
  console.log("-----Start-----");
  // FacePoint Procedure
  var tFPStart = new Date().valueOf();
  this.genFacePoints.SetData([this.facesVs,this.facesFvert,this.verts,this.vertForFace]);
  this.genFacePoints.RunProgram();
  var tFPEnd = new Date().valueOf();
  var ris =this.genFacePoints.GetResults();
  this.oldLen=this.verts.length/3;
  this.verts= Float32Concat(this.verts,ris[0]);
  this.facesFvert = ris[1];

  // EdgePoint Procedure
  var tEPStart = new Date().valueOf();
  this.genEdgePoints.SetData([this.facesFvert,this.verts,this.edgesv0, this.edgesv1, this.edgesf0, this.edgesf1]);
  this.genEdgePoints.RunProgram();
  var tEPEnd = new Date().valueOf();
  ris =this.genEdgePoints.GetResults();
  this.verts= Float32Concat(this.verts, ris[0]);
  this.edgesEvert=ris[1];

  // VertexPoint Procedure
  
  var tVPStart = new Date().valueOf();
  this.genVertexPoints.SetData([this.facesFvert,this.verts, this.vertsFaces ,this.vertsEdges,this.edgesv0, this.edgesv1,this.vertsNed, this.vertsEdOffset2, this.vertsNfa ,this.oldLen]);
  this.genVertexPoints.RunProgram();
  var tVPEnd = new Date().valueOf();
  ris =this.genVertexPoints.GetResults();
  ccco= ris[0];
  this.verts =ris[0];
 
  console.log(tFPEnd-tFPStart ," ms for genFacePoints");
  console.log(tEPEnd-tEPStart ," ms for genEdgePoints");
  // console.log(tVPEnd-tVPStart ," ms for genVertexPoints");
  console.log("-----End-----");

  var new_face;
  var e0Ev;
  var e1Ev;
  var v0,v,v1;
  var facesVs=[];
  var facesFvert= []
  var kkk;

   /*2. Create new faces */
   // a new face has always 4 verts 
  for (j = 0; j < this.facesVs.length; j++) {
    v0 = this.facesVs[(4*Math.floor(j/4))+(j-1+4)%4];
    v = this.facesVs[(4*Math.floor(j/4))+j%4];
    v1 = this.facesVs[(4*Math.floor(j/4))+(j+1)%4];
    e0Ev = this.edgesEvert[this.get_edge( v0, v)];
    e1Ev = this.edgesEvert[this.get_edge( v, v1)];
    //console.log(v0,v,v1);
    facesVs.push(e0Ev);
    facesVs.push(v);
    facesVs.push(e1Ev);
    facesVs.push(this.facesFvert[Math.floor(j/4)]);
    facesFvert.push(-1);
  };
  this.facesFvert=new Int32Array(facesFvert);
  this.facesVs= new Int32Array(facesVs);
  facesVs= null;
  /* 3. Update edges */
  if (!last_iteration) { /* Skip on last iteration */
    this.update_links();
  }
}


ParallelSubdivider.prototype.subdivide_levels = function(mesh,nr_levels){
  var levels=[];
  this.init(mesh);
  for (i = 0; i < nr_levels; i++) {
    this.do_iteration( i==nr_levels - 1 );
    levels[i] = this.convert();
  }
  this.destroy();
  return levels;
}

ParallelSubdivider.prototype.convert=function(){
  var i, j , vi;
  var face ;
  var mesh = new Mesh();

   mesh.vertexbuf =this.verts;
  // probably some problems 
  for (i = 0; i < this.facesVs.length/4; i++){
      mesh.begin_face();
      for (j = 0; j < 4; j++) {
        mesh.add_index(this.facesVs[4*i+j], -1);
     };
  }
  mesh.compute_normals();
  return mesh;
}

ParallelSubdivider.prototype.destroy =function(){
  // cleaning verts
  this.verts=null;
  this.vertsEdges = null;
  this.vertsFaces = null;
  // cleaning edges
  this.edgesEvert = null;
  this.edgesf0 = null;
  this.edgesf1 = null;
  this.edgesv0 = null;
  this.edgesv1 = null;
  // cleaning faces
  this.facesFvert = null;
  this.facesVs = null;
  // cleaning procedures
  this.webCLController.cleanWebCL();
  this.webCLController=null;
  this.genEdgePoints = null;
  this.genFacePoints = null;
  this.genVertexPoints = null;
}



function Float32Concat(first, second)
{
    var firstLength = first.length;
    var result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}
function flatList(listOfLists){

  return listOfLists.reduce(function(previousValue, currentValue, index, array){  
  return previousValue.concat( currentValue);}, [])
}


})(this);

