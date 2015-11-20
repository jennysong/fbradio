var s = ''
memberName	= station_broadcaster;		// make sure player control and page agree on what station we're playing!
streamID	= stream_id;

if (player != "MP3") {					// Draw player; bypass check version/LS logic
	//
	// Draw volume bar and player control for embedded players
	//
	setCustomVolume(bVertical, imageDir);		// Draw volume meter
	DrawPlayer(0, gPlayerColor);		// Draw the embedded audio playback control
}

//
// Last (only one on Mac) row has the VCR buttons.
//
function setCustomVolume(bVertical, imageDir)
{
	if (!ParentHasEmbeddedPlayer())
		return;

	if (bVertical == null)
		bVertical = false;
	
	var muteImage;
	var i;
	var colorTile;
	var incr;

	var v = GetCookieVolume();
	var Width = 15;
	var SpacerWidth = 15;
	var Height = 5;
	var SpacerHeight = 2;
	var imgHeight = 5;
	var coords="0,0,15,18" ;
	var MaxHeight = 15;
	var MinHeight = 7;
	var iCell = 0;
	var click;
	var ref;

	SetVolumeRanges(parent.GetPlayer());
	incr = gProgressIncr;
	VolRange = gMaxVol - gMinVol;
	gOffCells = Math.floor(Math.abs((VolRange-Math.abs(v))/incr));
    
    var volumedata = '<a name="Set Volume"></a>';
	var base = GetHostServer();


	volumedata += '<table width="138" border="0" cellspacing="0" cellpadding="0" height="28">';
	volumedata += '<tr>';
	volumedata += '<td colspan="7"><img src="http://' + base + '/images/dot.gif" width="163" height="6" vspace="0" hspace="0" border="0"></td>';
	volumedata += '</tr>';
	volumedata += '<tr> ';
	volumedata += '<td colspan="7"><img src="' + imageDir + cVolBoxTop + '" width="163" height="5" vspace="0" hspace="0" border="0"></td>';
	volumedata += '</tr>';
	volumedata += '<tr> ';
	volumedata += '<td width="3"><img src="' + imageDir + cVolBoxLeft + '" width="3" height="20" vspace="0" hspace="0" border="0"></td>';

	click = 'onclick="Mute(\'' + imageDir + '\');this.blur();return false;"';
	ref ='"#"';

	volumedata += '<td width="27">';
	volumedata += '<a href=' + ref + ' ' + click + ' tabindex="1"><img name="mute"  border="0" src="' + imageDir + cMuteOff + '" width="27" height="20" vspace="0" hspace="0" alt="Mute" title="Mute"></a></td>';
	volumedata += '<td width="6"><img src="' + imageDir + cVolBoxCtr + '" width="6" height="20" vspace="0" hspace="0" border="0"></td>';

	click = 'onclick="VolumeRel(' + parseInt(-incr)+ ');this.blur();return false;"';
	ref ='"#"';

	volumedata += '<td width="14"><a href=' + ref + ' ' + click + ' tabindex="2"><img src="' + imageDir + cVolDown + '" width="14" height="20" border="0" alt="Volume-Down" title="Volume-Down" vspace="0" hspace="0"></a></td>';
    volumedata += '<td cellspacing=0 align="center">';
	volumedata += '<table width="94"  border="0" cellspacing="0" cellpadding="0">';


	for (i = 0; i < cCells; i++) {
		if (!bVertical) {
			volumedata += '<td width='+Width+' valign="bottom" cellspacing=0>';
			iCell = cCells - i -1;
			//Height = 20 - 12 -6 + i;
		}
		else
			iCell = i;

		var vol = (gMaxVol - (iCell*incr));
		var volpct = Math.floor((Math.abs((Math.abs(vol)-Math.abs(gMinVol))/VolRange))*100);
		click = 'onClick="VolumeAbs(' + vol + ', false);this.blur();return false;"';
		ref ='"#"';

		colorTile = imageDir + ((iCell < gOffCells) ? cOffColor : cOnColor);
		volumedata += '<a href=' + ref + ' ' + click + ' tabindex="' + parseInt(3+i) + '"><img name="cell' + iCell + '"  src="' + colorTile + '" alt="Set Volume to '+ volpct +'%" title="Set Volume to '+ volpct +'%" border="0" width="'+Width+'" height="'+Height+'"></a>';

		if (bVertical)
			volumedata += '<br>';
		else
			volumedata += '</td>';

		if (bVertical)
			volumedata += '<a href=' + ref + ' ' + click + ' ><img src="http://' + base + '/images/dot.gif" alt="Set Volume to '+ volpct +'%" title="Set Volume to '+ volpct +'%" border="0" width="'+SpacerWidth+'" height="'+SpacerHeight+'"></a>';
		else {
			if (i != cCells-1)
				volumedata += '<td cellspacing=0  width='+SpacerWidth+'><a href=' + ref + ' ' + click + '><img src="http://' + base + '/images/dot.gif" alt="Set Volume to '+ volpct +'%" title="Set Volume to '+ volpct +'%" border="0" width="'+SpacerWidth+'" height="'+SpacerHeight+'"></a></td>';
		}

		if (bVertical)
			volumedata += '<br>';
	}

	if (bVertical) {
		volumedata += '<img src="' + imageDir + cVolDownVert + '" alt="Volume Down" title="Volume Down" width="15" height="18" border="0" usemap="#voldown"><br>';
		volumedata += '<map name="voldown"><area alt="Volume Down" href="#Set Volume" coords="0,0,15,18" onclick="VolumeRel(' + parseInt(-incr)+ ')"></map>';
		volumedata += '<img src="http://' + base + '/images/dot.gif" width="15" height="' + (parent.IsProSkinned() ? 15 : 5) +'" href=""><br>';
		muteImage = imageDir + (GetMute() ? cMuteOn : cMuteOff);
		volumedata += '<img name="mute" alt="Mute" title="Mute" src="' + muteImage + '" width="' + lMuteW + '" height="' + lMuteH + '" border=0 usemap="#volmute"><br>';
		volumedata += '<map name="volmute"><area href="#Set Volume" alt="Mute" coords="0,0,' + lMuteW + ',' + lMuteH + '" onclick="Mute(\''+imageDir+'\')"></map>';
		volumedata += '<br><img src="http://' + base + '/images/dot.gif" height="100" width="1"><br>';
	}
	else {
		click = 'onclick="VolumeRel(' + parseInt(incr)+ ');this.blur();return false;"';
		ref ='"#"';

		volumedata += '</table>';
		volumedata += '    </td>';
		volumedata += '<td width="14"><a href=' + ref + ' ' + click + ' tabindex="' + parseInt(3+cCells) + '"><img src="' + gSiteImageDir + cVolUp + '" width="14" height="20" alt="Volume-Up" title="Volume-Up" border="0" vspace="0" hspace="0"></a></td>';
		volumedata += '    <td width="3"><img src="' + imageDir + cVolBoxRight + '" width="3" height="20" vspace="0" hspace="0" border="0"></td>';
		volumedata += '  </tr>';
		volumedata += '  <tr> ';
		volumedata += '    <td colspan="7"><img src="' + imageDir + cVolBoxBot + '" width="163" height="3" vspace="0" hspace="0" border="0"></td>';
		volumedata += '  </tr></table>';
	}
	document.write(volumedata);

	if (parent.gTesting == 'R' && parent.GetPlayer() == 'FLASH3')
		document.write('<div id="pinkMsg" style="position:fixed;z-index:4;top:25px;padding:2px;font-size:10px;color:blue;background-color:pink;width:100%;height=auto">Sniffing for ads...</div>');
}



HandleAction('playnow')
//s += '<img alt="PLAY" src="" width="41" border="0" height="36" style="cursor:pointer; cursor:hand" onclick="HandleAction(\'playnow\')">';

//	if (player != 'MP3')
//		s += '<img alt="STOP" src="' + imageDir + 'radio-stop.gif" width="45" border="0" height="36" style="cursor:pointer; cursor:hand" onclick="HandleAction(\'stop\')">';
//HandleAction('stop')

document.write(s);
/*
// removing mute button
var myEl = document.getElementsByName("mute");
var elP = myEl[0].parentNode.parentNode;
elP.removeChild(myEl[0].parentNode);*/




function startMusic(){

	HandleAction('playnow')
}

function stop(){
	HandleAction('stop')	
}
