
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

// function loadObj(ctx, url)
// {
//     var obj = { loaded : false };
//     obj.ctx = ctx;
//     var req = new XMLHttpRequest();
//     req.obj = obj;
//     g_loadingObjects.push(req);
//     req.onreadystatechange = function () { processLoadObj(req) };
//     req.open("GET", url, true);
//     req.send(null);
//     return obj;
// }
// function processLoadObj(req)
// {
//     log("req="+req)
//     // only if req shows "complete"
//     if (req.readyState == 4) {
//         g_loadingObjects.splice(g_loadingObjects.indexOf(req), 1);
//         doLoadObj(req.obj, req.responseText);
//     }
// }

// Model.prototype.readFile2 = function(url){
//   var req = new XMLHttpRequest();
//   req.onreadystatechange = function () { processLoadObj(req) };
//   req.open("GET", url, true);
//   req.send(null);
// }

// function processLoadObj(req)
// {
//     log("req="+req)
//     // only if req shows "complete"
//     if (req.readyState == 4) {
//         g_loadingObjects.splice(g_loadingObjects.indexOf(req), 1);
//         doLoadObj(req.responseText);
//     }
// }

// function doLoadObj(text)
// {
//   vertexArray = [ ];
//   normalArray = [ ];
//   textureArray = [ ];
//   indexArray = [ ];

//   var vertex = [ ];
//   var normal = [ ];
//   var texture = [ ];
//   var facemap = { };
//   var index = 0;

//   var lines = text.split("\n");
//   for (var lineIndex in lines) {
//     var line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");
//     // ignore comments
//     if (line[0] == "#")
//       continue;
//     var array = line.split(" ");
//     else if (array[0] == "v") {
//       // vertex
//       vertex.push(parseFloat(array[1]));
//       vertex.push(parseFloat(array[2]));
//       vertex.push(parseFloat(array[3]));
//     }
//     else if (array[0] == "vt") {
//       // normal
//       texture.push(parseFloat(array[1]));
//       texture.push(parseFloat(array[2]));
//     }
//     else if (array[0] == "vn") {
//       // normal
//       normal.push(parseFloat(array[1]));
//       normal.push(parseFloat(array[2]));
//       normal.push(parseFloat(array[3]));
//     }
//     else if (array[0] == "f") {
//       // face
//       if (array.length != 4) {
//         console.log("*** Error: face '"+line+"' not handled");
//         continue;
//       }
//       for (var i = 1; i < 4; ++i) {
//         if (!(array[i] in facemap)) {
//           // add a new entry to the map and arrays
//           var f = array[i].split("/");
//           var vtx, nor, tex;

//           if (f.length == 1) {
//             vtx = parseInt(f[0]) - 1;
//             nor = vtx;
//             tex = vtx;
//           }
//           else if (f.length = 3) {
//             vtx = parseInt(f[0]) - 1;
//             tex = parseInt(f[1]) - 1;
//             nor = parseInt(f[2]) - 1;
//           }
//           else {
//             obj.ctx.console.log("*** Error: did not understand face '"+array[i]+"'");
//             return null;
//           }
//           // do the vertices
//           var x = 0;
//           var y = 0;
//           var z = 0;
//           if (vtx * 3 + 2 < vertex.length) {
//               x = vertex[vtx*3];
//               y = vertex[vtx*3+1];
//               z = vertex[vtx*3+2];
//           }
//           vertexArray.push(x);
//           vertexArray.push(y);
//           vertexArray.push(z);

//           // do the textures
//           x = 0;
//           y = 0;
//           if (tex * 2 + 1 < texture.length) {
//               x = texture[tex*2];
//               y = texture[tex*2+1];
//           }
//           textureArray.push(x);
//           textureArray.push(y);

//           // do the normals
//           x = 0;
//           y = 0;
//           z = 1;
//           if (nor * 3 + 2 < normal.length) {
//             x = normal[nor*3];
//             y = normal[nor*3+1];
//             z = normal[nor*3+2];
//           }
//           normalArray.push(x);
//           normalArray.push(y);
//           normalArray.push(z);

//           facemap[array[i]] = index++;
//         }

//       indexArray.push(facemap[array[i]]);
//     }
// }
//     }

