'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'lisztfm';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'spotify', 'smart-table', 'angularSoundManager', 'sticky'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('playlists');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// // Home state routing
		// $stateProvider.
		// state('home', {
		// 	url: '/',
		// 	templateUrl: 'modules/core/views/signin.client.view'
		// });
	}
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', 'Authentication', 'Menus',
	function($scope, $location, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		// $scope.menu = Menus.getMenu('topbar');

		$scope.isActive = function(viewLocation) {
    	return viewLocation === $location.path();
		};

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);

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

'use strict';

angular.module('core').controller('LayoutController', ['$scope', '$location',
		function($scope, $location) {

			$scope.showHeader = function() {
				var header_pages = ['/playlists'];
				if (header_pages.indexOf($location.path()) >= 0) {
					return true;
				} else {
					return false;
				}
			};
		}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Playlists module
angular.module('playlists', ['spotify','smart-table', 'angularSoundManager', 'sticky']).run(function( ){
  //Tests for alertify
  // Alertify.success('Successfully submitted activity!');
  // Alertify.error('Activity not submitted...contact support!');
	}
);

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

'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {


		$scope.playlists = [];
		$scope.playlistsReady = false;
		$scope.tracksReady = false;
		$scope.currentPlaylist = '';
		$scope.tracks = [];
		$scope.displayedTracks = [];
		$scope.tracksToDelete = [];
		$scope.deleteTracks = 0;
		$scope.currentUser = $window.user;
		$scope.currentTrack = '';
		$scope.search_subject =
		$scope.search_type = 'search';


		$scope.playlist_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};

		$scope.track_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' +  $scope.currentPlaylist.id + '/tracks',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};

		$scope.search_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/search?q=',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};


		$scope.getSearchResults = function (keyEvent){
			if (keyEvent.which === 13){
				$scope.search_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/search?q=' + $scope.search_subject.split('%20') + '&type=' + $scope.search_type,
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};

				console.log($scope.search_req);

				$http($scope.search_req).
					success(function (res){
						console.log(res);
					}).
					error(function (res){
						console.log(res);
					});

			}

		};



		$scope.getPlaylists = function(){
			//Get current user's spotify playlists

			$http($scope.playlist_req).
				success(function(res){
					$scope.playlists.push.apply($scope.playlists, res.items);

					if (res.next !== null){
						$scope.playlist_req.url = res.next;
						$scope.getPlaylists();
					}
					else{
						$scope.playlistsReady = true;
					}
				}).
				error(function(err){
					//TODO: more efficient refreshing
				});
		};

		$http.get('/auth/refresh').
			success(function(resp){
				$window.user.providerData.accessToken = resp.token;
				$scope.playlist_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists',
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};

				$scope.track_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' +  $scope.currentPlaylist.id + '/tracks',
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};

				$scope.getPlaylists();
			});


		$scope.getTracks = function(req){
			//Get current user's spotify playlists
			$http(req).
				success(function(res){
					var trax = res.items;
					for (var i in trax){
						var artist = [];
						var added_by = '';
						for (var x in trax[i].track.artists){
								artist.push(trax[i].track.artists[x].name);
							}
						if (trax[i].added_by !== null){
							added_by = trax[i].added_by.id;
						}

						var track = {
							'playlist_id': $scope.currentPlaylist.id,
							'added': trax[i].added_at,
							'added_by': added_by,
							'title': trax[i].track.name,
							'popularity': trax[i].track.popularity,
							'external_url': trax[i].track.external_urls.spotify,
							'api_url': trax[i].track.href,
							'url': trax[i].track.preview_url,
							'id': trax[i].track.id,
							'explicit': trax[i].track.explicit,
							'duration': trax[i].track.duration_ms,
							'album': trax[i].track.album.name,
							'artist': artist.join(),
							'rating': 1
						};
						$scope.tracks.push(track);
					}

					if (res.next !== null){
						req.url = res.next;
						$scope.getTracks(req);
					}
					else{
						$scope.tracksReady = true;
					}
				}).
				error(function(err){

				});
		};



		$scope.getCurrentPlaylist = function(plist){
			if ($scope.currentPlaylist.name !== plist.name){
				$scope.tracks = [];
				$scope.tracksToDelete = [];
				$scope.track_req.url = 'https://api.spotify.com/v1/users/' + plist.owner.id + '/playlists/' +  plist.id + '/tracks';
				$scope.getTracks($scope.track_req);

				$scope.currentPlaylist = {
					'id': plist.id,
					'name': plist.name,
					'collaborative': plist.collaborative,
					'track_total': plist.tracks.total,
					'images': plist.images,
					'external_url': plist.external_urls.spotify,
					'owner': plist.owner.id,
					'snapshots': [],
				};

				$http.post('/user/playlist/get', $scope.currentPlaylist).
					success(function(resp){
						$scope.currentPlaylist.snapshots = resp.snapshots;
					}).
					error(function(resp){
						var snap = {
							'id': plist.snapshot_id,
							'created': new Date(),
							'note': 'Imported playlist to liszt.fm',
						};

						$scope.currentPlaylist.snapshots.push(snap);
					});

			}
		};


		$scope.trackSelected = function(track){
			console.log(track);
			$scope.currentTrack = 'https://embed.spotify.com/?uri=spotify:track:' + track.id;
		};

		// $scope.changeRating = function(track) {
		// 	if (track.rating === 2) {
		// 		track.rating = 0;
		// 	}
		// 	else{
		// 		track.rating++;
		// 	}
		// };




		$scope.removeTrack = function(track){
			var track_uri = 'spotify:track:' + track.id;
			var found = false;

			for (var i = 0; i < $scope.tracksToDelete.length; i++){
				if ($scope.tracksToDelete[i].uri === track_uri){
					found = true;
					$scope.tracksToDelete.splice(i, 1);
					track.edited = false;
					break;
				}
			}

			if (found === false){
				var trak = {
					'uri': track_uri,
					'artist': track.artist,
					'title': track.title,
				};
				$scope.tracksToDelete.push(trak);
				track.edited = true;
			}
		};

		$scope.deleteTracksNow = function(){
			var req = {
				 method: 'DELETE',
				 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' + $scope.tracks[0].playlist_id + '/tracks',
				 headers: {
					 'Authorization': 'Bearer ' + $window.user.providerData.accessToken,
					 'Content-Type': 'application/json'
				 },
				 data: {
					 'tracks' : $scope.tracksToDelete
				 }
			};

			$http(req).
				success(function (res){
					var deletedTracks = [];
					for (var k in $scope.tracksToDelete){
						var str = $scope.tracksToDelete[k].title + ' by ' + $scope.tracksToDelete[k].artist;
						deletedTracks.push(str);
					}
					var snap = {
						'id': res.snapshot_id,
						'created': new Date(),
						'note': 'Deleted ' + $scope.tracksToDelete.length + ' tracks (' + deletedTracks.join() + ') from ' + $scope.currentPlaylist.name
					};
					$scope.tracksToDelete = [];
					$scope.currentPlaylist.snapshots.push(snap);

					$http.post('/user/playlist/add', $scope.currentPlaylist).
						success(function(res){
							$state.reload();
						}).
						error(function(res){
							console.log('Error updating playlist in database');
						});
				}).
				error(function (res){

				});

		};

	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', '$window', 'Authentication',
	function($scope, $http, $location, $window, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if($window.user !== '') {
			$location.path('/playlists');
		}

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/playlists');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);