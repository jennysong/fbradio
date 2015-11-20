// (c) 2008-11 Live365, Inc. - Custom PRO Player generic include file
//
//******************************************************************************************************************
// Required - all versions of this page will require these parameters that identify which stream is to be launched.
//
var station_broadcaster		= 'easylisteningradio';		// DJ name
var station_id				= 345745;				// station numeric ID
var stream_id				= 1351807;				// stream numeric ID

//
// Alternatively, you can define your own stylesheet to control the display of the playlist information.
// If you do that, you'll need to define some other JS variables, too.  The CSS file should define all
// of the styles required to draw the playlist frame.
//
var web_server				= 'http://www.live365.com';	// web server to pull /play and PLS data from
var local_css				= web_server + '/mini/pls.css';
var imageDir				= web_server + '/mini/images/';

//******************************************************************************************************************
// Optional - most applications will want to provide these parameters with 
// every call.  
//	'afl'		 - indicates whether we use try to connect to the AFL version of a station.
//	'vip'		 - indicates whether we use the Player365 or Player365-VIP ActiveX control.
//	'session_id' - specifies the listener's login information, typically returned from an api_login.cgi call
//	'tag'		 - indicates which service is being credited for this stream launch
//	'web_server' - specifies domain for /play and PLS services and also for graphics images
//	'no_branding'- true to suppress Live365 branding in PLS frame
//	'no_buttons' - true to suppress buy buttons in PLS frame
//	'pls_rtl'	 - true to set right-to-left text direction in PLS frame
//
var afl						= 0;			// attach to the AFL version of the station
var vip						= 0;			// use VIP or regular Player365
var session_id				= GetCookie('sessionid');	// listener's sessionid (member_name:session_key); will use cookie if not provided
var tag						= '';			// unique client organization id
var token					= '';			// unique client organization authentication token
var pls_rtl					= 0;			// true to set right-to-left text direction in PLS
var no_branding				= 1;			// true to suppress Live365 branding in PLS frame
var no_buttons				= 1;			// true to suppress buy buttons in PLS frame
var mode					= -1;

var member_name				= '';
var session_key				= '';

if (session_id) {
	var sess = session_id.split(':');
	if (sess && sess.length > 1) {
		member_name = sess[0];
		session_key = sess[1];
	}
}

ReadParameters();	// may override poc and vip

var player = GetPlayer();

//RememberItEx('box_mc', 'POC', poc);
RememberItEx('box_mc', 'LOK', 1);
RememberItEx('box_mc', 'beta', (vip) ? "mp3PRO" : '');
SetCookie("afl", afl);

// Some other cookies you can tweak to adjust Player365 performance
//
//	RememberItEx("player_mc","BufSize", 4);
//	RememberItEx("player_mc","ProxyPort", '0');
//	RememberItEx("player_mc","ProxyServer", '0');
//	RememberItEx("player_mc","UseProxy", 'N');

//
// These variables are required by vb_sniff_lite.js and player.js.
//
var memberName		= station_broadcaster;
var streamID		= stream_id;
var gMP3Pro			= vip;					// default to use VIP player
var bVertical		= 0;					// which way to draw volume bar
var gPLRflag		= "N";
var gSetupFlag		= 0;
var live365VerifyMessage = 0;
var plrFlag			= 'Y';

//*********************//
//** Basic functions **//
//*********************//
function ReadParameters()
{
	var url = window.location.href;

	url = url.replace(/\+/g, " ");

	var arg_list = url.split("?");

	if (arg_list.length <= 1)
		return;

	var nv_pairs = arg_list[1].split("&");
	var i;
	
	for (i = 0; i < nv_pairs.length; i++) {	// for each name=value pair
		var nv_pair = nv_pairs[i].split("=");

		if (nv_pair.length > 1) {
			var val = nv_pair[1];
			
			switch(nv_pair[0]) {
				case "station_broadcaster":
				station_broadcaster = val;
				break;

				case "station_id":
				station_id = parseInt(val);
				break;

				case "stream_id":
				stream_id = parseInt(val);
				break;

				case "poc":
				poc = parseInt(val);
				break;

				case "vip":
				vip = parseInt(val);
				break;

				case "afl":
				afl = parseInt(val);
				break;

				case "session_id":
				session_id = val;
				break;

				case "tag":
				tag = val;
				break;

				case "token":
				token = val;
				break;

				case "web_server":
				web_server = unescape(val);
				break;

				case "pls_rtl":
				pls_rtl = parseInt(val);
				break;

				case "no_branding":
				no_branding = parseInt(val);
				break;

				case "no_buttons":
				no_buttons = parseInt(val);
				break;
			}
		}
	}
}


