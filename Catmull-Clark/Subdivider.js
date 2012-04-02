




!(function (exports){

sdVertex = function (){
	if (!(this instanceof sdVertex)){
    return new sdVertex();
  }
  this.vectorP = null;
  this.vectorNewP = null;
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
	var i, levels;
	this.init(mesh);
	// for (i = 0; i < nr_levels; i++) {
	// 	this.do_iteration( i == nr_levels - 1);
	// 	levels[i] = this.convert();
	// }

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
    this.faces[i].vs=[];
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
	//buf_resize(this.verts, nr_verts);
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
        //something to do
        edge.f0 = i;
        edge.f1 = -1;
        edge.evert = -1;
        this.edges.push(edge);
        ei = this.edges.length - 1;
        this.verts[v0].edges.push( ei);
        this.verts[v1].edges.push( ei);
      } else {
        //assert(this.edges[ei].f1 == -1);
        this.edges[ei].f1 = i;
      }
    }
  }

//edge.v0,edge.v1 ,edge.f0,edge.f1,edge.evert
// 0 ,1 ,0 ,3 ,-1  
// 1 ,3 ,0 ,4 ,-1  
// 3 ,2 ,0 ,1 ,-1  
// 2 ,0 ,0 ,5 ,-1  
// 3 ,5 ,1 ,4 ,-1  
// 5 ,4 ,1 ,2 ,-1  
// 4 ,2 ,1 ,5 ,-1  
// 5 ,7 ,2 ,4 ,-1  
// 7 ,6 ,2 ,3 ,-1  
// 6 ,4 ,2 ,5 ,-1  
// 7 ,1 ,3 ,4 ,-1  
// 0 ,6 ,3 ,5 ,-1  
}


// 
Subdivider.prototype.find_edge= function(v0, v1){
 var ei ,v , e;
 v = this.verts[v0];
  for (var i = 0; i < v.edges.length; i++) {
    
    ei =v.edges[i]
    //console.log(ei);
    e = this.edges[ei];
    //console.log(e);
   if ((e.v0 == v0 && e.v1 == v1) || 
       (e.v0 == v1 && e.v1 == v0))
     return ei;
  };
 return -1;
}


// Subdivider.prototype.do_iteration= function(last_iteration)
// {
// 	int V, F, E, Vn, Fn, En;
// 	struct sd_face *faces = null;
// 	struct sd_vert *v;
// 	struct sd_face *f;
// 	struct sd_edge *e;
// 	int *vi, *fi, *ei;

// 	/* V' = V + F + E
// 	 * F' = Sum_i=0^F(f_i), (F' = 4F, when quad-mesh)
// 	 * E' = 2E + F'
// 	 */
// 	V = buf_len(this.verts);
// 	F = buf_len(this.faces);
// 	E = buf_len(this.edges);
// 	Vn = V + F + E;
// 	if (this.first_iteration) {
// 		Fn = 0;
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 		buf_foreach(f, this.faces)
// 			Fn += buf_len(f->vs);
// 		this.first_iteration = 0;
// 	} else {
// 		/* After the first iteration all faces are quads */
// 		Fn = 4 * F;
// 	}
// 	En = 2 * E + Fn;

// 	/* 1. Update vertices */
// 	buf_reserve(this.verts, Vn);

