
!(function (public){
var buffer = new ArrayBuffer(16);

if (buffer.byteLength == 16) {  
  alert("Yes, it's 16 bytes.");  
} else {  
  alert("Oh no, it's the wrong size!");  
}  

var int32View = new Int32Array(buffer);  

for (var i=0; i<int32View.length; i++) {  
  int32View[i] = i*2;  
}  


}
}(this));