//
// Build a /play url with all of the parameters necessary to yield a successful stream launch.
//
function GetLaunchURL()
{
	var conn			= '&';
	var launchUrl		= GetPlayURL(station_id);

	var visit_count		= GetCookie('VisitCount');
	var sane_ID			= GetCookie('SaneID');

	if (tag) {
		launchUrl += conn + "tag=" + tag;
	}

	if (token) {
		launchUrl += conn + "token=" + token;
	}

	if (session_key) {
		launchUrl += conn + "session=" + session_key;
	}	

	if (member_name) {
		launchUrl += conn + "membername=" + member_name;
	}	

	if (visit_count) {
		launchUrl += conn + "VisitCount=" + visit_count;
	}	

	if (sane_ID) {
		launchUrl += conn + "SaneID=" + sane_ID;
	}

	if (player == 'G2' || player == 'MP3')
		launchUrl += conn + "filename.pls";
	else if (player == 'WMP')
		launchUrl += conn + "filename.m3u";

	return launchUrl;
}


//
// This will be called when the player control needs to reconnect to the Nanocaster.
//
function Retry()
{
	HandleAction('stop');

	InRetry = true;
	RetryCount++;

	HandleAction('play'); // delayed call
}



//
// Just a little local JS file to handle the little gray buttons on our test page.
//
var gOnLoadTimer = null;

function HandleAction(action)
{
	var launchUrl = GetLaunchURL();

	if (action == 'play' || action == 'playnow') {
		Play(launchUrl);
		if (client.hasHTML5) {
			var vol = GetCookieVolume(); // restore last known volume
			SetVolume(vol, true);
			setTimeout(function() { UpdateMeter(vol); }, 100);
		}
	} else if (action == 'stop') {
		Stop();
	}
	
	return false;
}

function DoOnLoadActions() 
{
	window.clearTimeout(gOnLoadTimer);
	HandleAction('playnow');
	return true;
}


//
// This function is responsible for drawing the mp3PRO indicator lights.
//
function DrawPlayerIndicator()
{
	var img = "";

	if (gStreamFormat == 'MP3')
		img = "indicator-mp3pro-off.gif";
	else
		img = "indicator-mp3pro-on.gif";

	document.mp3pro_winkie.src = web_server + "/mini/images/" + img;
}


//
// DrawControls - draws player controls
//
var gPreBtnVertSpace = 8;
var gPlayerColor = '#000000';	// black by default

function DrawControls()
{
	var s = ''
	memberName	= station_broadcaster;		// make sure player control and page agree on what station we're playing!
	streamID	= stream_id;
	
	document.write('<tr valign="top">');
	
	if (player != "MP3") {					// Draw player; bypass check version/LS logic
		//
		// Draw volume bar and player control for embedded players
		//
		document.write('<td align="center">');
		DrawMeter(bVertical, imageDir);		// Draw volume meter
		DrawPlayer(0, gPlayerColor);		// Draw the embedded audio playback control
		s = '</td>';
	}

	//
	// Last (only one on Mac) row has the VCR buttons.
	//
	s += '<td>';
	s += '<img border="0" src="/images/dot.gif" width="81" height="' + gPreBtnVertSpace + '"><br>';
	s += '<img alt="PLAY" src="' + imageDir + 'radio-play.gif" width="41" border="0" height="36" style="cursor:pointer; cursor:hand" onclick="HandleAction(\'playnow\')">';

	if (player != 'MP3')
		s += '<img alt="STOP" src="' + imageDir + 'radio-stop.gif" width="45" border="0" height="36" style="cursor:pointer; cursor:hand" onclick="HandleAction(\'stop\')">';

	s += '</td></tr>';

	document.write(s);
	
	// removing mute button
	var myEl = document.getElementsByName("mute");
	var elP = myEl[0].parentNode.parentNode;
	elP.removeChild(myEl[0].parentNode);
}