// 	/* Create face vertices */
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 	buf_foreach(f, this.faces) {
// 		vector p;

// 		vec_zero(p);
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 		buf_foreach(vi, f->vs)
// 			vec_add(p, p, this.verts[*vi].p);
// 		vec_mul(p, 1.0f / buf_len(f->vs), p);
// 		f->fvert = this.add_vert( p);
// 	}

// 	/* Create edge vertices */
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 	buf_foreach(e, this.edges) {
// 		vector p;

// 		assert(e->f1 != -1);
// 		vec_zero(p);
// 		vec_add(p, p, this.verts[e->v0].p);
// 		vec_add(p, p, this.verts[e->v1].p);
// 		vec_add(p, p, this.verts[this.faces[e->f0].fvert].p);
// 		vec_add(p, p, this.verts[this.faces[e->f1].fvert].p);
// 		vec_mul(p, 0.25f, p);
// 		e->evert = this.add_vert( p);
// 	}

// 	/* Move old vertices */
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 	buf_foreach(v, this.verts) {
// 		int n;
// 		vector p;

// 		if (sd_vi(v) >= V)
// 			break;

// 		assert(buf_len(v->fs) == buf_len(v->es));
// 		n = buf_len(v->fs);

// 		vec_copy(v->newp, v->p);
// 		vec_mul(v->newp, (float) (n - 2) / n, v->newp);

// 		vec_zero(p);
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 		buf_foreach(fi, v->fs)
// 			vec_add(p, p, this.verts[this.faces[*fi].fvert).p];
// 		vec_mad(v->newp, 1.0f / (n * n), p);
		
// 		vec_zero(p);
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 		buf_foreach(ei, v->es)
// 			vec_add(p, p, this.edge_other(&this.edges[*ei], v)->p);
// 		vec_mad(v->newp, 1.0f / (n * n), p);
// 	}

  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 	buf_foreach(v, this.verts) {
// 		if (sd_vi(v) >= V)
// 			break;
// 		vec_copy(v->p, v->newp);
// 	}

// 	/* 2. Create new faces */
// 	buf_reserve(faces, Fn);
  //(it, a) for ((it) = (a); (it) < (a) + buf_len(a); (it)++)
// 	buf_foreach(f, this.faces) {
// 		int j;
// 		for (j = 0; j < buf_len(f->vs); j++) {
// 			int v0, v, v1;
// 			struct sd_edge *e0, *e1;
// 			struct sd_face new_face;

// 			v0 = f->vs[(j - 1 + buf_len(f->vs)) % buf_len(f->vs)];
// 			v  = f->vs[j];
// 			v1 = f->vs[(j + 1) % buf_len(f->vs)];
// 			e0 = &this.edges[this.find_edge( v0, v)];
// 			e1 = &this.edges[this.find_edge( v, v1)];

// 			new_face.vs = NULL;
// 			buf_reserve(new_face.vs, 4);
// 			buf_push(new_face.vs, e0->evert);
// 			buf_push(new_face.vs, v);
// 			buf_push(new_face.vs, e1->evert);
// 			buf_push(new_face.vs, f->fvert);
// 			new_face.fvert = -1;

// 			buf_push(faces, new_face);
// 		}
// 	}
// 	SWAP(struct sd_face *, this.faces, faces);
// 	buf_free(faces);

// 	/* 3. Update edges */
// 	if (!last_iteration) {	/* Skip on last iteration */
// 		buf_reserve(this.edges, En);
// 		this.update_links();
// 	}
// }




// sd_v(vi)		(this.verts[vi])
// sd_f(fi)		(this.faces[fi])
// sd_e(ei)		(this.edges[ei])
// sd_vi(v)		((int)((v) - this.verts))
// sd_fi(f)		((int)((f) - this.faces))
// sd_ei(e)		((int)((e) - this.edges))



// Subdivider.prototype.add_vert= function( vector p){
// 	var v = new sdVertex();
// 	v.vectorP= p;
// 	v.es = null;
// 	v.fs = null;
// 	this.verts.push(v);
// 	return this.verts.length - 1;
// }

// Subdivider.prototype.edge_other = function (struct sd_edge *e, struct sd_vert *v) {
// 	int vi;
// 	vi = sd_vi(v);
// 	assert(e->v0 == vi || e->v1 == vi);
// 	return &this.verts[e->v0 == vi ? e->v1 : e->v0];
// }







// Subdivider.prototype.convert=function(){
// 	var i, j , vi;

// 	var mesh = new Mesh();
// 	for (i = 0; i < this.verts.length; i++)
// 		mesh.add_vertex(this.verts[i].p);

// 	for (i = 0; i < this.faces.length; i++){
// 		mesh.begin_face();
// 		for (j = 0; j < this.faces.length; i++)
// 		for ((vi) = (f.vs); (vi) < (this.vs) + this.vs.length; (vi)++)
// 			mesh.add_index(j, -1);
// 		mesh.end_face();
// 	}
// 	mesh.compute_normals();
// 	return mesh;
// }


})(this);

