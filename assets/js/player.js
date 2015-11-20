// (c) 1999-2011 Live365, Inc.
// Depends on ajax.js, cookiemonster.js, version.js, vb_sniff_lite.js, hosts.js, clientdetect.js
var isStartPlay = false;
function GetHostServer()
{
	try {
		if (typeof(top.gHostServer) !== 'undefined') {
			return top.gHostServer;
		}
	}
	catch(e) {
	}

	return (1) ? "www.live365.com" : "devweb01.nanocosm.com";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POC data structures -- moved here from sniffer.js
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var POCInfo = {
	G2:
	{
		POC:1,
		PLAYERCODE:"G2",
		DESC:"Player365-Real",
		bEmbedded:true,
		downloadURL:"http://forms.real.com/real/realone/realone.html?type=eva",
		bDownloadURL: gRealOneDownloadURL,
		bShowIfNotInstalled: true,
		bShowIfNotSelected: true,
		bImageCode: '<img src='+gRealOneGraphic+' border="0" alt="Download/Select the RealOne Player" title="Download/Select the RealOne Player">'
	},
	WMP:
	{
		POC:2,
		PLAYERCODE:"WMP",
		DESC:"Player365-WMP",
		bEmbedded:true,
		downloadURL: null,
		bImageCode:" ",
    	bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	'365':
	{
		POC:3,
		PLAYERCODE:"365",
		DESC:"Player365",
		bEmbedded:true,
		downloadURL: null,
		bDownloadURL: gPlayer365DownloadURL,
		bShowIfNotInstalled: true,
		bShowIfNotSelected: true,
		bImageCode: '<img src='+gPlayer365Graphic+' border="0" alt="Download/Select Player365-Free" title="Download/Select Player365-Free">'
	},
	QT:
	{
		POC:4,
		PLAYERCODE:"QT",
		DESC:"QuickTime",
		bEmbedded:true,
		bImageCode: ' ',
		downloadURL: null,
		bDownloadURL: null,
		bShowIfNotInstalled: true,
		bShowIfNotSelected: true
	},
	HTML5:
	{
		POC:5,
		PLAYERCODE:"HTML5",
		DESC:"HTML5 Audio Player",
		bEmbedded:true,
		downloadURL: null,
		bImageCode:" ",
    	bDownloadURL: " ",
		bShowIfNotInstalled: true,
		bShowIfNotSelected: true
	},
	FLASH:
	{
		POC:7,
		PLAYERCODE:"FLASH",
		DESC:"Player365-Flash v2.0",
		bEmbedded:true,
		downloadURL: null,
		bImageCode:" ",
    	bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	FLASH3:
	{
		POC:8,
		PLAYERCODE:"FLASH3",
		DESC:"Player365-Flash v3.0 (beta)",
		bEmbedded:true,
		downloadURL: null,
		bImageCode:" ",
    	bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	'365_VIP':
	{
		POC:9,
		PLAYERCODE:"365_VIP",
		DESC:"Player365-VIP",
		bEmbedded:true,
		downloadURL: null,
		bDownloadURL: null,
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	MP3:
	{
		POC:10,
		PLAYERCODE:"MP3",
		DESC:"MP3 Player",
		bEmbedded:false,
		downloadURL: null,
  		bImageCode:" ",
		bDownloadURL: " ",
		bShowIfNotInstalled: true,
		bShowIfNotSelected: true
	},
	G2_APP:
	{
		POC:11,
		PLAYERCODE:"G2_APP",
		DESC:"Hosted",
		bEmbedded:false,
		downloadURL: null,
  		bImageCode:" ",
  		bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	WMP_APP:
	{
		POC:12,
		PLAYERCODE:"WMP_APP",
		DESC:"Hosted",
		bEmbedded:false,
		downloadURL: null,
  		bImageCode:" ",
  		bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	RADIO365_MAC:
	{
		POC:14,
		PLAYERCODE:"RADIO365_MAC",
		DESC:"Hosted",
		bEmbedded:false,
		downloadURL: null,
  		bImageCode:" ",
  		bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	},
	RADIO365_WIN:
	{
		POC:16,
		PLAYERCODE:"RADIO365_WIN",
		DESC:"Hosted",
		bEmbedded:false,
		downloadURL: null,
  		bImageCode:" ",
  		bDownloadURL: " ",
		bShowIfNotInstalled: false,
		bShowIfNotSelected: false
	}
};


var gDebugMsgLevel = 0; // 0=off; 1-3=warnings
var gActivateClientAdReplacement = 1;

// If the user is either AFL or is listening to a PLR station, give them the mp3PRO player.
var gMP3Pro = false;
if ((GetCookie("afl") > 0 || GetCookieEx('session_mc', 'plr') == 'Y') && GetPlayerCode() == 9)
	gMP3Pro = true;

var gRealOneGraphic = "/images/realonedownload-01.gif";
var gRealOneDownloadURL = "http://www.real.com/freeplayer/?rppr=live365";

var gPlayer365DownloadURL = "/listen/player365-download.html";
var gPlayer365Graphic = "/images/player365download.gif";


// we're not sniffing for WMP versions anymore -- just assume that user has latest version.
var bIsLive365Domain = (self.location.host.indexOf(GetHostServer()) != -1);
var g365InstVer = GetP365AvailableVersion();

var bHandlingError = false;	//prevent handling multiple errors at once
var bShowMoreErrors = true;
var PreviousVol = -1;
var bRedirect = false;
var BufferCallbacks = new Array();
var PlayStartCallbacks = new Array();
var PlayStopCallbacks = new Array();
var StatusImage = 0;
var DropCount = 0;
var bEverListened;
var gDefaultVolume = 50;
var gUnMuteVolume = gDefaultVolume;
var gMuteState = 0;
// Prepare for DrawMeter
var gOffCells = 6;			// number of off cells currently drawn
var cCells = 12;

var cOffColor	 = 'led-off.gif';
var cOnColor	 = 'led-on.gif';
var cBufferColor = 'led-buf.gif';
var cBlankNav	 = 'topnavtxt-blank.gif';
var cContacting	 = 'contacting.gif';
var cBuffering	 = 'buffering.gif';
var cPlaying	 = 'nowplaying.gif';
var cWaiting	 = 'waiting.gif';
var cConnecting	 = 'connecting.gif';
var cMuteOn		 = 'mute-on.gif';
var cMuteOff	 = 'mute-off.gif';
var cVolUpVert	 = 'vol-up-old.gif';
var cVolDownVert = 'vol-down-old.gif';
var cVolUp		 = 'vol-up.gif';
var cVolDown	 = 'vol-down.gif';
var cVolBoxTop	 = 'volbox-top.gif';
var cVolBoxBot	 = 'volbox-bottom.gif';
var cVolBoxLeft	 = 'volbox-left.gif';
var cVolBoxRight = 'volbox-right.gif';
var cVolBoxCtr	 = 'volbox-center.gif';
var cMp3ProOn	 = 'indicator-mp3pro-on.gif';
var cMp3ProOff	 = 'indicator-mp3pro-off.gif';


// prepare images for either PLR or other.
var lMuteH;
var lMuteW;

var gProgress     =  12;
var gProgressIncr = 8;
var gMinVol		  = 0;
var gMaxVol		  = 100;
var gStreamFormat = "MP3";
var gStreamHiFi	  = "HI_FI";

var gSiteImageDir = 'http://'+ GetHostServer() + '/mini/images/';

if (typeof(parent.IsProSkinned) != 'undefined' && parent.IsProSkinned()) {
	gSiteImageDir = 'http://'+ GetHostServer() + "/scp/plr/mini/images/";
	lMuteH			= "47";
	lMuteW			= "26";
}
else {
	if (typeof(parent.GetImageDir) != 'undefined' && parent.GetImageDir())
		gSiteImageDir = parent.GetImageDir();

	lMuteH			= "19";
	lMuteW			= "19";
}

var gbVertical = false;
var PSMap = 0; //playstate map
var PlayState = 0;
var choosemode = "install";
var InRetry = false;
var RetryCount = 0;
var gBufferingTimer = null;
var gPlayRetryTimer = null;
var gDelayTimer = null;
var gShowBuffering = 0;
var gPlayCount = 0;

var gDefaultPlayer = GetPOCName(GetPOC(0));

function GetPlayer()		// typically overridden in parent
{
	return gDefaultPlayer;
}

function IsSetUp()			// typically overridden in parent
{
	return false;
}

function AddCallBack(cbArray,cb)
{
	var i = 0;
	for (var i; i < cbArray.length; i++) {
		if (cbArray[i] == cb)
			return; //already registered
	}
	cbArray[i] = cb;
}


function RemoveCallBack(cbArray,cb)
{
	var i;
	var index =0;
	var tmpArray = new Array();

	for (i = 0; i < cbArray.length; i++)	{
		if (cbArray[i] != cb) {
			tmpArray[index] = cbArray[i];
			index++
		}
	}
	return tmpArray;
}


function NagForPlayer365Upgrade()
{
	var nag_count = parseInt(GetCookieEx('player_mc', 'vernonag'));

	if (isNaN(nag_count))
		nag_count = 0;

	var suffix = (gMP3Pro) ? '-VIP' : '';

	if (!(nag_count % 10) &&
		confirm("An updated version of Player365" + suffix + " is available.\n\n" +
				"Click OK to install it now or click Cancel to use your current version.")) {
		g365InstVer = GetP365AvailableVersion();
		nag_count = -1;
	}
	else {
		RememberItEx('box_mc', 'ls', 3);			// set to bypass install pages
		g365InstVer = GetP365VersionFromCookie();	// stick with existing version
	}

	RememberItEx('player_mc', 'vernonag', parseInt(nag_count + 1));
}

function GetThisPlayer()
{
	if (typeof(parent.GetPlayer) !== 'undefined' && parent.GetPlayer()) {
		return parent.GetPlayer();
	}
	else {
		return GetPlayer();
	}
}


function DrawPlayer(bChooseAPlayerNag, bgColor, stream)
{
	var playertype = "365";

	var player = GetThisPlayer();

	if (player == "365" || player == "365_VIP")	{
		if (gMP3Pro)
			playertype = "365VIP";

		if (bChooseAPlayerNag && (!HasPlayer(playertype) || (!gMP3Pro && !GetCookieEx('player_mc', 'ver')) && bIsLive365Domain)) {
			ChooseAPlayer();
			return false;
		}

		if (NewP365VersionAvailable())
			NagForPlayer365Upgrade();
	}
	else if (player == "WMP" || player == "G2") {	// embedded WMP, G2
		if (!HasPlayer(player)) {
			alert("Oops, the player that you have specified does not seem to be installed on your system.\n\nClick OK and we will guide you through selecting another player.");

			if (bChooseAPlayerNag) {
				choosemode = "slip";
	    		ChooseAPlayer();
			}

			return false; //this really causes problems if it's not here
		}
	}
	else if ((player == 'HTML5' || player == 'QT') && !stream) {
		stream = GetStopURL();
	}

	document.write(GetPlayerDrawCode(player, false, bChooseAPlayerNag, stream, bgColor));
	return true;
}


function GetPlayerObj()
{
	if (!client.isApple) {
		if (window.document['PlayerControl'])
			return window.document['PlayerControl'];

		try {
			if (client.isIE && document.embeds && document.embeds['PlayerControl'])
				return document.embeds['PlayerControl'];
		}
		catch(e) {
		}
	}

	return document.getElementById('PlayerControl');
}


function GetBitrate()
{
	if (typeof(parent.GetStreamBitrate) != 'undefined' && parent.GetStreamBitrate()) {
		return parent.GetStreamBitrate();
	}
	else {
		return (typeof(GetStreamBitrate) != "undefined") ? GetStreamBitrate() : 64;
	}
}


function GetFlashSWF(player)
{
	var flashVer = '';

	if (player == "FLASH3") {
		if (client.isMac || client.isWin)
			flashVer = '302';
		else
			flashVer = '301';
	}

	return "//" + GetHostServer() + "/mini/streamer" + flashVer + ".swf";
}


function IsExternalPlayer(player)
{
	return !POCInfo[player].bEmbedded;
}


function GetPlayerDrawCode(player, doInstall, bChooseAPlayerNag, streamURL, bgColor)
{
	var numArgs = GetPlayerDrawCode.arguments.length + 1;

	if (numArgs < 5 || !bgColor)
		bgColor = '#ffffff';

	if (IsExternalPlayer(player))
		return '<iframe id="mp3Sink" src="/mini/blank.html" scrolling="no" style="width:0; height:0; border-collapse:collapse; border:0; margin:0; padding:0; background-color: transparent;"></iframe>';

	var playerdata = '<object id="PlayerControl" align="top" border="0" height="0" width="0" ';
	var embedTag = '<embed name="PlayerControl" ';
	var endTag = '</object>';

	if (player == "WMP") {
		playerdata += 'classid="CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6" '
		+ 'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701" '
		+ 'standby="Loading Microsoft Windows Media Player components..." '
		+ 'type="application/x-oleobject">'
		+ '<param name="AutoStart" value="true">'
		+ '<param name="AutoSize" value="false">'
		+ '<param name="ShowAudioControls" value="false">'
		+ '<param name="ShowCaptioning" value="false">'
		+ '<param name="ShowControls" value="false">'
		+ '<param name="ShowDisplay" value="false">'
		+ '<param name="ShowGotoBar" value="false">'
		+ '<param name="ShowPositionControls" value="false">'
		+ '<param name="ShowStatusBar" value="false">'
		+ '<param name="ShowTracker" value="false">'
		+ '<param name="TransparentAtStart" value="true">'
		+ '<param name="VideoBorderWidth" value="0">'
		+ '<param name="uiMode" value="invisible">'
		+ embedTag
		+ 'type="application/x-mplayer2" '
		+ 'pluginspage="http://www.microsoft.com/windows/mediaplayer/download/default.asp" '
		+ 'align="top" '
		+ 'border="0" '
		+ 'height="2" '
		+ 'width="1" />';

		PSMap = new Array(0,0,2,3,2,2,2,1,0,2,1);
	}
	else if (player == "365" || player == "365_VIP") {
		if (gMP3Pro)
			playerdata += 'codeBase="http://' + GetHostServer() + '/players/p365vip.cab#Version=' + g365InstVer + '" classid="CLSID:40272BF7-4FF5-4d6f-9BAD-3C1D3CB32982"> ';
		else
			playerdata += 'codeBase="http://' + GetHostServer() + '/players/play365.cab#Version=' + g365InstVer + '" classid="CLSID:CC05BC12-2AA2-4AC7-AC81-0E40F83B1ADF"> ';

		if (!doInstall) {
			var playerCookieType = (gMP3Pro)? 'verpro' : 'ver';
			var startScript = '<scr' + 'ipt LANGUAGE="JavaScript" FOR="PlayerControl" ';
			var endScript  = '</scr' + 'ipt>';

			endTag +=
				  startScript + 'EVENT="OnReady">RememberItEx("player_mc", "'+ playerCookieType + '", fixDelimiter(document.PlayerControl.getVersion()));' + endScript
				+ startScript + 'EVENT="OnBuffer(bufferpercent)">PlayerOnBuffer(bufferpercent);' + endScript
				+ startScript + 'EVENT="OnError(errId, errCode, msg)">PlayerOnError(errId, errCode, msg);' + endScript
				+ startScript + 'EVENT="OnDrop">PlayerOnDrop();' + endScript
				+ startScript + 'EVENT="OnStartPlaying">PlayerOnStartPlaying();' + endScript
				+ startScript + 'EVENT="OnStop">PlayerOnStop(0, "");' + endScript
				+ startScript + 'EVENT="OnConnectionLost">PlayerOnConnectionLost();' + endScript
				+ startScript + 'EVENT="OnVolumeChange()">PlayerOnVolumeChange();' + endScript
				+ startScript + 'EVENT="OnStreamFormat(format)">PlayerOnStreamFormat(format);' + endScript
		}
	}
	else if (player == "G2") {
		playerdata += 'classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA">'		// Real G2 player
		+ '<param name="autostart" value="false">'
		+ '<param name="CONTROLS" value="ImageWindow">'
		+ embedTag
		+ 'src="http://' + GetHostServer() + '/mini/dummy.rpm" type="audio/x-pn-realaudio-plugin" pluginspage="http://www.real.com" width="2" height="2" />';

		PSMap = new Array(0,1,2,3,4,5);
	}
	else if (player == "FLASH" || player == "FLASH3") {
		var flashUrl = GetFlashSWF(player);
		var flashVars = "bs=5&vol=" + GetCookieVolume();
		if (streamURL)
			flashVars += "&br=" + GetBitrate() + "&url=" + encodeURIComponent(streamURL);
		else
			flashVars += "&br=64";

		if (!client.isMac && !client.isWin)
			flashVars += "&StreamMode=adobe";

		playerdata += 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '
		+ 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,22,87">'
		+ '<param name="allowScriptAccess" value="always" />'
		+ '<param name="uiMode" value="invisible" />'
		+ '<param name="quality" value="high" />'
		+ '<param name="menu" value="0" />'
		+ '<param name="loop" value="False" />'
		+ '<param name="scale" value="noborder">'
		+ '<param name="bgcolor" value="' + bgColor + '" />'
		+ '<param name="wmode" value="transparent" />'
		+ '<param name="play" value="false" />'
		+ '<param name="movie" value="' + flashUrl + '" />'
		+ '<param name="FlashVars" value="' + flashVars + '" />'
		+ embedTag
		+ 'type="application/x-shockwave-flash" '
		+ 'pluginspage="http://www.macromedia.com/go/getflashplayer" '
		+ 'swLiveConnect="1" quality="high" align="middle" allowScriptAccess="always" '
		+ 'wmode="window" bgcolor="' + bgColor + '" width="1" height="1" play="false" '
		+ 'FlashVars="' + flashVars + '" '
		+ 'src="' + flashUrl + '" />';

		PSMap = new Array(0,1,2,3,4,5);
	}
	else if (player == "QT") {
		playerdata += 'CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" '
		+ 'codebase="http://www.apple.com/qtactivex/qtplugin.cab" style="behavior:url(#PlayerControl);">'
		+ '<param name="src" value="' + streamURL + '"/>'
		+ '<param name="type" value="audio/x-mpeg"/>'
		+ '<param name="AllowEmbedTagOverrides" value="true"/>'
		+ '<param name="AutoHREF" value="true"/>'
		+ '<param name="AutoPlay" value="@00:00:05:00"/>'
		+ '<param name="Controller" value="false"/>'
		+ '<param name="EnableJavaScript" value="true"/>'
		+ '<param name="Loop" value="false" />'
		+ '<param name="PostDOMEvents" value="true" />'
		+ '<param name="ShowLogo" value="false"/>'
		+ '<param name="SaveEmbedTags" value="true"/>'
		+ '<param name="Volume" value="' + GetCookieVolume() + '"/>'
		+ '<param name="WMode" value="transparent" />';
		playerdata += embedTag;
		playerdata += 'pluginspage="http://www.apple.com/quicktime/download/" '
		+ 'Src="' + streamURL + '" '
		+ 'Volume="' + GetCookieVolume() + '" '
		+ 'type="audio/x-mpeg" '
		+ 'AllowEmbedTagOverrides="true" '
		+ 'AutoHREF="true" '
		+ 'AutoPlay="@00:00:05:00" '
		+ 'Controller="false" '
		+ 'EnableJavaScript="true" Loop="false" ShowLogo="false" SaveEmbedTags="true" '
		+ 'PostDOMEvents="true" WMode="transparent" height="1" width="1" />';

		PSMap = new Array(0,1,2,3,4,5);
	}
	else if (player == 'HTML5') {
		playerdata = '<audio id="PlayerControl" style="width:1;height:1px"'+
			' onplay="PlayerOnBuffer(1);"'+
			' onplaying="PlayerOnStartPlaying();"';

/*
			' onabort="$(\'#logEvent\').append(\'onabort<br>\');"'+
			' oncanplay="$(\'#logEvent\').append(\'oncanplay<br>\');"'+
			' oncanplaythrough="$(\'#logEvent\').append(\'oncanplaythrough<br>\');"'+
			' ondurationchange="$(\'#logEvent\').append(\'ondurationchange<br>\');"'+
			' onemptied="$(\'#logEvent\').append(\'onemptied<br>\');"'+
			' onended="$(\'#logEvent\').append(\'onended<br>\');"'+
			' onerror="$(\'#logEvent\').append(\'onerror<br>\');"'+
			' onloadeddata="$(\'#logEvent\').append(\'onloadeddata<br>\');"'+
			' onloadedmetadata="$(\'#logEvent\').append(\'onloadedmetadata<br>\');"'+
			' onloadstart="$(\'#logEvent\').append(\'onloadstart<br>\');"'+
			' onpause="$(\'#logEvent\').append(\'onpause<br>\');"'+
			' onplay="$(\'#logEvent\').append(\'onplay<br>\');"'+
			' onplaying="$(\'#logEvent\').append(\'onplaying<br>\');"'+
			' onprogress="$(\'#logEvent\').append(\'onprogress<br>\');"'+
			' onratechange="$(\'#logEvent\').append(\'onratechange<br>\');"'+
			' onreadystatechange="$(\'#logEvent\').append(\'onreadystatechange<br>\');"'+
			' onseeked="$(\'#logEvent\').append(\'onseeked<br>\');"'+
			' onseeking="$(\'#logEvent\').append(\'onseeking<br>\');"'+
			' onstalled="$(\'#logEvent\').append(\'onstalled<br>\');"'+
			' onsuspend="$(\'#logEvent\').append(\'onsuspend<br>\');"'+
//			' ontimeupdate="$(\'#logEvent\').append(\'ontimeupdate<br>\');"'+
			' onvolumechange="$(\'#logEvent\').append(\'onvolumechange<br>\');"'+
			' onwaiting="$(\'#logEvent\').append(\'onwaiting<br>\');"';
*/
/*
			' onemptied=" PlayerOnStop(0, \'\');"'+
			' onpause=" PlayerOnConnectionLost();"'+
			' onplay=" PlayerOnBuffer(1);"'+
			' onplaying=" PlayerOnStartPlaying();"';
*/
		if (!client.isApple) {
			playerdata += ' preload="auto"';

			if (streamURL)
				playerdata += ' src="' + streamURL + '"';
		}

		playerdata += '>Your browser does not support the audio element.</audio>';

		endTag = '';
	}

	playerdata += endTag;

	return playerdata;
}

function AddPlayerEventListener(obj, evt, handler, captures)
{
	if (document.addEventListener)
		obj.addEventListener(evt, handler, captures);
	else  // IE
		obj.attachEvent('on' + evt, handler);
}


function CustomInitializePlayer()
{
	// override this
}


function InitializePlayer()
{
	var embeddedPlayer = GetPlayerObj();
	if (embeddedPlayer) {
		var player = GetThisPlayer();

		if (player == 'FLASH3' && client.hasFlash) {
			var mode = (client.isMac || client.isWin) ? 'live365' : 'adobe';
			try {
				embeddedPlayer.SetStreamMode(mode);
			}
			catch(e) {
			}
		}
		else
		if (player == 'QT') {
   			AddPlayerEventListener(embeddedPlayer, 'qt_error',			PlayerOnDrop, 			false);
			AddPlayerEventListener(embeddedPlayer, 'qt_volume_change',	PlayerOnVolumeChange,	false);
		}
	}

	CustomInitializePlayer();

	return false;
}


function GetVersion()
{
	var embeddedPlayer = GetPlayerObj();
    var player = GetThisPlayer();

	if (IsExternalPlayer(player) || player == "NotSet" || player == 100 || !embeddedPlayer) {
		gVersion = "0.0.0.0";
	}
	else if (player == "G2") {
		gVersion = "6.0.8";	//NS 6 Real doesn't have this call

		try {
			var v = embeddedPlayer.GetVersionInfo().toString();
			gVersion = v;
		}
		catch(e) {
			TraceAlert(2, "G2 GetVersionInfo() failed");
		}
	}
	else if (player == "365" || player == "365_VIP" || player == 'FLASH' || player == "FLASH3" || player == 'QT') {
		if (!embeddedPlayer)
			alert("Warning: There is a problem with your installation of audio player!\n You will need to reinstall it.");
		else {
			try {
				if (player == "365" || player == "365_VIP")
					gVersion = embeddedPlayer.GetVersion().toString();
				else if (player == "FLASH" || player == "FLASH3")
					gVersion = GetFlashVersion().toString();
				else if (player == 'QT')
					gVersion = embeddedPlayer.GetQuickTimeVersion();
			}
			catch(e) {
				TraceAlert(2, "GetVersion() failed");
			}
		}
	}

	return gVersion + ""; //make sure we get a JS string
}


function CheckVersion()
{
	GetVersion();
    var player = GetThisPlayer();

	if (player == "FLASH" || player == "FLASH3") {
		if (VersionLessThan(gVersion.toString(), "9.0.115", 0)) { // earlier version had chipmunk problems on non-11 frequency rates
			var msg;

			if (gVersion == '0.0.0.0') {
				msg = "Oops!  Cannot find an installed Adobe Flash control.  If you have recently \n" +
				"installed Flash, try closing all browser windows and re-launching the station.\n\n";
			}
			else {
				msg = "Oops!  You are running Flash version " + gVersion + ", but Live365 \n" +
				"requires a more recent version of the Flash control to listen.\n\n";
			}

			msg +=	"Click OK to return to the Player Selection page to select a \n" +
					"different player or look for the Upgrade Now link to download \n" +
					"the latest version of Flash from Adobe."

			alert(msg);
			return false;
		}
	}
	else if (player == "G2") {
		if (VersionLessThan(gVersion.toString(), "6.0.7.530", 0)) { // 6.0.7.529 was an awful version
			alert("Oops!  Live365 requires a recent version of RealPlayer to listen.\nClick OK to choose another player which will allow you to listen in no time.");
			return false;
		}
	}

	return true;
}


function GetChoosePlayerPageURL()
{
    var player = GetThisPlayer();
	var page = (player == 365 || player == "365_VIP") ? 'step1.live' : 'chooseplayer.live';
	var ChoosePlayerURL = 'http://'+ GetHostServer() + "/mini/install/" + page + "?mode=" + choosemode + "&autoinstall=0&streamlaunched=" + parent.GetStreamID() + "&url=" + encodeURIComponent(parent.GetLaunchURL());

	if (parent.GetSite())
		ChoosePlayerURL += 	"&site=" + parent.GetSite();

	return ChoosePlayerURL;
}


function ChooseAPlayer()
{
	window.onbeforeunload = null;
	parent.location = GetChoosePlayerPageURL();
}


function UpgradePlayer()
{
	var upgradeURL = '/mini/install/step2.live?mode=upgrade&autoinstall=1&' + parent.GetInstallArgs();

	parent.openWindow(330, 468, upgradeURL, 'InstallWin');
	parent.close();
}


function ShowBufferingImage()
{
	PlayState = 2;

	if (StatusImage)
		StatusImage.src = gSiteImageDir + cBuffering;
}


function HideBufferingImage()
{
	if (StatusImage) {
		if (parent.IsSetUp() && parent.live365VerifyMessage)
			parent.live365VerifyMessage.document.status.src = gSiteImageDir + cPlaying;
		else if (!parent.IsProSkinned() && parent.topbar.document.toparea)
			parent.frames.topbar.document.toparea.src = gSiteImageDir + cBlankNav;
	}
}


function ShowWaitingImage()
{
	PlayState = 1;
	if (StatusImage) {	// if the place is there to load the buffering image, do so.  if not, forget about it!
		if (parent.IsSetUp() && parent.live365VerifyMessage)
			parent.live365VerifyMessage.document.status.src = gSiteImageDir + cWaiting;
		else if (!parent.IsProSkinned() && parent.topbar.document.toparea)
			parent.topbar.document.toparea.src = gSiteImageDir + cWaiting;
	}
}


function ShowConnectingImage()
{
	PlayState = 7;

	if (StatusImage) {
		// if the place is there to load the buffering image, do so.  if not, forget about it!
		if (parent.IsSetUp() && parent.live365VerifyMessage)
			parent.live365VerifyMessage.document.status.src = gSiteImageDir + cConnecting;
		else if (!parent.IsProSkinned() && parent.topbar.document.toparea)
			parent.topbar.document.toparea.src = gSiteImageDir + cConnecting;
		else if (parent.IsProSkinned() && parent.Status.document.status)
			parent.Status.document.status.src = gSiteImageDir + cContacting;
	}
}

// Old QT app does a 'Back' on Done, so some apps may want to redefine
// this routine to use a separate window if we don't control 'top'.
function DoQTLaunch(url)
{
	// window.open(url, "Live365PlayerWindow");
	top.location.href = url;
}


function DoDirectLaunch(url)
{
	var obj = document.getElementById("mp3Sink");

	if (!obj || (client.isApple && (!client.hasHTML5 || client.iOSVersion >= 5.0)))
		DoQTLaunch(url);
	else
		obj.contentWindow.location.replace(url); // no history

	return false;
}


function GetStopURL()
{
	var host = GetHostServer();
	var mp3 = 'http://' + host + '/mini/Silent02.mp3';
	return mp3;
}


function ClearPlayTimers(which)
{
	if ((which == 'all' || which == 'buffering') && gBufferingTimer != null) {
		window.clearTimeout(gBufferingTimer);
		gBufferingTimer = null;
	}

	if ((which == 'all' || which == 'play') && gPlayRetryTimer != null) {
		window.clearTimeout(gPlayRetryTimer);
		gPlayRetryTimer = null;
	}
}


function Stop()
{
	gUnMuteVolume = GetCookieVolume();
	gShowBuffering = 0;

	ClearPlayTimers('all');
	StopEmbeddedPlayer();

	if (GetMute() == true)
		Mute(gSiteImageDir);

	UpdateMeter(0);
	KillWarning();
	return false;
}


function StopEmbeddedPlayer()
{
	var embeddedPlayer = GetPlayerObj();
	return StopPlaying(embeddedPlayer);
}


function StopPlaying(embeddedPlayer)
{
	PlayState = 0;
    var player = GetThisPlayer();
	if	(player == 'MP3') { // need silent.365e for Radio365 and silent.m3u for others
		if (!client.isApple)
			DoDirectLaunch("/cgi-bin/silent.pls");
	}
	else if (player == 'FLASH' || player == "FLASH3") {
		try {
			if (typeof(embeddedPlayer.StopIt) == 'function')
				embeddedPlayer.StopIt();
		}
		catch(e) {
			TraceAlert(3, "FLASH StopIt() failed");
			return false;
		}
	}
	else if (embeddedPlayer) {
		if (player == "WMP") {
			embeddedPlayer.controls.stop();
			embeddedPlayer.close();
		}
		else if (player == 'QT')
			embeddedPlayer.Stop();
		else if (player == 'HTML5') {
			embeddedPlayer.pause();
			embeddedPlayer.setAttribute('src', GetStopURL());
			if (client.iOSVersion <= 3.2)
				embeddedPlayer.load();
		}
		else if (player == "G2") {
			try {
				embeddedPlayer.DoStop();
			}
			catch(e) {
				TraceAlert(3, "RealPlayer DoStop() failed");
				return false;
			}
		}
		else if (player == "365" || player == "365_VIP") {
			if (gMP3Pro)
				try {
					embeddedPlayer.Stop(1);
				}
				catch(e) {
					embeddedPlayer.Stop();
				}
			else
				embeddedPlayer.Stop();
		}
	}

	return true;
}


function Reset()
{
	var embeddedPlayer = GetPlayerObj();

	if (embeddedPlayer) {
		var poc = GetThisPlayer();
		if (poc == 'FLASH' || poc == "FLASH3") {
			try {
				if (typeof(embeddedPlayer.Reset) == 'function')
					embeddedPlayer.Reset();
			}
			catch(e) {
				TraceAlert(3, "FLASH Reset() failed");
			}
		}
		else
			return StopPlaying(embeddedPlayer);
	}

	return false;
}


function Retry()
{
	// retry the existing stream via a clerk trip set state to retrying
	Stop();
	InRetry = true;
	RetryCount++;
	parent.RelaunchAltStream();
}


function QTPlay()
{
	TraceAlert(3, "QTPlay() called; will end buffering message in 4.5 seconds");
	window.setTimeout(PlayerOnStartPlaying, 4500);
}


function Play(stream, retries)
{
	if (retries === undefined || !retries)
		retries = 0;

	gPlayCount++;
	bHandlingError = false;
	bEverListened = GetCookieEx('box_mc', 'LOK');
	if (bEverListened == null)
		bEverListened = false;
	var poc = GetThisPlayer();

	if (poc == "NotSet") {
		ChooseAPlayer();
		return false;
	}

	TraceAlert(3, poc + " - calling Play('"+stream+"')");

	PlayState = 1;
	gShowBuffering = 1;

	ClearPlayTimers('all');

	var embeddedPlayer = GetPlayerObj();

	if (!embeddedPlayer) {
		if (IsExternalPlayer(poc) || poc == 'HTML5'){
			DoDirectLaunch(stream);	
		}
		else if (poc == 'FLASH' || poc == "FLASH3" || poc == 'QT')
			TraceAlert(1, poc + " - cannot call Play() on empty object");
		else
			ChooseAPlayer();
		return false;
	}

	if (poc == 'FLASH' || poc == "FLASH3") {
		var errmsg = '';
		try {
			if (typeof(embeddedPlayer.PlayIt) == 'function') {
				embeddedPlayer.PlayIt(stream, GetBitrate());
				StartBuffering();
			}
			else
				errmsg = "FLASH - cannot call PlayIt(); its type is " + typeof(embeddedPlayer.PlayIt);
		}
		catch(e) {
			errmsg = "FLASH PlayIt(" + stream + ") failed";
		}

		if (errmsg) {
			if (++retries >= 10)
				TraceAlert(1, errmsg);
			else
				gPlayRetryTimer = window.setTimeout(function(){Play(stream, retries); gPlayRetryTimer = null;}, 1000);

			return false;
		}
	}
	else if (poc == "WMP" || poc == "WMP_APP") {
		ShowBufferingImage();

		if (poc == "WMP_APP")
			embeddedPlayer.OpenPlayer(stream);
		else {
			embeddedPlayer.URL = stream;
			embeddedPlayer.controls.play();
		}

		StartBuffering();
	}
	else if (poc == "365" || poc == "365_VIP") {
		ShowConnectingImage();
		vData = GetCookieEx("player_mc", "BufSize");  //seconds to buffer up of the streams bitrate

		if (vData == null)
			vData = 6;

		if (typeof(parent.GetStreamBitrate) != "undefined") {
			// PlayerVIP takes the buffer data in terms of seconds, Player365 wants actual bytes
			if (gMP3Pro)
				embeddedPlayer.SetBufferSize(parseInt(vData));
			else {
				vData = vData*parseInt(parent.GetStreamBitrate())/8*1000;
				embeddedPlayer.SetBufferSize(parseInt(vData));
			}
		}

		if (typeof(parent.GetServerMode) != "undefined") {
			if (parent.GetServerMode() == "RE")
				embeddedPlayer.SetMaxRetries(10);
		}

		var iPort = GetCookieEx("player_mc","ProxyPort");
		var ProxyServer = GetCookieEx("player_mc","ProxyServer");
		var UseProxy = GetCookieEx("player_mc","UseProxy");

		if (ProxyServer == "autodetect" && UseProxy == "Y") {
			RememberItEx("player_mc", "UseProxy", "A");
			UseProxy = "A";
		}

		if (ProxyServer != "autodetect" && ProxyServer != '' && ProxyServer != null) {
			if (UseProxy == "Y")
				embeddedPlayer.SetProxy(ProxyServer, iPort);
		}

		if (UseProxy == "A" && !VersionLessThan(GetVersion(), "1.0.0.7", 1))
			embeddedPlayer.SetProxy("autodetect", 0);

		bShowMoreErrors = true;
		embeddedPlayer.SetSRC(stream);
		embeddedPlayer.Play();
		UpdateMeter(GetCookieVolume());
	}
	else if (poc == "G2") {
		ShowBufferingImage();

		// fail gracefully(?) if they don't really have this player installed
		if (typeof(embeddedPlayer.GetPlayState) == 'undefined') {
			if (confirm("Warning!  There are problems detected with the player you have chosen, and we are unable to play your chosen station.\nAre you certain you have the player you've selected installed properly?\nClick OK to re-install your current player, or choose another."))
				ChooseAPlayer();
			return false;
		}

		if (embeddedPlayer.GetPlayState() == 3)
			embeddedPlayer.DoStop();

		embeddedPlayer.SetSource(stream);
		embeddedPlayer.DoPlay();
		StartBuffering();
	}
	else if (poc == 'QT') {
		StartBuffering();

		if (gPlayCount == 1)
			AddPlayerEventListener(embeddedPlayer, 'qt_play', QTPlay, false);

		embeddedPlayer.SetURL(stream);
		SetVolume(GetCookieVolume());
	}
	else if (poc == 'HTML5') {
		embeddedPlayer.setAttribute('src', stream);
		embeddedPlayer.load();
		var readyInterval = setInterval(function(){
			if (embeddedPlayer.readyState == 4) {
				embeddedPlayer.play();
				clearInterval(readyInterval);
			}
		}, 1000);
	}

	return false;
}


function GetPlayState()
{
	var vps = -1;

    var player = GetThisPlayer();
	var embeddedPlayer = GetPlayerObj();

	if (embeddedPlayer) {
		if (player == "WMP")
			vps = embeddedPlayer.playState;
		else if (player == "G2")
			vps = embeddedPlayer.GetPlayState();
		else if (player == "FLASH" || player == "FLASH3") {
			try {
				if (typeof(embeddedPlayer.GetPlayState) == 'function')
					vps = embeddedPlayer.GetPlayState();
			}
			catch(e) {
			}
		}
		else if (player == "QT") {
			var s = 'Error';
			try {
				s = embeddedPlayer.GetPluginStatus();
			}
			catch(e) {
				return PlayState;
			}

			if (s == 'Waiting')
				vps = 0;
			else if (s == 'Loading')
				vps = 2;
			else if (s == 'Playable')
				vps = 1;
			else if (s == 'Complete')
				vps = 0;
			else if (s.indexOf('Error') != -1)
				vps = 0;
			else
				vps = 3; // playing
		}
	}

	if (PSMap) {
		if (0 <= vps && vps < PSMap.length)
			PlayState = PSMap[vps];
	}

	return PlayState;
}


function GetMute()
{
	var embeddedPlayer = GetPlayerObj();
    var player = GetThisPlayer();

	if (embeddedPlayer) {
		if (player == "G2" || player == "365" || player == "365_VIP" || player == 'QT')
			return embeddedPlayer.GetMute();
		else if (player == "WMP")
			return embeddedPlayer.settings.mute ;

		return gMuteState;	// includes FLASH
	}

	return false;
}


function SetMute(mute, bUpdateMeter)
{
	gMuteState = mute;

	if (bUpdateMeter == null)
		bUpdateMeter = true;

	if (mute) {
		gUnMuteVolume = GetCookieVolume();
		SetVolume(0, true);

		if (bUpdateMeter)
			UpdateMeter(0);
	}
	else {
		SetVolume(gUnMuteVolume, true);

		if (bUpdateMeter)
			UpdateMeter(gUnMuteVolume);
	}

	var embeddedPlayer = GetPlayerObj();
	if (embeddedPlayer) {
		try {
		    var player = GetThisPlayer();

			if (player == "G2" || player == "365" || player == "365_VIP" || player == 'QT')
				embeddedPlayer.SetMute(mute);
			else if (player == "WMP")
				embeddedPlayer.settings.mute = mute;
		}
		catch(e) {
			TraceAlert(3, "SetMute() failed");
		}
	}

	return false;
}


function SetVolumeRanges(player)
{
	gMinVol = 0;
	gMaxVol = (player == 'QT') ? 256 : 100;
	gProgress = 12;
	gProgressIncr = (player == 'QT') ? 20 : 8;
}


function OnBeforeSetVolume(newVolume)
{
	return true;
}


function SetVolume(val, bNoCookie)
{
	val = Math.min(gMaxVol, val);
	val = Math.max(gMinVol, val);

    var player = GetThisPlayer();
	var embeddedPlayer = GetPlayerObj();

	if (embeddedPlayer && OnBeforeSetVolume(val)) {
		try {
			if (player == 'FLASH' || player == "FLASH3") {
				if (typeof(embeddedPlayer.SetVol) == 'function')
					embeddedPlayer.SetVol(val);
				else
					TraceAlert(2, "SetVol("+ val +") failed - method not defined for this object");
			}
			else if (player == 'HTML5') {
				if (!client.isApple)
					embeddedPlayer.volume = val/100;	// percent
			}
			else if (player == 'QT' || player == "G2" || player == "365" || player == "365_VIP") {
				if (client.isApple)
					TraceAlert(2, "SetVolume not supported on iOS");
				else
					embeddedPlayer.SetVolume(val);
			}
			else
				embeddedPlayer.settings.volume = val;
		}
		catch(e) {
			TraceAlert(2, "SetVol("+ val +") failed");
		}
	}

	if (!bNoCookie)
		RememberItEx("player_mc", "Vol", val);

	return val;
}


function GetVolume()
{
    var player = GetThisPlayer();
	var vol = gDefaultVolume;
	var embeddedPlayer = GetPlayerObj();

	if (embeddedPlayer) {
		try {
			if (player == 'FLASH' || player == "FLASH3") {
				if (typeof(embeddedPlayer.GetVol) == 'function')
					vol = embeddedPlayer.GetVol();
			}
			else if (player == 'QT' || player == "G2" || player == "365" || player == "365_VIP")
				vol = embeddedPlayer.GetVolume();
			else if (player == 'HTML5') {
				if (!client.isApple)
					vol = parseInt(100*embeddedPlayer.volume);
			}
			else if (player == 'WMP')
				vol = embeddedPlayer.settings.volume;
		}
		catch(e) {
			TraceAlert(3, "GetVol() failed");
			vol = gDefaultVolume;
		}
	}

	if (isNaN(vol))
		vol = gDefaultVolume;

	return vol;
}


function InitCookieVolume()
{
	var vol = parseInt(GetCookieEx("player_mc", "Vol"));

	if (isNaN(vol)) {
		vol = gDefaultVolume;
		RememberItEx("player_mc", "Vol", vol);
	}

	return vol;
}


function GetCookieVolume()
{
	var vol = parseInt(GetCookieEx("player_mc", "Vol"));

	if (isNaN(vol) || typeof vol == 'undefined')
		vol = GetVolume();

	if (isNaN(vol) || typeof vol == 'undefined' || !vol)
		vol = gDefaultVolume;

	return vol;
}


function Mute(imageDir, bNoRotate)
{
	var mute;
	var embeddedPlayer = GetPlayerObj();

	mute = GetMute();
	SetMute(!mute);
	document.images.mute.src = imageDir + (mute ? cMuteOff :  cMuteOn);

	if (parent.RotateAd && !parent.IsSetUp() && !bNoRotate)
		parent.RotateAd();

	return false;
}


function VolumeAbs(val, bNoCookie)
{
	var embeddedPlayer = GetPlayerObj();

	if (embeddedPlayer) {
		if (GetMute() == true)
			Mute(gSiteImageDir);

		val = SetVolume(val, bNoCookie);
		UpdateMeter(val);
	}

	return false;
}


function VolumeRel(val)
{
	console.log('VolumeRel is called, val: '+val);
	if (GetMute() == true)
		Mute(gSiteImageDir);
	else {
		var vol = GetCookieVolume() + val;
		console.log(GetCookieVolume())

		if (vol <= (gMinVol + Math.abs(gProgressIncr)))
			VolumeAbs(gMinVol + Math.abs(gProgressIncr),false)
			return false;

		VolumeAbs(vol, false);
	}

	return false;
}


function GetMeterCode(bVertical, imageDir)
{
	gSiteImageDir = imageDir;

	// constructor scripts
	//status image slot logic
	if (parent.IsSetUp() && parent.live365VerifyMessage)
		StatusImage = parent.live365VerifyMessage.document.status;

	SetVolumeRanges(parent.GetPlayer());
	gbVertical = bVertical;

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

	incr = gProgressIncr;
	var VolRange = gMaxVol - gMinVol;

	gOffCells = Math.floor(Math.abs((VolRange-Math.abs(v))/incr));

	var volumedata = '<a name="Set Volume"></a>';
	var base = GetHostServer();

	if (!bVertical) {
		Width 			= 6;
		SpacerWidth		= 2;
		SpacerHeight	= 15;
		Height			= 20;
		coords			= "0,0,15,18";
	}

	if (bVertical) {
		volumedata += '<img src="' + imageDir + cVolUpVert + '" width="15" height="18" border="0" alt="Volume Up" title="Volume Up" usemap="#volup"><br>';
		volumedata += '<map name="volup"><area alt="Volume Up" href="#Set Volume" coords="' + coords + '" onclick="VolumeRel(' + incr + ')"></map>';
		volumedata += '<img src="http://' + base + '/images/dot.gif" width="15" height="2" href=""><br>';
	}
	else {
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
	}

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

	return volumedata;
}


function DrawMeter(bVertical, imageDir)
{
	if (!ParentHasEmbeddedPlayer())
		return;

	if (bVertical == null)
		bVertical = false;

	document.write(GetMeterCode(bVertical, imageDir));

	if (parent.gTesting == 'R' && parent.GetPlayer() == 'FLASH3')
		document.write('<div id="pinkMsg" style="position:fixed;z-index:4;top:25px;padding:2px;font-size:10px;color:blue;background-color:pink;width:100%;height=auto">Sniffing for ads...</div>');
}

//note that this only updates CHANGED cells, it doesn't automatically refresh the entire meter
function UpdateMeterView(volume, bIsBuffering)
{
	if (!ParentHasEmbeddedPlayer())
		return;

	var i;
	var newOffCells = Math.floor(Math.abs((volume - gMinVol)/(gMaxVol - gMinVol)*cCells));
	newOffCells = cCells - newOffCells;

	var nCells = newOffCells - gOffCells;
	var cOnCell;
	var doc = document;

	if (bIsBuffering == true)
		cOnCell = cBufferColor;
	else
		cOnCell = cOnColor;

	if (0 <= newOffCells && newOffCells <= cCells) {
		if (nCells > 0) {		// convert more cells to off color
			for (i = gOffCells; i < newOffCells; i++) {
				if (doc.images["cell"+i])
					doc.images["cell"+i].src = gSiteImageDir + cOffColor;
				else
					TraceAlert(3, "Lost cells for cell"+i);
			}
		}
		else if (nCells < 0) {	// convert more cells to on color
			for (i = newOffCells; i < gOffCells; i++) {
				if (doc.images["cell"+i])
					doc.images["cell"+i].src = gSiteImageDir + cOnCell;
				else
					TraceAlert(3, "Lost cells for cell"+i);
			}
		}

		gOffCells = newOffCells;
	}
}


function UpdateMeter(volume)
{
	UpdateMeterView(volume, false);
}


function StartBuffering()
{
	PlayState = 2;
	gProgress = gMinVol;
	UpdateMeterView(0, true);
	ShowBuffering();
}


function ShowBuffering()
{
    var player = GetThisPlayer();
	var embeddedPlayer = GetPlayerObj();

	if (!embeddedPlayer)
		return;

	var bStillBuffering = true;

	if (player == "FLASH" || player == "WMP" || player == "FLASH3" || player == 'QT' || player == "G2") {
		if (GetPlayState() != 3) {
			if (gProgress <= gMinVol)
				gProgressIncr = Math.abs(gProgressIncr);
			else if (gProgress >= gMaxVol)
				gProgressIncr = -(gProgressIncr);
		}
		else {
			bStillBuffering = false;
			gProgress = gMinVol;
		}
	}
	else {
		TraceAlert(3, "Embedded player not available");
		return;
	}

	if (bStillBuffering) {
		gProgress += gProgressIncr;

		UpdateMeterView(gProgress, true);

		gBufferingTimer = window.setTimeout('ShowBuffering();', 150);

		PlayState = 2;
		for (var i = 0; i < BufferCallbacks.length; i++)
			eval('' + BufferCallbacks[i] + '(' + -1 + ');');
	}
	else {
		ClearPlayTimers('buffering');
		UpdateMeter(0);

		var vol = GetCookieVolume();	// restore last known volume
		if (!GetMute()) {
			SetVolume(vol, true);
			UpdateMeter(vol);
		}

		HideBufferingImage();
		PlayState = 3;
		for (var i = 0; i < PlayStartCallbacks.length; i++)
			eval(PlayStartCallbacks[i]);

		isStartPlay = true;
		
		console.log("it starts playing!!!");
		//responsiveVoice.AddEventListener('OnReady', speak);
		//speak()
	}


}


function PlayerLookUpError(errId)
{
	window.open('http://'+ GetHostServer() + "/cgi-bin/help.cgi?id=" + errId);
}


// Event handlers
function HandleError(msg, url, line)
{
	if (IsModernNS()) {
		if (msg.indexOf("GetVersionInfo") != -1) {
			gVersion = "0.0.0.0";
			return true;
		}
	}
	else {
		if (url.indexOf("volume.html") != -1) {
			if (msg.indexOf("Object doesn't support this property or method") != -1) {
				gVersion = "0.0.0.0";
				return true;
			}
			else if (msg.indexOf("Unspecified error") != -1) {
				gVersion = "0.0.0.0";	// here when not quite installed yet?
				return true;
			}
		}
	}
	alert(msg);

	return false;
}


function PlayerOnError(errId, errCode, msg)
{
	if (!bHandlingError && bShowMoreErrors)	{
		bHandlingError = true;//'MessageBox to death' avoidance
		HideBufferingImage();

		if (errId == 110 || errId == 109 || errId == 105 || errId == 208) {
			PlayState = -1;
			bShowMoreErrors = false;
			//try to go thru clerk again
			if (!InRetry) {
				Retry();
				return;
			}
		}

		if (!GetCookieEx('box_mc', 'LOK') && (errId == 110 || errId == 109 || errId == 105 || errId == 208)) {
			bShowMoreErrors = false;
			embeddedPlayer.Stop();//stop retrying
			if (confirm("Could not listen to stream (Error Code:" + errCode+")\n\n" + msg + "\n\nPress OK for more information.")) {
				KillWarning();
				var URL = 'http://'+ GetHostServer() + '/mini/cantplay365.html';
				if (parent.GetSite())
					URL += 	"?site=" + parent.GetSite();
				parent.location = URL;
			}
		}
		else if (errId == 215) {
			var url = 'http://'+ GetHostServer() + "/mini/login.live?PMonly=1&error=3";

			KillWarning();
  			parent.location = url;
		}
		else if (errId == 104) {
			//do nothing here. A 104 error is generated as a side-effect by a server-full operation
			// which we want handled silently, so don't report it. It is a generic xa internal error
			//so we can't do anything about it anyway.
		}
		else {
			if (confirm("Error Code:" + errCode + "\n\n" +msg +  "\n\nPress OK for more information."))
				PlayerLookUpError(errCode);
		}

		bHandlingError = false;
	}
}


function PlayerOnStop(code, msg)
{
	TraceAlert(3, "PlayerOnStop(" + code + ", " + msg + ") called");
	gShowBuffering = 0;

	ClearPlayTimers('all');

	if (PlayState) { // not already stopped
		PlayState = 0;
		UpdateMeter(0);
		KillWarning();
	}

	for (var i = 0; i < PlayStopCallbacks.length; i++)
		eval(PlayStopCallbacks[i]);

	window.onUnload = null;

	if (code)
		alert(msg);
}


function DelayedCall(action, delay)
{
	if (gDelayTimer) {
		clearTimeout(gDelayTimer);
		gDelayTimer = null;
	}

	if (delay < 0) {
		if (action == 'reconnect')
			Reconnect();
	}
	else
		gDelayTimer = window.setTimeout('DelayedCall("' + action + '", -1);', delay);
}


function GetPlayURL(stn, app_id, caller, from, user_data)
{
	var host	= GetHostServer();
	var player = GetThisPlayer();

	var playUrl = "http://" + host;

	if ((player == 'MP3' && !client.isAndroid) || player == 'QT' || (player == 'HTML5' && client.isApple))
		playUrl +=  "/cgi-bin/play.pls?station=" + stn + "&ff=15&direct=1";
	else {
		playUrl +=  "/play/" + stn + "?ff=15";
		var v = GetCookie("sessionid");
		if (v != null)
			playUrl += '&sessionid='+v;
	}

	if (app_id)
		playUrl += "&app_id=" + encodeURIComponent(app_id);

	if (caller)
		playUrl += "&caller=" + encodeURIComponent(caller);

	if (from)
		playUrl += "&from=" + encodeURIComponent(from);

	if (user_data)
		playUrl += "&user_data=" + encodeURIComponent(user_data);

	return playUrl;
}


function Reconnect()
{
	var currentDate = new Date();
	var now = currentDate.getTime() % 100;
	var playUrl = "http://" + GetHostServer() + "/play/" + parent.GetStationName() + "?now=" + now + "&" + parent.GetPlayParams();
	return Play(playUrl);
}


function GetContentLength()
{
	var len = 0;
	var embeddedPlayer = GetPlayerObj();
	if (embeddedPlayer) {
		try {
			var poc = GetThisPlayer();
			if (poc == "FLASH" || poc == "FLASH3")
				len = embeddedPlayer.GetContentLength();
		}
		catch(e) {
			TraceAlert(3, "GetContentLength() call failed");
			len = 0;
		}
	}
	return len;
}


function PlayerOnNeedReconnect(code, msg)
{
	PlayerOnStop(0, '');

	try {
		var poc = GetThisPlayer();
		if (poc == "FLASH" || poc == "FLASH3") {
			var len = GetContentLength();
			if (len % 1000 == 123) {	// operator streams have lengths that end in '123'
				alert("Your listening session ended with an error.\n\nMake sure you're logged in correctly and press PLAY to reconnect.");
				return true;
			}

			DelayedCall('reconnect', 1);
			return true;
		}
	}
	catch(e) {
	}

	if (code)
		alert(msg);

	return false;
}


function PlayerOnDrop()
{
	gShowBuffering = 0;
	DropCount = DropCount + 1;
	ShowConnectingImage();
	KillWarning();
}


function PlayerOnStartPlaying()
{
	gShowBuffering = 0;

	PlayState = 3;
	RetryCount = 0;
	InRetry = false;

	TraceAlert(3, "PlayerOnStartPlaying() called");

	if (bEverListened == false) {
	 	bEverListened = true;
	   	RememberItEx('box_mc', 'LOK', 1);
	}

	HideBufferingImage();

	for (var i = 0; i < PlayStartCallbacks.length;i++)
		eval(PlayStartCallbacks[i]);

    var player = GetThisPlayer();

	if (player != 'FLASH' && player != 'FLASH3' && player != 'HTML5') {
		if (player == 'QT')
			ClearPlayTimers('all');

		PlayerOnVolumeChange();

		UpdateMeterView(100, true);	// force a complete redraw of the buffering meter
		UpdateMeter(0);
		UpdateMeter(GetCookieVolume());
	}

	PlayerActivateWarning(true, player)
}


function PlayerOnBuffer(bufferpercent)
{
	if (!gShowBuffering)
		return;

	PlayState = 2;

	if (bufferpercent == 0)
		ShowWaitingImage();
	else
		ShowBufferingImage();

	for (var i = 0; i < BufferCallbacks.length; i++)
		eval(''+BufferCallbacks[i]+'('+bufferpercent+');');

	UpdateMeterView(bufferpercent, true);
}


function PlayerOnStreamFormat(format)
{
	if (format == 0)
		gStreamFormat = 'MP3';
	else if (format == 1)
		gStreamFormat = 'MP3PRO';
	else if (format == 2)
		gStreamHiFi = 'HI_FI';
	else if (format == 3)
		gStreamHiFi = 'LO_FI';

	DrawPlayerIndicator()
}


function DrawPlayerIndicator()
{
	var img = "";

	if (gStreamFormat == 'MP3')
		img = cMp3ProOff;
	else
		img = cMp3ProOn;

	if (img != "" && parent.frames.Live365PlayerLogo && parent.frames.Live365PlayerLogo.mp3pro_winkie)
		parent.frames.Live365PlayerLogo.mp3pro_winkie.src = gSiteImageDir + img;
}


function PlayerOnConnectionLost()
{
	if (RetryCount > 0) // we never connected so ignore lost connection messages
		return ;

	PlayState = 0;

	if (!bHandlingError) {
		bHandlingError = true;

		if (confirm("Connection was lost - Retry ?")) {
			Retry();
			return ;
		}

		bHandlingError = false;
	}
	KillWarning();
}


function PlayerOnVolumeChange()
{
	if (PreviousVol == -1) {
		PreviousVol = GetVolume();
		SetVolume(GetCookieVolume(), false);
	}
}


function IsModernNS()
{
	try {
		if (client.isIE || client.isFirefox || client.isSafari || client.isCamino || client.isOpera)
			return false;
	}
	catch(e) {
	}

	if (navigator.appName == "Netscape" && (navigator.userAgent.indexOf("Netscape6") != -1 || navigator.userAgent.indexOf("Netscape/7.0") != -1))
		return true;

	return false;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fixDelimiter -- make sure we are comma delimited -- used to munge Player365
//   version numbers between "1.0.0.6" and "1,0,0,6", which is what IE accepts.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function fixDelimiter(playerVer)
{
	return(playerVer.replace(/[.]/g,","));
}


// NewP365VersionAvailable -- compares cookie version with latest version from version.js
function NewP365VersionAvailable()
{
    // no need to check for newbies
    if (!GetCookieEx('player_mc', 'ver') && !GetCookieEx('player_mc', 'verpro'))
        return false;

	return VersionLessThan(GetP365VersionFromCookie(), GetP365AvailableVersion(), 1);
}


function GetPOC(bSniff)
{
	if (GetPOC.arguments.length < 1)
		bSniff = true;

	var HostApp = GetHostApp();

	if (HostApp != null) {
		if (HostApp.HasPlayer) {
			// SetCookieEx('user_mc', "VPH", HostApp.HID);
			return 6;
		}
	}

	return GetPlayerCode();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GetPOCName -- returns the name of a specified player from the POCInfo hash
//   defined above.  This function was moved from sniffer.js, and supports JS
//   function calls output from mini.cgi.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetPOCName(poc)
{
	for (var v in POCInfo) {
		if (parseInt(POCInfo[v].POC) == poc)
			return POCInfo[v].PLAYERCODE;
	}

	return (navigator.appName.indexOf("Microsoft") != -1) ? "FLASH3" : "FLASH";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GetP365VersionFromCookie -- returns the user's *as-installed* version number of
//   Player365 from either the 'ver' or 'verpro' subfield in the 'player_mc' meta cookie.
//   Automatically gets the appropriate version based on value gMP3Pro.
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetP365VersionFromCookie()
{
	var cookieName = 'ver';
	var cookieVer;

    if (gMP3Pro)
		cookieName = 'verpro';

	if (cookieVer = GetCookieEx('player_mc', cookieName))
		return(cookieVer);
	else
		return('');
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GetP365AvailableVersion -- returns the latest version number of Player365,
//   automatically switching between P365 and P365VIP based on gMP3Pro
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function GetP365AvailableVersion()
{
	return(fixDelimiter((gMP3Pro)? g365CurVIPVer : g365CurVer));
}


function HasPlayer(somePlayer)
{
	return true; // this used to live in sniffer.js and be based on VBScript sniffing.
}


//The version strings are like 1,2,3,4. If the third digit is 1 or 2, this is for
//the MP3Pro player. If 0, it is the standard player. So ignore the third number.
//"Is the target version less than the source?"
function VersionLessThan(target, source, bPlayer365)
{
	var Tararr = target.split(/[\.\,]/g);
	var Srcarr = source.split(/[\.\,]/g);
	var imax = Math.min(Tararr.length, Srcarr.length);
	var i = 0;

	for (i = 0; i < imax; i++) {
		if (bPlayer365 && i == 2)
			continue;			//skip the MP3Pro identifier (the 3rd number in the 4 value Version string.)

		if (parseInt(Tararr[i]) < parseInt(Srcarr[i]))
			return true;
		else if (parseInt(Tararr[i]) > parseInt(Srcarr[i]))
			return false;
	}

	return false;
}


function JSAlert(str)
{
	TraceAlert(1, "The embedded FLASH control reports:\n" + str);
}


var gTraceAlertMsg = '';
var gTraceTimer = null;

function TraceAlert(severity, str)
{
	if (severity <= gDebugMsgLevel) {
		str += "\nPlayState = " + PlayState;
		str = str.replace(/["]/g, "&quot;");
		str = str.replace(/[']/g, "&#39;");
		gTraceAlertMsg = str;
		gTraceTimer = window.setTimeout('DoAlertTrace()', 10);
	}
}


function DoAlertTrace()
{
	ClearPlayTimers('buffering');
	gTraceTimer = null;

	if (gTraceAlertMsg) {
		console.log(gTraceAlertMsg);
		gTraceAlertMsg = '';
	}
}


function PlayerActivateWarning(fOn, player)
{
	// overridden in volume.html typically
}


function KillWarning()
{
	// overridden in volume.html typically
}


function ParentHasEmbeddedPlayer()
{
    var p = GetThisPlayer();
	return (p == "FLASH" || p == "FLASH3" || p == "WMP" || p == "G2" || p == "365" || p == "365_VIP" || p == 'QT' || p == 'HTML5');
}

function PlayerOnFoundAds(seconds, delayInMS)
{
	// obsolete
}

function PlayerOnFoundAdsExt(seconds, delayInMS, creativeID, creativeLengthInMS)
{
	console.log('--------This is the signal from stream that we have a replacible ads-------');
	if (gActivateClientAdReplacement) {
		var residualBannerUrl = '';
		var residualBannerClickUrl = '';

		if (creativeID === undefined)
			creativeID = '';

		if (creativeLengthInMS === undefined)
			creativeLengthInMS = 0;

		parent.TriggerClientAd(delayInMS, seconds, residualBannerUrl, residualBannerClickUrl, creativeID, creativeLengthInMS);

		if (parent.gTesting == 'R')
			StartInstreamAdCountdown(seconds, delayInMS);
	}
}

var gCDTimer = null;
var gCDTimerLeft = 0;
var gCDTimerLength = 0;
function StartInstreamAdCountdown(seconds, delayInMS)
{
	if (gCDTimer)
		window.clearTimeout(gCDTimer);

	SetHTMLContent('pinkMsg', "PlayerOnFoundAds(" + seconds + "s, " + delayInMS + "ms)");

	var delay = 1000 + (delayInMS%1000);
	gCDTimerLeft = delayInMS - delay;
	gCDTimerLength = seconds;
	gCDTimer = window.setTimeout('ShowCountdown()', delay);
}

function ShowCountdown()
{
	gCDTimerLeft -= 1000;

	var msg = (gCDTimerLeft > 0) ?
		"Ad will run in " + gCDTimerLeft + "ms" :
		"Ad running: played " + parseInt(-gCDTimerLeft/1000) + "/" + gCDTimerLength + "s";

	if (gCDTimerLeft < -gCDTimerLength*1000) {
		window.clearTimeout(gCDTimer);
		gCDTimer = null;
		gCDTimerLength = 0;
		msg = "Ad complete; sniffing...";
	}
	else
		gCDTimer = window.setTimeout('ShowCountdown()', 1000);

	SetHTMLContent('pinkMsg', msg);
}