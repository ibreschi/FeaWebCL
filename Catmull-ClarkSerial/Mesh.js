
!(function (exports){

exports.Mesh = function (){
  if (!(this instanceof Mesh)){
    return new Mesh();
  }

  this.vertexbuf = [];
  this.normalbuf = [];
  this.normalbuf2 = [];
  this.indexbuf = [];
  this.faces = [];
};


Mesh.prototype.destroy =function(){
  this.vertexbuf=null;
  this.normalbuf=null;
  this.faces=null;
  this.indexbuf=null;
  this= null;
}

Mesh.prototype.countVertex = function(){
  return this.vertexbuf.length /3;

}
Mesh.prototype.countFaces = function(){
  return this.faces.length;

}

Mesh.prototype.add_vertex= function(v)
{
  this.vertexbuf.push (v[0]);
  this.vertexbuf.push (v[1]);
  this.vertexbuf.push (v[2]);
}

Mesh.prototype.add_normal= function(n)
{
  this.normalbuf.push (n[0]);
  this.normalbuf.push (n[1]);
  this.normalbuf.push (n[2]);
}

Mesh.prototype.begin_face= function()
 {
   this.faces.push(this.indexbuf.length);
 }

Mesh.prototype.add_index= function(vi,ni)
{

  this.indexbuf.push(vi);
  this.normalbuf2.push(ni);
}

Mesh.prototype.face_vertex_count= function(face)
{
  var beg, end;

  beg = this.faces[face];
  end = face != this.faces.length - 1 ?
     this.faces[face +1] : this.indexbuf.length;
  return end - beg;
}


// returns a vector [vi,ni]
Mesh.prototype.face_vertex_index= function(face, vert)
{
  var beg,idx;
  beg = this.faces[face];
  vertex_idx = this.indexbuf[beg + vert];
  normal_idx = this.normalbuf2[beg + vert];


  return [vertex_idx,normal_idx,normal_idx]
}
// deve ritornare un vettore
Mesh.prototype.get_vertex= function(face, vert){
  var vi;

  vi = this.face_vertex_index(face, vert)[0];
  var ris = [this.vertexbuf[vi*3],this.vertexbuf[vi*3+1],this.vertexbuf[vi*3+2]]

  return ris;
}
// deve ritornare un vettore
Mesh.prototype.get_normal= function(face,  vert){
  var ni;
  ni =this.face_vertex_index(face, vert)[1];
  var ris = [this.normalbuf[ni*3],this.normalbuf[ni*3+1],this.normalbuf[ni*3+2]]
  return ni != -1 ? ris : null;
}


Mesh.prototype.compute_normals= function() {
  var nr_faces, nr_verts, idx;
  var v0,v1,v2,vn;


  for (var k = 0; k < this.indexbuf.length; k++) {
    this.normalbuf2[k]= this.indexbuf[k];
  };
  var u,v,n;
  nr_faces = this.faces.length;
  for (var i = 0; i < nr_faces; i++) {
    nr_verts = this.face_vertex_count(i);
    for (var j = 0; j < nr_verts; j++) {
      u=[];
      v=[];
      n=[];
      v0 = this.get_vertex( i, j);
      v1 = this.get_vertex( i, (j + 1) % nr_verts);
      v2 = this.get_vertex( i, (j + nr_verts - 1) % nr_verts);
      vec_sub(u,v1, v0);
      vec_sub(v,v2, v0);
      vec_cross(n,u, v);
      vec_normalize(n,n);

      vn = this.get_normal( i, j);
      vec_add(vn,vn, n);
    }
  }

  for (i = 0; i < this.normalbuf.length; i += 3) {
    n = this.normalbuf + i;
    vec_normalize(n, n);
  }
}

// Mesh.prototype.printMesh= function(){
//   var i, nr_faces;
//   nr_faces = this.countFaces();

//   for (i = 0; i < nr_faces; i++) {
//     var j, nr_verts;
//     nr_verts = this.face_vertex_count(i);
//     console.log(nr_verts);
//     for (j = 0; j < nr_verts; j++) {
//       var v;
//       v = this.get_normal(i, j);
//       if (v)
//         console.log("Normal ",v[0],v[1],v[2] );
//       v = this.get_vertex(i, j);
//       console.log("point ",v[0],v[1],v[2] );
//     }
//   }

//}

})(this);



