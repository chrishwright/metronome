angular.module('metronomeApp').service('RESTService', ['$q', '$http', 'FormService', function($q, $http, FormService) {

    var self = this;
    var prefix = 'https://api.spotify.com/v1/';
    var song_ids = []; // keeps Spotify song ids
    var track_information = []; // holds the audio information for each track
    self.albums = []; // holds the albums to place with returned songs
    self.access_token = " ";

    var config = {
        headers: {},
        params: {}
    };

    /**
     * this function calls the Spotify api search method
     * @param {search_string} the query string
     * @param {search_type} the type of search (i.e. track or artist, etc.)
     * @return {defer.promise} the artists (if search_type is artist) or
     * the tracks (if search_Type is track)
     **/
    self.search = function(access_token, search_string, search_type) {

        var defer = $q.defer();

        config.params.q = search_string;
        config.params.type = search_type;
        config.headers = { 'Authorization': 'Bearer ' + access_token };

        if (search_type === 'artist')
            config.params.limit = 1; // limit is set to 1 because 1st result is most relevant
        else
            config.params.limit = 15;

        $http.get(prefix + 'search', config).then(function(response) {

                if (search_type === 'artist')
                    defer.resolve(response.data.artists.items["0"]);
                else {
                    defer.resolve(response.data.tracks.items);
                }
            }),
            function(errResponse) {
                console.error(errResponse);
            };

        return defer.promise;

    };

    /**
     * @param {artists} the artist results
     * @return {defer.promise} the albums for each artist
     **/
    self.getAlbumsByArtist = function(artists) {

        var defer = $q.defer();

        delete config.params.q;
        delete config.params.type;
        config.params.limit = 50;
        config.params.market = 'us';
        config.params.album_type = 'album';

        $http.get(prefix + 'artists/' + artists.id + '/albums', config)
            .then(function(response) {
                defer.resolve(response.data);
            });

        return defer.promise;
    };

    /**
     * gets the tracks from each album
     * @param {albumResponse} an array of albums
     * @return {innerPromise.promise} an array of promises of tracks from each album
     **/
    self.getSongsFromAlbums = function(albumsResponse) {

        var innerPromise = $q.defer();
        var promises = [];

        albums = albumsResponse.items;

        delete config.params.market;
        delete config.params.album_type;

        for (var i = 0; i < albums.length; i++) {
            var promise = $http.get(prefix + 'albums/' + albums[i].id + '/tracks', config);
            promises.push(promise);
        }

        $q.all(promises).then(function() {
            innerPromise.resolve(promises);
        });

        return innerPromise.promise;

    };

    /*
     * need to keep an array of promises from getSongsFromAlbums() so we make sure
     * that we can wait for the response of each albums' GET request 
     * @param {albumPromises} promise array. each promise has all the albums tracks
     **/
    self.getTracksFromAlbum = function(albumPromises) {

        var firstIteration = true;
        var album_counter = 0;
        var songs = {}; // map type used to keep track of song duplicates
        song_ids = [];

        for (var i = 0; i < albumPromises.length; i++) {
            // here we traverse every song on each album
            albumPromises[i].then(function(tracks) {
                for (var j = 0; j < tracks.data.items.length; j++) {
                    if (j == 0 && !firstIteration) {
                        album_counter += 1;
                    }
                    if (tracks.data.items[j].name.toLowerCase().includes('live')) {
                        firstIteration = false;
                        continue;
                    } // end if
                    else if (!songs[tracks.data.items[j].name]) {
                        var tempObj = {
                            id: tracks.data.items[j].id,
                            name: tracks.data.items[j].name,
                            album: albums[album_counter].name,
                            artist: albums[album_counter].artists["0"].name,
                            tempo: null // no tempo yet
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

    };

    /**
     * gets tempo, duration, key, etc. for each track 
     * @param {songs} the songs used to get audio information
     **/
    self.getAudioInformation = function(songs) {

        if (songs != null && song_ids.length == 0) {
            for (var i = 0; i < songs.length; i++) {
                var tempObj = {
                    id: songs[i].id,
                    name: songs[i].name,
                    album: songs[i].album.name,
                    artist: songs[i].artists[0].name,
                    tempo: null // no tempo yet
                };
                FormService.updateMap(tempObj);
                song_ids.push(songs[i].id);
            }
        }

        var defer = $q.defer();
        var song_ids_short = song_ids.slice(0, 100); // Spotify API 100 song query limit
        song_ids_short = song_ids_short.join(','); // for comma separated list
        config['params'] = { ids: song_ids_short };

        $http.get(prefix + 'audio-features', config).then(function(response) {

            // here we get the audio information for each track
            track_information = response.data.audio_features;

            if (track_information[0] != null) {
                for (var i = 0; i < track_information.length; i++) {
                    FormService.updateTrackInfo(track_information[i].id, track_information[i].tempo);
                }
            } // end if

            defer.resolve(track_information);
        });

        song_ids = [];

        return defer.promise;
    };

    /**
     * calls a chain of functions to get the audio information for each song
     * @param {access_token} the token to pass to Spotify api
     * @param {artist} the artist to search for
     **/
    self.getSongsByArtist = function(access_token, artist) {

        var defer = $q.defer();

        self.search(access_token, artist, 'artist').then(function(artist) {
                return artist; //return searched artist
            }).then(function(artist) {
                return self.getAlbumsByArtist(artist); // return artists' albums
            }).then(function(albums) {
                return self.getSongsFromAlbums(albums); // return promise array of songs
            }).then(function(albumPromises) {
                return self.getTracksFromAlbum(albumPromises); // return the songIds
            }).then(function(trackIds) {
                defer.resolve(self.getAudioInformation(trackIds)); // resolve initial promise
            }),
            function(errResponse) {
                console.error(errResponse);
            };

        return defer.promise; // return array of audio_information for each track
    };


    /**
     * 
     **/
    self.getSongsByTitle = function(access_token, song_title) {

        var defer = $q.defer();

        self.search(access_token, song_title, 'track').then(function(songs) {
            return songs;
        }).then(function(songs) {
            defer.resolve(self.getAudioInformation(songs));
        });

        return defer.promise;
    };

    /**
     * get the access token to harness metadata api
     * @return {defer.promise} the access token needed to authenticate to Spotify
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