//
// DrawPLS - display the playlist metadata in an iframe that will update itself.
//
//
var gPLSWidth = 290;
var gPLSHeight = 90;

function DrawPLS(extra)
{
	//
	// PLS_server - this provides the playlist information to the web page.  Slightly
	// different forms if pulling from the ad-free stream:  use "afl:" prefix.
	//
	var PLS_server = web_server + "/mini/playlist.html?station=";

	PLS_server += station_broadcaster;

	var ads = 1;
	
	if (afl && session_key)
		PLS_server += "afl%3A";
	else
		ads = 0;

	PLS_server += "&ads=" + ads;

	var hide = '';
	
	if (no_branding)
		hide += 'T';

	if (no_buttons)
		hide += 'BW';
		
	if (hide)
		PLS_server += "&hide=" + hide;
		
	if (local_css)
		PLS_server += "&css=" + escape(local_css);
	
	if (extra)
		PLS_server += '&' + extra;
		
	var dir = (pls_rtl) ? ' dir="rtl"' : '';
		
	document.write('<iframe src="' + PLS_server + '" name="Live365PlayerPlaylist" scrolling="AUTO" noresize frameborder="No" marginwidth="0" marginheight="0" width=' + gPLSWidth + ' height=' + gPLSHeight + dir + '></iframe>');
}


//
// Wrappers that reference globals set up in top Player Window templates.
//
function IsDefined(prop, obj)
{
	return prop in obj;
}

function Nvl(v, dflt)
{
	return IsDefined(v, this) ? eval(v) : dflt;
}

function IsProSkinned()
{
	return (Nvl('plrFlag', 'N') == 'Y');
}

function GetStoreURL()
{
	return Nvl('ecommUrl', '');
}

function GetInstallArgs()
{
	return 'source=' + GetSource() + '&site=' + GetSite() + '&plrflag=' + GetPlrFlag() + '&url=' + encodeURIComponent(GetLaunchURL());
}

function IsSetUp()
{
	return Nvl('listeningSetup', 0);
}

function IsLoggedIn()
{
	return Nvl('loggedIn', 0);
}

function GetToken()
{
	return Nvl('token', '');
}

function GetAuthType()
{
	return Nvl('AuthType', 'NORMAL');
}

function GetImageDir()
{
	return Nvl('imageDir', '/scp/live365/images');
}

function GetCSS()
{
	return Nvl('css', '');
}

function GetSite()
{
	return Nvl('site', 'live365');
}

function GetStationName()
{
	return Nvl('memberName', '');
}

function GetStationID()
{
	return Nvl('stationID', 0);
}

function GetGenre()
{
	return Nvl('streamGenre', '');
}

function GetPrimaryGenre()
{
	try {
		return GetGenre().split(",")[0];
	}
	catch(e) {
	}

	return '';
}

function GetDoPreRoll()
{
	return Nvl('DoPreRoll', 0);
}

function SetDoPreRoll(val)
{
	DoPreRoll = val;
}


function GetDisplayType()
{
	return Nvl('displayType', 'LIVE365');
}

function SetDisplayType(val)
{
	displayType = val;
}

function GetStreamID()
{
	return Nvl('streamID', 0);
}

function GetStationID()
{
	return Nvl('stationID', 0);
}

function SetPlayer(val)
{
	player = val;
}

function GetStreamBitrate()
{
	var br = Nvl('bitrateStream', 64);
	return isNaN(br) ? 64 : parseInt(br);
}

function GetStreamType()
{
	return Nvl('streamType', 'RADIO');
}

function GetServerMode()
{
	return Nvl('serverMode', 'OR');
}

function GetPlayParams()
{
	return Nvl('play_params', '');
}

function GetNanocasterParams()
{
	return Nvl('nanocaster_params', '');
}

function GetPlrLevel()
{
	return Nvl('plrLevel', '');
}

function GetPlrFlag()
{
	return Nvl('plrFlag', '');
}

function GetODAPlaylist()
{
	return Nvl('playlist', '');
}

function GetODATrack()
{
	return Nvl('ODAtrack', '');
}

function GetODAPosition()
{
	return Nvl('ODApos', 0);
}

function GetODASessionKey()
{
	return Nvl('ncSessionKey', '');
}