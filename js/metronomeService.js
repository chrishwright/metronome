metronomeApp.service('FormService', function() {
	
	var artist,
		tempo,
		genre;		
		
	this.setArtist = function(sArtist) {	
		artist = sArtist;	
	}
	
	this.setTempo = function(sTempo) {
		tempo = sTempo;
	};
	
	this.setGenre = function(sGenre) {
		genre = sGenre;
	}
	
	this.getTempo = function() {
		return tempo;
	};
	
	this.getArtist = function() {
		return artist;
	}
	
	this.getGenre = function() {
		return genre;
	}	
});

metronomeApp.service('HttpService', function($http) {
			
	var HttpService = {
		async: function(artist,tempo,genre) {
		
			console.log(tempo);
			
			if (artist != null) {
				var url = "http://developer.echonest.com/api/v4/song/search?api_key=LDIRMIDPQGN63FHHX&min_tempo="+(tempo-5)+
				"&max_tempo="+(tempo+5)+"&results=5&sort=artist_familiarity-desc&artist="
				+artist+"&bucket=audio_summary&callback=JSON_CALLBACK";
			}
			
			else {
			
				var url = "http://developer.echonest.com/api/v4/song/search?api_key=LDIRMIDPQGN63FHHX&min_tempo="+(tempo-5)+
				"&max_tempo="+(tempo+5)+"&results=5&sort=artist_familiarity-desc&style="
				+genre+"&bucket=audio_summary&callback=JSON_CALLBACK";
			
			}

			var promise = $http.get(url).then(function (response) {
				return response.data;
			});

			return promise;		
		}
	};
	  
	return HttpService;
});