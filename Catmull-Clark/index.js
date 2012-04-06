var c = Controller();
c.InitController();

function Toggle3D(){
  c.Toggle3D();

}
function ToggleSimRunning(){
 c.ToggleSimRunning();
}
function NextModel(){
  c.next_model();
  
}
function PrevModel(){
  c.prev_model();
}
function NextLevel(){
  c.next_level();
}
function PrevLevel(){
  c.prev_level();
  
}
function ModeCL(){
	c.SetMode(false);
}
function ModeJS(){
	c.SetMode(true);
}
