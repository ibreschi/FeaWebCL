
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
