
var counter = 0;
var flag = true;
var extra = [
    "Hi Joseph",
    "Hi joshua",
    "Hi Youn",
    "Hi Jenny"
];

var extra2 = [
    "2015-11",
    "lambo",
    "audi",
    "Mercedes"
];

var messages_array = [];
messages_array.push(extra);
messages_array.push(extra2);

function speak() {
	var string = ''
	if (counter < messages_array.length) {
		volume_down();
		string += "Created by " + messages_array[0][0] + " At " + messages_array[0][1] + " message is " + messages_array[0][2] + " last one " + messages_array[0][3];
		console.log(string);
		responsiveVoice.speak(string,"UK English Male",{onend: function(){
		  volume_up(); 
			setTimeout(speak, 0); 
		} });
		messages_array.shift();
	} else {
		console.log("loop");
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
