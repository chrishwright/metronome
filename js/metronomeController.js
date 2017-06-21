var metronomeApp = angular.module('metronomeApp',['ngRoute']);

metronomeApp.controller('MainCtrl',['$scope',function($scope) {

	$scope.tempo = {value: 60};
	$scope.style = 'plain';
	$scope.message = {value: ''};
	$scope.minTempo = 40;
	$scope.maxTempo = 208;

	$scope.$watch('tempo.value', function(val) {
	
		if (isNaN(val) || val == null) {
				$scope.message.value = 'Range must be between 40-208 BPM';		
		}
		
		else {			
			$scope.message.value = '';
			bpm = $scope.tempo.value;			
		}					
	}, true);
}]);

metronomeApp.controller('SubdivisionController', ['$scope', function($scope) {

	$scope.notes = [	
		{label: 'quarter', selected: true},
		{label: 'eighth', selected: false},
		{label: 'sixteenth', selected: false}	
	]
	
	$scope.getNoteClass = function(status) {		
		return { note_highlight : status };		
	};

	$scope.subDiv = function(value) {
				
		switch (value) {		
			case 'quarter':
				subdivision = 1;
				$scope.notes[0].selected = true;
				$scope.notes[1].selected = false;
				$scope.notes[2].selected = false;
				meter = 4;
				strongBeat = 1;
				weakBeat = 2;					
				break;
			case 'eighth':
				subdivision = 2;
				$scope.notes[0].selected = false;
				$scope.notes[1].selected = true;
				$scope.notes[2].selected = false;
				meter =	8;
				strongBeat = 1;
				weakBeat = 2;
				break;
			case 'sixteenth':
				subdivision = 4;
				$scope.notes[0].selected = false;
				$scope.notes[1].selected = false;
				$scope.notes[2].selected = true;
				meter = 4;
				strongBeat = 1;
				weakBeat = 2;
		}
	};
}]);

metronomeApp.controller('TapTempo', ['$scope',function($scope) {

	var average,
		sum = 0,
		count = 0,
		clicks = [],
		timeExceeded = 3000,
		timeElapsed = 0;
						
	$scope.tapTempo = function() {
			
		if (count < 4) {
			clicks.push(new Date());
			$scope.message.value = 'Keep Tapping';
			count++;		
		}
				
		else if (count >= 4 && timeElapsed < timeExceeded) {
		
			clicks.push(new Date());
			
			for (var i = 1; i < clicks.length; i++) {			
				
				sum += clicks[i] - clicks[i-1];
								
				if (i == clicks.length - 1) {				
					timeElapsed = clicks[i] - clicks[i-1];					
				}
			}
						
			if (timeElapsed < timeExceeded) {			
				average = 60000 / ((sum / (clicks.length - 1)));
			
				if (average >= 40 && average <= 208) {
					$scope.tempo.value = Math.round(average);
				}
			
				else if (average > 208) {
					$scope.tempo.value = 208;
				}
			
				else {
					$scope.tempo.value = 40;
				}			
			}
			
			else {
			
				count = 0;
				timeElapsed = 0;
				clicks = [];
			
			}

			sum = 0;
			clicks.splice(0,1);
				
		}
	};
}]);

metronomeApp.controller('APIController', ['$scope','RESTService','$location','FormService', 
	function($scope,RESTService,$location,FormService) {
		
		$scope.items = [];
		
		$scope.$watch('checked', function() {

			if ($scope.checked) {
				$location.path('/selection');
			}
			else {
				FormService.clearMap();
				$scope.items = [];
				$location.path('/');
			}
		},true);
		
		$scope.doSearch = function() {
			console.log('in search');
			FormService.clearMap();
			$scope.items = [];
			$location.path('/selection');
		}
		
		$scope.makeApiCall = function() {

			RESTService.getAccessToken().then(function(response) {
				RESTService.getSongs(response, FormService.getArtist()).then(function(response) {

					var tempo = FormService.getTempo();
					var minTempo = tempo - 5;
					var maxTempo = tempo + 5;
					
					for(var key in FormService.getKeys()) {

						var obj = FormService.getTrackInfo(key);
						if(obj.tempo >= minTempo && obj.tempo <= maxTempo) {
							$scope.items.push(obj);
						}
						else {
							continue;
						}
	
					} // end for loop
				});
			});
		}
}]);

metronomeApp.controller('FormController', ['FormService','$location','$scope', 
	function(FormService,$location,$scope) {
	
	$scope.submit = function() {
		
		FormService.setArtist($scope.artist);
		FormService.setGenre($scope.genre);
		FormService.setTempo($scope.tempo);
		
		$scope.makeApiCall();
		
		$location.path('/listings');
					
	};
}]);