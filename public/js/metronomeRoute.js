metronomeApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        template: ''
    })
    .when('/selection', {
        templateUrl: 'form.html'
    })
    .when('/listings', {    
    	templateUrl: 'listings.html'
    })
	.otherwise({redirectTo: '/'});
}]);