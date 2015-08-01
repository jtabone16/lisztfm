'use strict';


angular.module('core').controller('HomeController', ['$scope', '$window', '$location', 'Authentication',
	function($scope, $window, $location, Authentication) {

		//redirect to playlists after you login by clicking link to login....TODO: lol clean this up
		if($window.user) {
			$location.path('/playlists');
		}

		// This provides Authentication context.
		$scope.authentication = Authentication;
	}
]);
