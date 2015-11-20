setCustomVolume();
DrawPlayer(0, gPlayerColor);
var scaled_valume;

function setCustomVolume()
{
	var v = GetCookieVolume();

	SetVolumeRanges(parent.GetPlayer());
	scaled_valume = gProgressIncr;
	VolRange = gMaxVol - gMinVol;
	gOffCells = Math.floor(Math.abs((VolRange-Math.abs(v))/scaled_valume));

}

HandleAction('playnow')

document.write(s);

function volume_down(){
	console.log("volume_down called")
	VolumeAbs(parseInt(scaled_valume*1.5),false)
}

function volume_up(){

	console.log("volume_up called")
	VolumeAbs(parseInt(scaled_valume*5),false)
}

function startMusic(){
	var mute;

	mute = GetMute();
	SetMute(!mute);
}

function stop(){
	var mute;

	mute = GetMute();
	SetMute(!mute);
}
