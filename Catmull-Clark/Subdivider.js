
!(function (exports){
var adds =0;
sdVertex = function (){
	if (!(this instanceof sdVertex)){
    return new sdVertex();
  }
  this.vectorP = null;
  this.vectorNewP = [];
  this.edges =[];
  this.faces =[];
}

sdEdge = function (){
	if (!(this instanceof sdEdge)){
    return new sdEdge();
  }
  this.v0 = null;
  this.v1= null;
  this.f0=null;
  this.f1=null;
  this.evert = null;
}

sdFace = function (){
	if (!(this instanceof sdFace)){
    return new sdFace();
  }
  this.vs =[];
  this.fvert= -1;
}



exports.Subdivider = function (){
  if (!(this instanceof Subdivider)){
    return new Subdivider();
  }
  this.verts=[];
  this.faces=[];
  this.edges=[];
};


Subdivider.prototype.subdivide_levels= function(mesh,nr_levels){
	var last, levels=[];
	this.init(mesh);
	for (i = 0; i < nr_levels; i++) {
    this.do_iteration( i==nr_levels - 1 );
    levels[i] = this.convert();
	}

	//this.destroy();
	return levels;
}

Subdivider.prototype.destroy =function(){
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

Subdivider.prototype.init = function(mesh){
	var i, j, nr_verts, nr_faces;
	var vbuf;
	var f=[];
	var vidx, nidx;
	var Sub_vertices=[];
  var subVert;

	this.first_iteration = 1;

	/* Create vertices */
	
	vbuf = mesh.vertexbuf;
	nr_verts = mesh.countVertex();

  for (var i = 0; i < nr_verts; i++) {
    this.verts.push(new sdVertex());
    this.verts[i].vectorP=[vbuf[3*i],vbuf[3*i+1],vbuf[3*i+2]];
  };

	/* Create faces */
	nr_faces = mesh.faces.length;
	for (var k = 0; k < nr_faces; k++) {
		this.faces.push( new sdFace());
		nr_verts = mesh.face_vertex_count(k);
		for (j = 0; j < nr_verts; j++) {
			vidx =mesh.face_vertex_index(k, j)[0];
			this.faces[k].vs.push(vidx);
		}
	}
	/* Create edges */
	this.update_links();
}

Subdivider.prototype.update_links= function(){
  var Sub_vertices = [];
  var Sub_faces= [];
  var subFace;
  var edge;

  for (var i = 0; i < this.verts.length; i++) {
    this.verts[i].edges=[];
    this.verts[i].faces =[];
  };
  this.edges=[];


  for (var i = 0; i < this.faces.length ; i++){
    Sub_faces[i] = this.faces[i];
    for (var j = 0; j < Sub_faces[i].vs.length; j++) {

      var v0, v1, ei;

      v0 = Sub_faces[i].vs[j];
      
      v1 = Sub_faces[i].vs[(j+1) % Sub_faces[i].vs.length];
      this.verts[v0].faces.push(Sub_faces[i]);
      ei = this.find_edge(v0, v1);
      if (ei == -1) {
        edge =new sdEdge();
        edge.v0 = v0;
        edge.v1 = v1;
        edge.f0 = i;
        edge.f1 = -1;
        edge.evert = -1;
        this.edges.push(edge);
        ei = this.edges.length - 1;
        this.verts[v0].edges.push( ei);
        this.verts[v1].edges.push( ei);
      } else {
        this.edges[ei].f1 = i;
      }
    }
  }
}

Subdivider.prototype.find_edge= function(v0, v1){
 var ei ,v , e;
 v = this.verts[v0];
  for (var i = 0; i < v.edges.length; i++) {
    ei =v.edges[i];
    e = this.edges[ei];
   if ((e.v0 == v0 && e.v1 == v1) ||  (e.v0 == v1 && e.v1 == v0))
     return ei;
  };
 return -1;
}

Subdivider.prototype.do_iteration= function(last_iteration){
  var faces=[] ;
  var v;
  var f=[];
  var e = [];
  var vi =[];
  var fi;
  var ei= [];

	/* V' = V + F + E
	 * F' = Sum_i=0^F(f_i), (F' = 4F, when quad-mesh)
	 * E' = 2E + F'
	 */
  var V,F,E,Fn;
	V = this.verts.length;
	F = this.faces.length;
	E = this.edges.length;
  console.log(V,F,E);
  if (this.first_iteration) {
 	  Fn = 0;
    for (var i = 0; i < F; i++) {
      Fn += this.faces[i].vs.length;
    };
    this.first_iteration=0;
  }else {
    /* After the first iteration all faces are quads */
    Fn = 4 * F;
  }

	/* 1. Update vertices */
	/* Create face vertices */
    var face ,p,len;
    for (var i = 0; i < F; i++) {
      face =this.faces[i];
      p= [0,0,0];
      len = face.vs.length;
      for (var j = 0; j < len; j++) {
        vec_add(p,p,this.verts[face.vs[j]].vectorP);
      };
      vec_mul(p, (1.0 / len), p);
      face.fvert = this.add_vert(p);
    };

  /* Create edge vertices */
  for (var i = 0; i < E; i++) {
    p=[0,0,0];
    e = this.edges[i];

    vec_add(p, p, this.verts[e.v0].vectorP);
    vec_add(p, p, this.verts[e.v1].vectorP);
    vec_add(p, p, this.verts[this.faces[e.f0].fvert].vectorP);
    vec_add(p, p, this.verts[this.faces[e.f1].fvert].vectorP);
    vec_mul(p, 0.25, p);
    e.evert = this.add_vert(p);
    

  };

  var n,appog;
  /* Move old vertices */

  for (var i = 0; i < V; i++) {
    v =this.verts[i];

    if(i>=V)
      break;
    n= v.faces.length;
    vec_copy(v.vectorNewP, v.vectorP);
    appog=(n - 2) / n;
    vec_mul(v.vectorNewP, appog, v.vectorNewP);
    p= [0,0,0];
    for (var k = 0; k < v.faces.length; k++) {
      fi =this.faces.indexOf(v.faces[k]);
      var k=v.faces[k].fvert ;
      vec_add(p, p, this.verts[k].vectorP);
    };
    vec_mad(v.vectorNewP, 1.0 / (n * n), p);
    p= [0,0,0];
    for (var t = 0; t < v.edges.length; t++) {
      ei=v.edges[t];
      vec_add(p, p, this.edge_other(this.edges[ei], i).vectorP);
    };
    vec_mad(v.vectorNewP, 1.0 / (n * n), p);
  };

  for (var i = 0; i < V; i++) {
    v = this.verts[i];
    if (i >= V)
      break;
    vec_copy(v.vectorP, v.vectorNewP);
  };

  var new_face;
  var e0;
  var e1;
  var v0,v,v1;
  /* 2. Create new faces */
  for (var i = 0; i < F; i++) {
    f=this.faces[i]
    for (j = 0; j < f.vs.length; j++) {
      v0=f.vs[(j - 1 + f.vs.length) % f.vs.length];
      v  = f.vs[j];
      v1 = f.vs[(j + 1) % f.vs.length];
      e0 = this.edges[this.find_edge( v0, v)];
      e1 = this.edges[this.find_edge( v, v1)];
      
      new_face=new sdFace();
      new_face.vs.push(e0.evert);
      new_face.vs.push( v);
      new_face.vs.push( e1.evert);
      new_face.vs.push( f.fvert);
      new_face.fvert = -1;
      faces.push(new_face);
    };
  };
  this.faces=faces;
  faces=[];
  /* 3. Update edges */
  if (!last_iteration) {	/* Skip on last iteration */
    this.update_links();
  }
 }



Subdivider.prototype.add_vert= function(p){
	var v = new sdVertex();
	v.vectorP= p;
	this.verts.push(v);

  //console.log(adds++);
	return this.verts.length - 1;
}

Subdivider.prototype.edge_other = function (e,v) {
	var vi;
  vi =this.verts[v];
	return this.verts[e.v0 == vi ? e.v1 : e.v0];
}


Subdivider.prototype.convert=function(){
	var i, j , vi;
  var face ;
	var mesh = new Mesh();
	for (i = 0; i < this.verts.length; i++)
	 mesh.add_vertex(this.verts[i].vectorP);
	
  for (i = 0; i < this.faces.length; i++){
      face = this.faces[i];
      mesh.begin_face();
      for (var j = 0; j < face.vs.length; j++) {
        mesh.add_index(face.vs[i], -1);
     };
	}
  //	mesh.compute_normals();
	return mesh;
}


})(this);

