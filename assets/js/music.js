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
	VolumeRel(parseInt(-incr*4))
}

function volume_up(){
	VolumeRel(parseInt(incr*4))
}

function startMusic(){

	HandleAction('playnow')
}

function stop(){
	HandleAction('stop')
}