// }

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

    // Skip empty or comment lines.
    //
    // if (!str || str[0] == "\0" || str[0] == "#")
    //   continue;
    // if (str[0] == 'g' || str[0] == 'o' || str[0] == 's' || strcmp(str, "usemtl") == 0 || strcmp(str, "mtllib") == 0)
    //   continue;


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

//
// loadObj
//
// Load a .obj file from the passed URL. Return an object with a 'loaded' property set to false.
// When the object load is complete, the 'loaded' property becomes true and the following
// properties are set:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//


// function doLoadObj(obj, text)
// {
//     vertexArray = [ ];
//     normalArray = [ ];
//     textureArray = [ ];
//     indexArray = [ ];

//     var vertex = [ ];
//     var normal = [ ];
//     var texture = [ ];
//     var facemap = { };
//     var index = 0;

//     // This is a map which associates a range of indices with a name
//     // The name comes from the 'g' tag (of the form "g NAME"). Indices
//     // are part of one group until another 'g' tag is seen. If any indices
//     // come before a 'g' tag, it is given the group name "_unnamed"
//     // 'group' is an object whose property names are the group name and
//     // whose value is a 2 element array with [<first index>, <num indices>]
//     var groups = { };
//     var currentGroup = [-1, 0];
//     groups["_unnamed"] = currentGroup;

//     var lines = text.split("\n");
//     for (var lineIndex in lines) {
//         var line = lines[lineIndex].replace(/[ \t]+/g, " ").replace(/\s\s*$/, "");

//         // ignore comments
//         if (line[0] == "#")
//             continue;

//         var array = line.split(" ");
//         if (array[0] == "g") {
//             // new group
//             currentGroup = [indexArray.length, 0];
//             groups[array[1]] = currentGroup;
//         }
//         else if (array[0] == "v") {
//             // vertex
//             vertex.push(parseFloat(array[1]));
//             vertex.push(parseFloat(array[2]));
//             vertex.push(parseFloat(array[3]));
//         }
//         else if (array[0] == "vt") {
//             // normal
//             texture.push(parseFloat(array[1]));
//             texture.push(parseFloat(array[2]));
//         }
//         else if (array[0] == "vn") {
//             // normal
//             normal.push(parseFloat(array[1]));
//             normal.push(parseFloat(array[2]));
//             normal.push(parseFloat(array[3]));
//         }
//         else if (array[0] == "f") {
//             // face
//             if (array.length != 4) {
//                 log("*** Error: face '"+line+"' not handled");
//                 continue;
//             }

//             for (var i = 1; i < 4; ++i) {
//                 if (!(array[i] in facemap)) {
//                     // add a new entry to the map and arrays
//                     var f = array[i].split("/");
//                     var vtx, nor, tex;

//                     if (f.length == 1) {
//                         vtx = parseInt(f[0]) - 1;
//                         nor = vtx;
//                         tex = vtx;
//                     }
//                     else if (f.length = 3) {
//                         vtx = parseInt(f[0]) - 1;
//                         tex = parseInt(f[1]) - 1;
//                         nor = parseInt(f[2]) - 1;
//                     }
//                     else {
//                         obj.ctx.console.log("*** Error: did not understand face '"+array[i]+"'");
//                         return null;
//                     }

//                     // do the vertices
//                     var x = 0;
//                     var y = 0;
//                     var z = 0;
//                     if (vtx * 3 + 2 < vertex.length) {
//                         x = vertex[vtx*3];
//                         y = vertex[vtx*3+1];
//                         z = vertex[vtx*3+2];
//                     }
//                     vertexArray.push(x);
//                     vertexArray.push(y);
//                     vertexArray.push(z);

//                     // do the textures
//                     x = 0;
//                     y = 0;
//                     if (tex * 2 + 1 < texture.length) {
//                         x = texture[tex*2];
//                         y = texture[tex*2+1];
//                     }
//                     textureArray.push(x);
//                     textureArray.push(y);

//                     // do the normals
//                     x = 0;
//                     y = 0;
//                     z = 1;
//                     if (nor * 3 + 2 < normal.length) {
//                         x = normal[nor*3];
//                         y = normal[nor*3+1];
//                         z = normal[nor*3+2];
//                     }
//                     normalArray.push(x);
//                     normalArray.push(y);
//                     normalArray.push(z);

//                     facemap[array[i]] = index++;
//                 }

//                 indexArray.push(facemap[array[i]]);
//                 currentGroup[1]++;
//             }
//         }
//     }




})(this);
