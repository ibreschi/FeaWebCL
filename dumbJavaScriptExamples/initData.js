var NBODY =10;

var Data2 = function(){
    if (!(this instanceof Data)){
        return new Data();
    }
    this.curPos=[];
    this.curVel=[];
    this.curCol=[];
};
var userData = new Data2();

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

        var cx = 1;
        var cy = 1;
        var cz = 0;
        var cw = 1;


        InitParticle(i, x, y, z, w, vx, vy, vz, vw, cx, cy, cz, cw);
    }
}


function InitParticle(i, x, y, z, w, vx, vy, vz, vw, cx, cy, cz, cw) {
    var curPos = userData.curPos;
    var curVel = userData.curVel;
    var curCol = userData.curCol;
    var ii = 4*i;
    
    curPos[ii + 0] = x;
    curPos[ii + 1] = y;
    curPos[ii + 2] = z;
    curPos[ii + 3] = w;
    
    curVel[ii + 0] = vx;
    curVel[ii + 1] = vy;
    curVel[ii + 2] = vz;
    curVel[ii + 3] = vw;

    curCol[ii + 0] = cx;
    curCol[ii + 1] = cy;
    curCol[ii + 2] = cz;
    curCol[ii + 3] = cw;

}

InitParticlesOnFountain();
