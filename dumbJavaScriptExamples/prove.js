Linea (a,b,c)

var Linea = function (a){
	if (!(this instanceof Linea)){
		return new Linea(a);
	}

	this.a =a;

};




Linea.prototype.init = function (){ 
	console.log(this.a); 
	this.a =2; 
	console.log(this.a); 
	var Linea.loadFun= function(){ 
		// da qui voglio accedere ad a
	 	console.log(this); 
	 	this.a=4;
	}
	loadFun();
}




Linea.prototype.print2 = function(){
	return this.a+this.b+this.c;
}


Linea.print();
Point.prototype.getDistance = function (x){
 	if(x instanceof Point){
 		return this.getDistanceFromPoint(x);
 	}
 	if(x instanceof Line){
 		return this.getDistanceFromLine(x);
	}
	throw new Error("x non è una istanza di linea o punto");

	try {
		p.getDistance();
	}
	catch(e){
		console.error("miao");
	}
}

l1 = new Linea(1,2,3);


Triangle.prototype.above  = function (linea){
		if(this.points.every(getDistance()))
			return false;
	return true;
		
	};

}




!(function (public){
var a = 1;
var b = 2;

public.f1 = function(){

}
}(this));


this.f1;



