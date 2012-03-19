!(function (public){


function f1(num){

	var pos = [1];
	var col = [2];	
	var vel = [3];
	return pos,col,vel;
}

function f2(num){
	var pos;
	var col;
	var vel
	pos,col,vel =f1(num)
	console.log(pos);
	console.log(pos,col,vel);
}


f2(2);

})(this);









