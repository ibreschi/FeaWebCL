
var test ;
!(function (exports){

exports.Model = function (){
  if (!(this instanceof Model)){
    return new Model();
  }
  this.meshes = [];
  this.cur_level = 0;
  this.nr_levels= 0;
  this.file = null;
  this.text=null;
  this.stats = {
    vs: [],
    fs: []
  };
};

Model.prototype.readFile = function(file){
  var lines ,allText;
  function getFile(sURL){
    var oXHR = new XMLHttpRequest();  
    // synchronous request  
    oXHR.open("GET", sURL, false);  
    oXHR.send(null);  
    return oXHR.responseText.split("\n");  
  }

  this.text= getFile(file);

  if (!(this.text)){
    return null;
  }
  var v;
  var line;
  var value;
  var has_normals = 0;
  var mesh = new Mesh();
  // for all line of the text
  for (var i = 0; i < this.text.length; i++) {
    line = this.text[i];
    if (line[0]=="v" && line[1]!=="n") {
      /* Vertex command */
      values =getValues(line);
      mesh.add_vertex(values);
    } else if (line[0]=="v" && line[1]=="n" ) {
      /* Normal command */
      values =getValues(line); 
      mesh.add_normal(values);
      } else if (line[0]==="f") {
        /* Face command */
        mesh.begin_face();
        vi = ti = ni = 0;
        values = getFaces(line);
        if(values[0].split("/").length==3){
          has_normals = 1;
        }
        for (var k = 0; k < values.length; k++) {
            v =values[k].split("/");
            mesh.add_index( v[0] - 1, v[2] - 1);
        };
      }
  };
  if (!has_normals)
    mesh.compute_normals();
  return mesh;
}
function getValues(line){
  var vec=[];
  vec= line.split(" ");
  vec.shift(1);
  var mapResult =vec.map(function(item){
    return Number(item);
  })
  return mapResult;
}

function getFaces(line){
  var vec=[];
  vec= line.split(" ");
  vec.shift(1);

  return vec;
}

})(this);
