
var counter = 0;

var extra = [
    "Hi Joseph",
    "Hi joshua",
    "Hi Youn",
    "Hi Jenny"
];

var extra2 = [
    //"2015-11",
    //"lambo",
    //"audi",
    //"Mercedes"
];

var init = [];
init.push(extra);
init.push(extra2);
var finalLength = init.length;

function speak() {
	var string = ''

	if (counter < finalLength) {
		volume_down();
		string += "Created by " + init[0][0] + " At " + init[0][1] + " message is " + init[0][2] + " last one " + init[0][3]

		console.log(string);
		responsiveVoice.speak(string,"UK English Male",{onend: volume_up})
		
		console.log("counter: "+counter+" finalLength: "+finalLength)

		counter++;
		init.shift();
		finalLength;
		//volume_up();
		speak();
		//responsiveVoice.speak("", "UK English Male", {onend: speak});
		
	}
	
}



	


/*
if (test < 5) {
			responsiveVoice.speak("hello world", "UK English Male", {onstart: StartCallback, onend: function});

		} else {
			responsiveVoice.speak("hello world", "UK English Male", {onstart: StartCallback, onend: EndCallback});
		}
		test++;
*/
