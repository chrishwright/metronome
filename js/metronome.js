window.onload = function() {
	var button = document.getElementById('startStopButton');
	button.onclick = startStopMetronome;	
}

var start = new Date().getTime(),
	time = 0,
	flag,
	timeoutId,
	strongBeat = 1,
	weakBeat = 2,
	meter = 4,
	onOff = 0,
	bpm,
	subdivision = 1;
	
var AudioContext = window.AudioContext || window.webkitAudioContext;	
var context = new AudioContext();

function Click(context) {

	this.context = context;	

	this.setup = function() {
		this.osc = this.context.createOscillator();
		this.gain = this.context.createGain();
		this.osc.connect(this.gain);
		this.gain.connect(this.context.destination);
	};
	
	this.trigger = function(time,frequency) {
	
		this.setup();
		this.osc.frequency.setValueAtTime(frequency, time);
		this.gain.gain.setValueAtTime(.2, time);
		this.osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
		this.gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
		this.osc.start(time);
		this.osc.stop(time + 0.5);
	
	};
};

function startStopMetronome() {
	if (onOff === 0) {
		onOff = 1;
		beat();
	}
	else {
		onOff = 0;
	}
}

function beat() {		
	if (onOff)
		timeoutId = setTimeout("beat()", (60000 / bpm) / subdivision);
		
	if (strongBeat == 1) {
		strongClick();
		strongBeat = 0;
	}

	else if (weakBeat <= meter) {
		weakClick();
		weakBeat++;
		if (weakBeat == (meter + 1)) {
			strongBeat = 1;
			weakBeat = 2;			
		}
		// method to subdivide eighth notes and accent quarter notes
		else if ((meter % weakBeat) != 0 && subdivision == 2) {
			// it should be a quarter note and a strong beat
			strongBeat = 1;
			weakBeat++;
		}
	}
}

function strongClick() {
	var click = new Click(context);
	var now = context.currentTime;
	click.trigger(now,400);
}

function weakClick() {
	var click = new Click(context);
	var now = context.currentTime;
	click.trigger(now,300);	
}