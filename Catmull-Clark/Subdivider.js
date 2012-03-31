



!(function (exports){

sdVertex = function (){
	if (!(this instanceof sdVert)){
    return new sdVert();
  }
  this.vectorP = null;
  this.vectorNewP = null;
  this.es =[];
  this.fs =[];
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
  this.fvert= null;
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
	//this.init(mesh);
	// for (i = 0; i < nr_levels; i++) {
	// 	this.do_iteration( i == nr_levels - 1);
	// 	levels[i] = this.convert();
	// }

	// this.destroy();
	return levels;
}


// Subdivider.prototype.init = function(mesh){
// 	var i, j, nr_verts, nr_faces;
// 	var vbuf;
// 	var f;
// 	var vidx, nidx;
// 	struct sd_vert *v;

// 	this.first_iteration = 1;
// 	this.verts = null;
// 	this.faces = null;
// 	this.edges = null;

// 	/* Create vertices */
	
// 	vbuf = mesh.vertexbuf;
// 	nr_verts = vbuf.length;
// 	buf_resize(this.verts, nr_verts);
// 	for ((v) = (this.verts); (v) < (this.verts) + this.verts.length; (v)++)	{
// 		v.p=vbuf;
// 		v.es = null;
// 		v.fs = null;
// 		vbuf += 3;
// 	}

// 	/* Create faces */
// 	nr_faces = mesh.faces.length;
// 	for (i = 0; i < nr_faces; i++) {
// 		f = this.faces[i];
// 		f.vs = null;
// 		f.fvert = -1;
// 		nr_verts = mesh.face_vertex_count(i);
// 		for (j = 0; j < nr_verts; j++) {
// 			vidx =mesh.face_vertex_index(i, j)[0];
// 			f.vs.push( vidx);
// 		}
// 	}
// 	/* Create edges */
// 	this.update_links();
// }

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
// 	buf_foreach(f, this.faces) {
// 		vector p;

// 		vec_zero(p);
// 		buf_foreach(vi, f->vs)
// 			vec_add(p, p, this.verts[*vi].p);
// 		vec_mul(p, 1.0f / buf_len(f->vs), p);
// 		f->fvert = this.add_vert( p);
// 	}

// 	/* Create edge vertices */
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
// 		buf_foreach(fi, v->fs)
// 			vec_add(p, p, this.verts[this.faces[*fi].fvert).p];
// 		vec_mad(v->newp, 1.0f / (n * n), p);
		
// 		vec_zero(p);
// 		buf_foreach(ei, v->es)
// 			vec_add(p, p, this.edge_other(&this.edges[*ei], v)->p);
// 		vec_mad(v->newp, 1.0f / (n * n), p);
// 	}

// 	buf_foreach(v, this.verts) {
// 		if (sd_vi(v) >= V)
// 			break;
// 		vec_copy(v->p, v->newp);
// 	}

// 	/* 2. Create new faces */
// 	buf_reserve(faces, Fn);
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
// Subdivider.prototype.find_edge= function(v0, v1){
// 	var ei ,v , e;
// 	v = this.verts[v0];
// 	for ((ei) = (v.es); (ei) < (v.es) + v.es.length; (ei)++) {
// 		e = this.edges[ei];
// 		if ((e.v0 == v0 && e.v1 == v1) || (e.v0 == v1 && e.v1 == v0))
// 			return ei;
// 	}
// 	return -1;
// }

// Subdivider.prototype.edge_other = function (struct sd_edge *e, struct sd_vert *v) {
// 	int vi;
// 	vi = sd_vi(v);
// 	assert(e->v0 == vi || e->v1 == vi);
// 	return &this.verts[e->v0 == vi ? e->v1 : e->v0];
// }

// Subdivider.prototype.update_links= function(){
// 	struct sd_vert *v;
// 	struct sd_face *f;

// 	buf_foreach(v, this.verts) {
// 		buf_resize(v->fs, 0);
// 		buf_resize(v->es, 0);
// 	}

// 	buf_resize(this.edges, 0);
// 	buf_foreach(f, this.faces) {
// 		int j;
// 		for (j = 0; j < buf_len(f->vs); j++) {
// 			int v0, v1, ei;

// 			v0 = f->vs[j];
// 			v1 = f->vs[(j+1) % buf_len(f->vs)];
// 			buf_push(this.verts[v0].fs, sd_fi(f));
// 			ei = sd_find_edge(sd, v0, v1);
// 			if (ei == -1) {
// 				struct sd_edge edge;
// 				edge.v0 = v0;
// 				edge.v1 = v1;
// 				edge.f0 = sd_fi(f);
// 				edge.f1 = -1;
// 				edge.evert = -1;

// 				buf_push(this.edges, edge);
// 				ei = buf_len(this.edges) - 1;
// 				buf_push(this.verts[v0].es, ei);
// 				buf_push(this.verts[v1].es, ei);
// 			} else {
// 				assert(this.edges[ei].f1 == -1);
// 				this.edges[ei].f1 = sd_fi(f);
// 			}
// 		}
// 	}
// }


// Subdivider.prototype.destroy =function(){
// 	var i ,j;

// 	for (i = 0; i < this.verts.length; i++)
// 	{
// 		this.verts[i].es=[];
// 		this.verts[i].fs=[];
// 	}
// 	this.verts=[];

// 	for (j = 0; j < this.faces.length; j++)
// 		this.faces[i].vs=[];
// 	this.faces=[];
// 	this.edges=[];

// 	free(sd);
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

