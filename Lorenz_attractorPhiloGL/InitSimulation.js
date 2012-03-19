
function InitParticlesOnFountain() {
    for (var i=0; i < NBODY; i++)  {
        var x = Math.sin(i* 2.001* Math.PI / NBODY);
        x*= Math.random() / 3. + .2;
        var y = Math.cos(i* 2.001* Math.PI / NBODY);
        y*= Math.random() / 3. + .2;
        var z = 0;
        var w = 1;

        var vx = x * 2;
        var vy = y * 2;
        var vz = 3;
        var vw = Math.random();

        InitParticle(i, x, y, z, w, vx, vy, vz, vw);
    }
}


function InitParticle(i, x, y, z, w, vx, vy, vz, vw) {
    var curPos = userData.curPos;
    var curVel = userData.curVel;
    var ii = 4*i;
    
    curPos[ii + 0] = x;
    curPos[ii + 1] = y;
    curPos[ii + 2] = z;
    curPos[ii + 3] = w;

    curVel[ii + 0] = vx;
    curVel[ii + 1] = vy;
    curVel[ii + 2] = vz;
    curVel[ii + 3] = vw;


    var genPos =userData.genPos;
    var genVel =userData.genVel;

    genPos[ii + 0] = x;
    genPos[ii + 1] = y;
    genPos[ii + 2] = z;
    genPos[ii + 3] = w;

    genVel[ii + 0] = vx;
    genVel[ii + 1] = vy;
    genVel[ii + 2] = vz;
    genVel[ii + 3] = vw;


}




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
