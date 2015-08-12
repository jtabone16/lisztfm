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


//Whitelisting Spotify embed URLs
angular.module('playlists').config(['$sceDelegateProvider',
	function($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist(['self','https://embed.spotify.com/**']);
	},
]);
