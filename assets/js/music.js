setCustomVolume();
DrawPlayer(0, gPlayerColor);
var incr;

function setCustomVolume()
{
	var v = GetCookieVolume();

	SetVolumeRanges(parent.GetPlayer());
	incr = gProgressIncr;
	VolRange = gMaxVol - gMinVol;
	gOffCells = Math.floor(Math.abs((VolRange-Math.abs(v))/incr));

}

HandleAction('playnow')

document.write(s);

function volume_down(){
	console.log("volume_down called")
	VolumeRel(parseInt(-incr*4))
}

function volume_up(){

	console.log("volume_up called")
	VolumeRel(parseInt(incr*4))
}

function startMusic(){

	HandleAction('playnow')
}

function stop(){
	HandleAction('stop')
}
