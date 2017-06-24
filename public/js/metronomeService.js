metronomeApp.service('FormService', function() {
	
	var artist,
		tempo,
		song_title,
		trackInfo = {};
		
	this.updateMap = function(songInfo) {
		trackInfo[songInfo.id] = {    
			title : songInfo.name, 
			tempo : songInfo.tempo,
			album : songInfo.album,
			artist : songInfo.artist						      
		};
	};
	
	this.getKeys = function() {
		return trackInfo;
	};
	
	this.clearTrackInfo = function() {
		this.trackInfo = {};
	}
	
	this.getTrackInfo = function(id) {
		return trackInfo[id];
	};
	
	this.updateTrackInfo = function(id, tempo) {
		trackInfo[id].tempo = tempo;
	}
		
	this.setArtist = function(sArtist) {	
		artist = sArtist;	
	};
	
	this.getArtist = function() {
		return artist;
	};
	
	this.setSongTitle = function(songTitle) {
		song_title = songTitle;
	};
	
	this.getSongTitle = function() {
		return song_title;
	};
	
	this.setTempo = function(sTempo) {
		tempo = sTempo;
	};
	
	this.getTempo = function() {
		return tempo;
	};

});

angular.module('metronomeApp').service('RESTService', ['$q','$http', 'FormService', function($q,$http, FormService) {

	var self = this;
	var prefix = 'https://api.spotify.com/v1/';
	self.albums = [];
	self.access_token = "";
	
	/**
	 * @param {access_token} the access_token used for authorization
	 * @param {artist} the artist that is to be retrieved
	 *
	 **/
	self.getSongsByArtist = function(access_token, artist) {
	
		
		var song_ids = [];
		var defer = $q.defer();
		var songs = {}; // map type used to keep track of song duplicates
		var track_information = [];
		
		var config = {
		
			headers : {'Authorization' : 'Bearer ' + access_token },
			params : { 
				q : artist,
				type : 'artist',
				limit : 1
			}
		};

		// search for the artist to get the spotify id of artist		
		$http.get(prefix + 'search', config).then(function(response) {	
			
			delete config.params.q;
			delete config.params.type;
			config.params.limit = 50;
			config.params.market = 'us';
			config.params.album_type = 'album';
			return $http.get(prefix + 'artists/' + response.data.artists.items["0"].id + '/albums', config);
			
		}).then(function(response) {
			
			// next find the albums with the artist id
			albums = response.data.items;
			var innerPromise = $q.defer();
			var promises = [];
			
			delete config.params.market;
			delete config.params.album_type;
			
			for(var i = 0; i < albums.length; i++) {
				var promise = $http.get(prefix + 'albums/' + albums[i].id + '/tracks', config);
				promises.push(promise);
			}
			
			$q.all(promises).then(function() {
				innerPromise.resolve(promises);
			});
			
			return innerPromise.promise;
		
		}).then(function(response) {
			// returned is an array of promise objects
			// next we traverse through all the albums to get each albums' tracks
			var firstIteration = true;
			var album_counter = 0;	

			for(var i = 0; i < response.length; i++) {
				// here we traverse every song on each album
				response[i].then(function(tracks) {										
					for(var j = 0; j < tracks.data.items.length; j++) {						
						if(j == 0 && !firstIteration) {
							album_counter += 1;
						}
						if(tracks.data.items[j].name.toLowerCase().includes('live')) {
							firstIteration = false;
							continue;
						} // end if
						else if(!songs[tracks.data.items[j].name]) {
							var tempObj = {
								id : tracks.data.items[j].id, 
								name : tracks.data.items[j].name,
								album : albums[album_counter].name,
								artist : albums[album_counter].artists["0"].name,
								tempo : null // no tempo yet
							};
							FormService.updateMap(tempObj);
							songs[tracks.data.items[j].name] = ' ';
							song_ids.push(tracks.data.items[j].id);
							firstIteration = false;
						} // end else if
						else {
							firstIteration = false;
							continue;
						} // end else
						
					} // end inner for

				});
			} // end outer for loop

			return song_ids;

		}).then(function(response) {

			var song_ids_short = song_ids.slice(0, 100); // Spotify API 100 song query limit
			song_ids_short = song_ids_short.join(','); // for comma separated list 
			config['params'] = { ids : song_ids_short };

			$http.get(prefix + 'audio-features', config).then(function(response) {

				// here we get the audio information for each track
				track_information = response.data.audio_features;
				
				if(track_information[0] != null) {
					for(var i = 0; i < track_information.length; i++) {	
						FormService.updateTrackInfo(track_information[i].id, track_information[i].tempo);				
					}
				} // end if

				defer.resolve(track_information);
			});

		}), function(errResponse) {
			console.error(errResponse);
			$q.reject(errResponse);
		};

		return defer.promise;
	}; // end method getSongsByArtist()
	
	/**
	 *
	 **/
	 self.getSongsByTitle = function(access_token, song_title) {
	 	
	 	var defer = $q.defer();
	 
	 	var config = {
		
			headers : {'Authorization' : 'Bearer ' + access_token },
			params : { 
				q : song_title,
				type : 'track',
				market : 'us',
				limit : 50
			}
		};

		// search for the artist to get the spotify id of artist		
		$http.get(prefix + 'search', config).then(function(response) {
			defer.resolve(response);
		}) ,function(errResponse) {
			console.error(errResponse);
		};
		
		return defer.promise;
	 };

	/**
	 * get the access token to harness metadata api
	 **/
	self.getAccessToken = function() {

		var prefix = "access_token";

		var defer = $q.defer();

		$http.get(prefix).success(function(data) {
			defer.resolve(data);
		}).error(function(err) {
			console.error(err);
		});

		return defer.promise;
	}; // end method getAccessToken

}]);
