var Vector3 = function(){
	if (!(this instanceof Vector3)){
		return new Vector3();
	}
};

Vector3.prototype.dot = function(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
};

Vector3.prototype.scale = function(out, a, s) {
    out[0] = s * a[0];
    out[1] = s * a[1];
    out[2] = s * a[2];
};

Vector3.prototype.diff = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
};

Vector3.prototype.normalize = function(out, a) {
    var r = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
    out[0] = a[0]/r;
    out[1] = a[1]/r;
    out[2] = a[2]/r;
};

Vector3.prototype.cross = function(out, a, b) {
    out[0] = a[1]*b[2] - a[2]*b[1]; // a2b3 - a3b2
    out[1] = a[2]*b[0] - a[0]*b[2]; // a3b1 - a1b3
    out[2] = a[0]*b[1] - a[1]*b[0]; // a1b2 - a2b1
};

