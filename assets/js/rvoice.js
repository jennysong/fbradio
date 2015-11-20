//volume_down();
var incr = 0;
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
	if (counter < finalLength) {
		if (incr < init[0].length) {
			if(incr == 0) {
				responsiveVoice.speak("Created by" + init[0][incr], "UK English Male", {onend: speak});
				incr++;
			} else if (incr == 1){
				responsiveVoice.speak("At" + init[0][incr], "UK English Male", {onend: speak});
				incr++;
			} else if (incr == 2){
				responsiveVoice.speak("message is " + init[0][incr], "UK English Male", {onend: speak});
				incr++;
			} else {
				responsiveVoice.speak("last one" + init[0][incr], "UK English Male", {onend: speak});
				incr++;
			}
		} else {
			console.log("test")
			incr = 0;
			counter++;
			init.shift();
			speak();
			//esponsiveVoice.speak("", "UK English Male", {onend: speak});
		}
	}
}
responsiveVoice.AddEventListener('OnReady', speak);
volume_up();

	


/*
if (test < 5) {
			responsiveVoice.speak("hello world", "UK English Male", {onstart: StartCallback, onend: function});

		} else {
			responsiveVoice.speak("hello world", "UK English Male", {onstart: StartCallback, onend: EndCallback});
		}
		test++;
*/
