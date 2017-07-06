var metronomeApp = angular.module('metronomeApp', ['ngRoute']);

metronomeApp.controller('MainCtrl', ['$scope', 'SubdivService', function($scope, SubdivService) {

    var self = this;
    var currentButtonIndex = 0;

    $scope.tempo = { value: 60 };
    $scope.style = 'plain';
    $scope.message = { value: '' };
    $scope.notes = SubdivService.getNotes();
    $scope.selectedNote = SubdivService.getSelectedNote();
    $scope.minTempo = 40;
    $scope.maxTempo = 208;

    $scope.startStopButtons = [
        { label: 'start', class: 'fa fa-play fa-2x', selected: 'NO' },
        { label: 'stop', class: 'fa fa-stop fa-2x', selected: 'NO' }
    ]

    $scope.buttonClass = $scope.startStopButtons[0].class;

    self.getNoteClass = function(status) {
        return {
            selectedNote: status,
            notSelectedNote: !status
        };
    };

    self.changeStartStop = function() {
        currentButtonIndex = (currentButtonIndex + 1) % ($scope.startStopButtons.length);
        $scope.buttonClass = $scope.startStopButtons[currentButtonIndex].class;
    };

    $scope.$watch('tempo.value', function(val) {
        $scope.message.value = '';
        bpm = $scope.tempo.value;
    }, true);
}]);

metronomeApp.controller('SubdivController', ['$scope', 'SubdivService', function($scope, SubdivService) {

    var noteIndex = 0;

    $scope.changeSubDiv = function() {
        SubdivService.changeSubDiv();
    }

    $scope.subDiv = function(value) {
        SubdivService.subDiv();
    };
}]);

metronomeApp.controller('TapTempo', ['$scope', function($scope) {

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
        } else if (count >= 4 && timeElapsed < timeExceeded) {

            clicks.push(new Date());

            for (var i = 1; i < clicks.length; i++) {

                sum += clicks[i] - clicks[i - 1];

                if (i == clicks.length - 1) {
                    timeElapsed = clicks[i] - clicks[i - 1];
                }
            }

            if (timeElapsed < timeExceeded) {
                average = 60000 / ((sum / (clicks.length - 1)));

                if (average >= 40 && average <= 208) {
                    $scope.tempo.value = Math.round(average);
                } else if (average > 208) {
                    $scope.tempo.value = 208;
                } else {
                    $scope.tempo.value = 40;
                }
            } else {

                count = 0;
                timeElapsed = 0;
                clicks = [];

            }

            sum = 0;
            clicks.splice(0, 1);

        }
    };
}]);

metronomeApp.controller('APIController', ['$scope', 'RESTService', '$location', 'FormService',
    function($scope, RESTService, $location, FormService) {

        $scope.items = [];
        $scope.artistCheckBox = false;
        $scope.songTitleCheckBox = false;

        $scope.$watch('message', function() {
            if ($scope.message.value === '' && $location.url() === '/listings')
                $location.path('/');
        }, true);

        $scope.changeRoute = function(type) {

            switch (type) {
                case 'song':
                    $location.path('/song_tempo_selection');
                    $scope.artistCheckBox = false;
                    break;
                case 'notSong':
                case 'notArtist':
                    $location.path('/');
                    break;
                case 'artist':
                    $scope.songTitleCheckBox = false;
                    $location.path('/artist_tempo_selection');
                    break;
            }
        };

        $scope.doSearch = function() {

            if ($scope.songTitleCheckBox)
                $location.path('/song_tempo_selection');
            else
                $location.path('/artist_tempo_selection');
        }

        $scope.getSongsByArtist = function() {

                $scope.message = '';
                $scope.items = [];
                FormService.clearTrackInfo();

                RESTService.getAccessToken().then(function(response) {
                    RESTService.getSongsByArtist(response, FormService.getArtist()).then(function(response2) {
                        if (response2[0] == null) {
                            $scope.message = 'No artist found.';
                        } else {
                            var tempo = FormService.getTempo();
                            var minTempo = tempo - 5;
                            var maxTempo = tempo + 5;

                            for (var key in FormService.getKeys()) {

                                var obj = FormService.getTrackInfo(key);
                                if (obj.tempo >= minTempo && obj.tempo <= maxTempo) {
                                    $scope.items.push(obj);
                                } else {
                                    continue;
                                }

                            } // end for loop
                        } // end if/else
                    }); // end inner promise
                }); // end outer promise
            } // end method getSongsByArtist

        $scope.getSongsByTitle = function() {

            $scope.message = '';
            $scope.items = [];
            FormService.clearTrackInfo();

            RESTService.getAccessToken().then(function(response) {
                RESTService.getSongsByTitle(response, FormService.getSongTitle()).then(function(songInfo) {
                    console.log(songInfo);
                    for (var key in FormService.getKeys()) {
                        var obj = FormService.getTrackInfo(key);
                        $scope.items.push(obj);
                    } // end for loop
                });
            });
        }; // end method getSongsByTitle
    }
]);

metronomeApp.controller('FormController', ['FormService', '$location', '$scope',
    function(FormService, $location, $scope) {

        $scope.submitArtist = function() {

            FormService.setArtist($scope.artist);
            FormService.setTempo($scope.tempo);

            $scope.getSongsByArtist();

            $location.path('/listings');

        };

        $scope.submitSong = function() {

            FormService.setSongTitle($scope.song_title);

            $scope.getSongsByTitle();

            $location.path('/listings');

        };
    }
]);