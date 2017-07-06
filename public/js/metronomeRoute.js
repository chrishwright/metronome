metronomeApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
            template: ''
        })
        .when('/artist_tempo_selection', {
            templateUrl: 'songs_by_artist_form.html'
        })
        .when('/song_tempo_selection', {
            templateUrl: 'songs_by_title_form.html'
        })
        .when('/listings', {
            templateUrl: 'listings.html'
        })
        .otherwise({ redirectTo: '/' });
}]);