'use strict';

//Setting up route
angular.module('playlists').config(['$stateProvider',
	function($stateProvider) {
		// Playlists state routing
		$stateProvider.
		state('playlists', {
			url: '/playlists',
			templateUrl: 'modules/playlists/views/playlists.client.view.html'
		});
	}
]);
