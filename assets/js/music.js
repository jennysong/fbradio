var s = ''
memberName	= station_broadcaster;		// make sure player control and page agree on what station we're playing!
streamID	= stream_id;

if (player != "MP3") {					// Draw player; bypass check version/LS logic
	DrawPlayer(0, gPlayerColor);		// Draw the embedded audio playback control
}



HandleAction('playnow')


document.write(s);


